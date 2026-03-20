const { validateOrder } = require('../../src/utils/validateOrder');

describe('validateOrder', () => {
  it('accepts a valid order payload', () => {
    const result = validateOrder({
      customerName: 'Casey Doe',
      email: 'casey@example.com',
      address: '1600 Amphitheatre Parkway, Mountain View',
      items: [
        {
          productId: 1,
          quantity: 2,
          size: 'M'
        }
      ]
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data.items[0]).toEqual({
      productId: 1,
      quantity: 2,
      size: 'M'
    });
  });

  it('returns detailed errors for invalid order payload', () => {
    const result = validateOrder({
      customerName: 'A',
      email: 'not-an-email',
      address: 'short',
      items: [
        {
          productId: 0,
          quantity: 25,
          size: ''
        }
      ]
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Customer name is required.',
        'A valid email is required.',
        'Shipping address must be at least 12 characters long.',
        'Item 1: productId must be a positive integer.',
        'Item 1: quantity must be between 1 and 10.',
        'Item 1: size is required.'
      ])
    );
  });
});
