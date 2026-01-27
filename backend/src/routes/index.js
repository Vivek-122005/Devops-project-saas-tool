const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// API version prefix
const API_VERSION = '/v1';

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'SaaS Platform API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
    },
  });
});

module.exports = router;
