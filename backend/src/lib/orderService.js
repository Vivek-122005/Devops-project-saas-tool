const prisma = require('./prisma');

const SHIPPING_RATE = 7.5;

async function createOrder(payload) {
  return prisma.$transaction(async (tx) => {
    const productIds = payload.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, active: true }
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const lineItems = [];

    for (const item of payload.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} is unavailable.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}.`);
      }

      lineItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        size: item.size
      });
    }

    const subtotal = Number(
      lineItems
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
        .toFixed(2)
    );
    const shipping = subtotal >= 60 ? 0 : SHIPPING_RATE;
    const total = Number((subtotal + shipping).toFixed(2));

    const order = await tx.shopOrder.create({
      data: {
        customerName: payload.customerName,
        email: payload.email,
        address: payload.address,
        subtotal,
        shipping,
        total,
        status: 'PLACED',
        items: {
          create: lineItems
        }
      },
      include: {
        items: true
      }
    });

    for (const item of lineItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    return order;
  });
}

async function getOrder(orderId) {
  return prisma.shopOrder.findUnique({
    where: { id: orderId },
    include: {
      items: true
    }
  });
}

async function listOrders() {
  return prisma.shopOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true
    }
  });
}

async function updateOrderStatus(orderId, status) {
  return prisma.shopOrder.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: true
    }
  });
}

module.exports = {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus
};
