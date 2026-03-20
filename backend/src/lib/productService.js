const prisma = require('./prisma');

function buildFilter(filters = {}) {
  const where = {};

  if (filters.storeOnly) {
    where.active = true;
    where.stock = { gt: 0 };
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { colorway: { contains: searchTerm } },
        { aesthetic: { contains: searchTerm } }
      ];
    }
  }

  if (filters.aesthetic) {
    where.aesthetic = filters.aesthetic;
  }

  if (filters.colorway) {
    where.colorway = filters.colorway;
  }

  return where;
}

async function listProducts(filters = {}) {
  const where = buildFilter(filters);

  return prisma.product.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }]
  });
}

async function getProduct(productId) {
  return prisma.product.findUnique({
    where: { id: productId }
  });
}

async function createProduct(productData) {
  return prisma.product.create({
    data: productData
  });
}

async function updateProduct(productId, productData) {
  return prisma.product.update({
    where: { id: productId },
    data: productData
  });
}

async function deleteProduct(productId) {
  return prisma.product.delete({
    where: { id: productId }
  });
}

async function getAdminDashboard() {
  const [totalProducts, activeProducts, lowStockProducts, totalOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { stock: { lte: 6 } } }),
      prisma.shopOrder.count()
    ]);

  const recentProducts = await prisma.product.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  return {
    totals: {
      products: totalProducts,
      activeProducts,
      lowStockProducts,
      orders: totalOrders
    },
    recentProducts
  };
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminDashboard
};
