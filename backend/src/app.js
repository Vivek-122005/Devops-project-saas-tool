require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const healthRoutes = require('./routes/healthRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const publicDir = path.join(__dirname, '..', 'public');
const hasFrontendBundle = fs.existsSync(path.join(publicDir, 'index.html'));

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by ShopSmart CORS policy'));
    }
  })
);
app.use(helmet());
app.use(express.json());

if (hasFrontendBundle) {
  app.use(express.static(publicDir));

  app.get('/', (_request, response) => {
    response.sendFile(path.join(publicDir, 'index.html'));
  });

  app.get(/^\/(?!api).*/, (_request, response) => {
    response.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  app.get('/', (_request, response) => {
    response.json({
      name: 'ShopSmart API',
      status: 'running',
      modules: ['storefront', 'orders', 'admin']
    });
  });
}

app.use('/api', healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, _request, response, _next) => {
  void _next;

  if (error.message === 'Origin not allowed by ShopSmart CORS policy') {
    response.status(403).json({ message: error.message });
    return;
  }

  response.status(500).json({
    message: error.message || 'Unexpected server error'
  });
});

module.exports = app;
