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

- Health: `GET http://localhost:5001/api/health`

### Storefront APIs (Public)

- `GET /api/products` list products
- `GET /api/products?scope=store` list active/in-stock products for customers
- `GET /api/products/:id` get single product
- `POST /api/orders` place order
- `GET /api/orders/:id` get single order

### Admin APIs (Require `x-admin-key`)

- `GET /api/admin/dashboard` admin summary counters
- `GET /api/admin/products` list products
- `POST /api/admin/products` create product
- `PUT /api/admin/products/:id` update product
- `DELETE /api/admin/products/:id` delete product
- `GET /api/admin/orders` list all orders
- `GET /api/admin/orders/:id` get order details
- `PATCH /api/admin/orders/:id/status` update order status (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
- `DELETE /api/admin/orders/:id` delete order (restocks inventory when needed)

## Examiner Demo Flow

1. Create a product from admin API.
2. Confirm it appears in `/api/products?scope=store`.
3. Place an order from `/api/orders`.
4. Update or cancel order from admin API.
5. Show stock auto-decrements on order and restocks on cancellation/deletion.
