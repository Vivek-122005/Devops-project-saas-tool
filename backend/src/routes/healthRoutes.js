const express = require('express');

const router = express.Router();

router.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    message: 'ShopSmart backend is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
