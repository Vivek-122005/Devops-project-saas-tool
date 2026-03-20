const {
  PrismaClientKnownRequestError
} = require('@prisma/client/runtime/library');

const orderService = require('../lib/orderService');
const { validateOrder } = require('../utils/validateOrder');

async function createOrder(request, response, next) {
  try {
    const validation = validateOrder(request.body);

    if (!validation.isValid) {
      response.status(400).json({ errors: validation.errors });
      return;
    }

    const order = await orderService.createOrder(validation.data);
    response.status(201).json(order);
  } catch (error) {
    if (error.message.includes('stock') || error.message.includes('unavailable')) {
      response.status(409).json({ message: error.message });
      return;
    }

    next(error);
  }
}

async function getOrder(request, response, next) {
  try {
    const order = await orderService.getOrder(Number(request.params.id));

    if (!order) {
      response.status(404).json({ message: 'Order not found.' });
      return;
    }

    response.json(order);
  } catch (error) {
    next(error);
  }
}

async function listOrders(_request, response, next) {
  try {
    const orders = await orderService.listOrders();
    response.json({
      items: orders,
      total: orders.length
    });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(request, response, next) {
  try {
    const status =
      typeof request.body.status === 'string' ? request.body.status.trim() : '';
    const allowedStatuses = [
      'PLACED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!allowedStatuses.includes(status)) {
      response.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
      return;
    }

    const order = await orderService.updateOrderStatus(
      Number(request.params.id),
      status
    );
    response.json(order);
  } catch (error) {
    if (error.code === 'ORDER_NOT_FOUND') {
      response.status(404).json({ message: 'Order not found.' });
      return;
    }

    if (error.code === 'INVALID_STATUS_TRANSITION') {
      response.status(400).json({ message: error.message });
      return;
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      response.status(404).json({ message: 'Order not found.' });
      return;
    }

    next(error);
  }
}

async function deleteOrder(request, response, next) {
  try {
    await orderService.deleteOrder(Number(request.params.id));
    response.status(204).send();
  } catch (error) {
    if (error.code === 'ORDER_NOT_FOUND') {
      response.status(404).json({ message: 'Order not found.' });
      return;
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      response.status(404).json({ message: 'Order not found.' });
      return;
    }

    next(error);
  }
}

module.exports = {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  deleteOrder
};
