const { validateProduct } = require('../../src/utils/validateProduct');

describe('validateProduct', () => {
  it('accepts a valid payload', () => {
    const result = validateProduct({
      name: 'Neon Pulse Socks',
      category: 'Crew Socks',
      description: 'Bold neon socks with plush support and breathable comfort.',
      price: 19.99,
      stock: 8,
      featured: true,
      colorway: 'Neon Pink',
      sizeRange: 'S-M-L',
      aesthetic: 'Street Pop'
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data.price).toBe(19.99);
  });

  it('returns useful validation errors for bad input', () => {
    const result = validateProduct({
      name: '',
      category: '',
      description: 'short',
      price: 0,
      stock: -1
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Name is required.',
        'Category is required.',
        'Description must be at least 12 characters long.',
        'Price must be greater than 0.',
        'Stock must be a whole number 0 or greater.'
      ])
    );
  });

  it('supports partial validation for updates', () => {
    const result = validateProduct(
      {
        stock: 12
      },
      { partial: true }
    );

    expect(result.isValid).toBe(true);
    expect(result.data).toEqual({ stock: 12 });
  });
});
