const {
  PrismaClientKnownRequestError
} = require('@prisma/client/runtime/library');

const productService = require('../lib/productService');
const { validateProduct } = require('../utils/validateProduct');

async function listProducts(request, response, next) {
  try {
    const storeOnly = request.query.scope === 'store';
    const products = await productService.listProducts({
      storeOnly,
      search: request.query.search,
      aesthetic: request.query.aesthetic,
      colorway: request.query.colorway
    });
    response.json({
      items: products,
      total: products.length
    });
  } catch (error) {
    next(error);
  }
}

async function getProduct(request, response, next) {
  try {
    const product = await productService.getProduct(Number(request.params.id));

    if (!product) {
      response.status(404).json({ message: 'Product not found.' });
      return;
    }

    response.json(product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(request, response, next) {
  try {
    const validation = validateProduct(request.body);

    if (!validation.isValid) {
      response.status(400).json({ errors: validation.errors });
      return;
    }

    const product = await productService.createProduct(validation.data);
    response.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(request, response, next) {
  try {
    const validation = validateProduct(request.body, { partial: true });

    if (!validation.isValid) {
      response.status(400).json({ errors: validation.errors });
      return;
    }

    const product = await productService.updateProduct(
      Number(request.params.id),
      validation.data
    );

    response.json(product);
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      response.status(404).json({ message: 'Product not found.' });
      return;
    }

    next(error);
  }
}

async function deleteProduct(request, response, next) {
  try {
    await productService.deleteProduct(Number(request.params.id));
    response.status(204).send();
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      response.status(404).json({ message: 'Product not found.' });
      return;
    }

    next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
