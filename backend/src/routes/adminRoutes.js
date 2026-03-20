const express = require('express');

const { getDashboard } = require('../controllers/adminController');
const {
  getOrder,
  listOrders,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

router.use(requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
