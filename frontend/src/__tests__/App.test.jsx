import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';

describe('App storefront', () => {
  it('renders socks products from API and lets users add to cart', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 1,
            name: 'Nebula Drift Crew Socks',
            category: 'Crew Socks',
            description:
              'Galaxy-inspired gradient socks with cushioned sole and breathable weave.',
            price: 18.99,
            stock: 10,
            featured: true,
            colorway: 'Midnight Violet',
            sizeRange: 'S-M-L',
            aesthetic: 'Cosmic',
            imageUrl: '',
            active: true
          }
        ],
        total: 1
      })
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    expect(
      screen.getByRole('heading', { name: /sock aura atelier/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/Nebula Drift Crew Socks/i).length).toBeGreaterThan(0);
    });

    await userEvent.click(screen.getByRole('button', { name: /add s/i }));

    await waitFor(() => {
      expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
      expect(screen.getByText(/size s/i)).toBeInTheDocument();
    });
  });
});
