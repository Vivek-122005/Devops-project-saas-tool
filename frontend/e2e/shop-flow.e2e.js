import { expect, test } from '@playwright/test';

test('customer can add socks to cart and place an order', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /Sock Aura Atelier/i })
  ).toBeVisible();

  const productCard = page.locator('.product-card', {
    has: page.getByRole('heading', { name: /Nebula Drift Crew Socks/i })
  });

  await expect(productCard).toBeVisible();
  await productCard.getByRole('button', { name: /^Add S$/ }).click();

  await expect(page.getByText(/added to cart/i)).toBeVisible();

  await page.getByLabel('Full name').fill('Rubric Student');
  await page.getByLabel('Email').fill('student@example.com');
  await page
    .getByLabel('Shipping address')
    .fill('221B Baker Street, London, United Kingdom');
  await page.getByRole('button', { name: /Place Order/i }).click();

  await expect(page.getByText(/Order #\d+ placed successfully\./)).toBeVisible();
  await expect(page.getByText(/Latest order: #\d+/)).toBeVisible();
});
