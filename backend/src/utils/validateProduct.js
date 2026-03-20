function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return Boolean(value);
}

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function validateProduct(payload, options = {}) {
  const { partial = false } = options;
  const errors = [];
  const data = {};

  const hasName = Object.prototype.hasOwnProperty.call(payload, 'name');
  const hasCategory = Object.prototype.hasOwnProperty.call(payload, 'category');
  const hasDescription = Object.prototype.hasOwnProperty.call(payload, 'description');
  const hasPrice = Object.prototype.hasOwnProperty.call(payload, 'price');
  const hasStock = Object.prototype.hasOwnProperty.call(payload, 'stock');
  const hasFeatured = Object.prototype.hasOwnProperty.call(payload, 'featured');
  const hasColorway = Object.prototype.hasOwnProperty.call(payload, 'colorway');
  const hasSizeRange = Object.prototype.hasOwnProperty.call(payload, 'sizeRange');
  const hasAesthetic = Object.prototype.hasOwnProperty.call(payload, 'aesthetic');
  const hasImageUrl = Object.prototype.hasOwnProperty.call(payload, 'imageUrl');
  const hasActive = Object.prototype.hasOwnProperty.call(payload, 'active');

  if (!partial || hasName) {
    if (typeof payload.name !== 'string' || !payload.name.trim()) {
      errors.push('Name is required.');
    } else {
      data.name = payload.name.trim();
    }
  }

  if (!partial || hasCategory) {
    if (typeof payload.category !== 'string' || !payload.category.trim()) {
      errors.push('Category is required.');
    } else {
      data.category = payload.category.trim();
    }
  }

  if (!partial || hasDescription) {
    if (
      typeof payload.description !== 'string' ||
      payload.description.trim().length < 12
    ) {
      errors.push('Description must be at least 12 characters long.');
    } else {
      data.description = payload.description.trim();
    }
  }

  if (!partial || hasPrice) {
    const numericPrice = Number(payload.price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      errors.push('Price must be greater than 0.');
    } else {
      data.price = Number(numericPrice.toFixed(2));
    }
  }

  if (!partial || hasStock) {
    const numericStock = Number(payload.stock);
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      errors.push('Stock must be a whole number 0 or greater.');
    } else {
      data.stock = numericStock;
    }
  }

  if (!partial || hasFeatured) {
    data.featured = normalizeBoolean(payload.featured);
  }

  if (!partial || hasColorway) {
    const colorway = normalizeText(payload.colorway || 'Multi');

    if (colorway.length < 3) {
      errors.push('Colorway must be at least 3 characters long.');
    } else {
      data.colorway = colorway;
    }
  }

  if (!partial || hasSizeRange) {
    const sizeRange = normalizeText(payload.sizeRange || 'M-L');

    if (sizeRange.length < 2) {
      errors.push('Size range is required.');
    } else {
      data.sizeRange = sizeRange;
    }
  }

  if (!partial || hasAesthetic) {
    const aesthetic = normalizeText(payload.aesthetic || 'Classic');

    if (aesthetic.length < 3) {
      errors.push('Aesthetic style must be at least 3 characters long.');
    } else {
      data.aesthetic = aesthetic;
    }
  }

  if (!partial || hasImageUrl) {
    const imageUrl = normalizeText(payload.imageUrl || '');
    if (imageUrl) {
      data.imageUrl = imageUrl;
    } else if (!partial) {
      data.imageUrl = null;
    }
  }

  if (!partial || hasActive) {
    data.active = normalizeBoolean(
      Object.prototype.hasOwnProperty.call(payload, 'active')
        ? payload.active
        : true
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    data
  };
}

module.exports = {
  validateProduct
};
