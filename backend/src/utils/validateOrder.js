function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function normalizeLineItem(item) {
  return {
    productId: Number(item.productId),
    quantity: Number(item.quantity),
    size: typeof item.size === 'string' ? item.size.trim() : ''
  };
}

function validateOrder(payload) {
  const errors = [];

  const customerName =
    typeof payload.customerName === 'string' ? payload.customerName.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const address =
    typeof payload.address === 'string' ? payload.address.trim() : '';

  if (customerName.length < 2) {
    errors.push('Customer name is required.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email is required.');
  }

  if (address.length < 12) {
    errors.push('Shipping address must be at least 12 characters long.');
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('Order must include at least one item.');
  }

  const items = Array.isArray(payload.items)
    ? payload.items.map(normalizeLineItem)
    : [];

  items.forEach((item, index) => {
    if (!isPositiveInteger(item.productId)) {
      errors.push(`Item ${index + 1}: productId must be a positive integer.`);
    }

    if (!isPositiveInteger(item.quantity) || item.quantity > 10) {
      errors.push(`Item ${index + 1}: quantity must be between 1 and 10.`);
    }

    if (item.size.length < 1) {
      errors.push(`Item ${index + 1}: size is required.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      customerName,
      email,
      address,
      items
    }
  };
}

module.exports = {
  validateOrder
};
