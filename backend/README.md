# ShopSmart Backend

The backend is an Express API for a socks ecommerce platform. It supports storefront product browsing, order placement, and admin operations for catalog and orders.

## Commands

```bash
npm install
npm run prisma:generate
npm run db:init
npm run db:seed
npm run dev
```

## Local API

- Health: `http://localhost:5001/api/health`
- Store products: `http://localhost:5001/api/products?scope=store`
- Orders: `POST http://localhost:5001/api/orders`
- Admin products: `http://localhost:5001/api/admin/products` with `x-admin-key`
