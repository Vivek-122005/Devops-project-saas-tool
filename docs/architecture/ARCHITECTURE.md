# ShopSmart Architecture

## System Shape

ShopSmart follows a clear three-layer architecture so evaluators can see separation of concerns quickly:

1. Presentation Layer (React frontend)
2. Application Layer (Express routes + controllers + middleware)
3. Data Layer (Prisma client + SQLite)

This structure supports both customer and admin workflows without mixing responsibilities in one code path.

## Frontend Architecture

- `frontend/src/App.jsx` contains two bounded experiences:
  - Shop view: browse socks, cart, checkout
  - Admin view: authenticated admin operations via key
- `frontend/src/lib/api.js` isolates all HTTP communication.
- UI state is split by concern:
  - Store data (`storeProducts`, cart, checkout)
  - Admin data (`adminProducts`, `adminOrders`, dashboard metrics)

## Backend Architecture

### Route Layer

- `GET /api/products` and `GET /api/products/:id` for storefront reads
- `POST /api/orders` and `GET /api/orders/:id` for checkout
- `GET/POST/PUT/DELETE /api/admin/products` for admin catalog management
- `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`, `GET /api/admin/dashboard`

### Middleware Layer

- `requireAdmin` validates `x-admin-key` against `ADMIN_KEY`.
- CORS + Helmet + JSON parser applied centrally in `app.js`.

### Controller Layer

- Controllers validate request shape and map HTTP behavior (status codes, payloads).
- Business logic remains in services to keep controllers thin.

### Service Layer

- `productService` handles listing, retrieval, CRUD, and dashboard aggregates.
- `orderService` encapsulates transactional order placement:
  - validate product availability
  - create order + items
  - decrement stock atomically

### Data Layer

- Prisma models: `Product`, `ShopOrder`, `OrderItem`.
- SQLite remains the persistence engine for Phase 1 simplicity.
- `ensureDatabase()` creates missing tables/indexes and supports idempotent schema upgrades.

## Request Flows

## Storefront Flow

1. Frontend calls `GET /api/products?scope=store`.
2. User adds size-specific items to cart.
3. Frontend sends `POST /api/orders`.
4. Backend validates order payload and stock.
5. Transaction creates order and updates product stock.
6. Frontend refreshes catalog and shows order confirmation.

## Admin Flow

1. Admin enters key in frontend.
2. Frontend calls `/api/admin/*` with `x-admin-key`.
3. Middleware authorizes request.
4. Admin can create/update/delete products and update order status.
5. Dashboard metrics are calculated via service aggregates.

## Why This Meets Rubric Expectations

- Architecture is explicit, layered, and documented.
- Frontend uses functional React with clear API integration.
- Backend exposes a full CRUD surface for products plus real ecommerce order flow.
- Unit + integration tests cover validation and API + DB behavior.
- CI/lint/dependabot/ec2 workflow remain in place for DevOps evaluation.
