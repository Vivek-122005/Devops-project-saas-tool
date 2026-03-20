const express = require('express');

const { getDashboard } = require('../controllers/adminController');
const { listOrders, updateOrderStatus } = require('../controllers/orderController');
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
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
