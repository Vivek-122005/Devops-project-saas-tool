# Testing Strategy

## Unit Testing

- Backend: `backend/tests/unit/validateProduct.test.js`
- Frontend: `frontend/src/__tests__/App.test.jsx`

## Integration Testing

- Backend integration tests use Supertest against the Express app and a real SQLite test database.
- File: `backend/tests/integration/products.test.js`
- Coverage includes:
  - Admin-protected product CRUD
  - Public storefront listing
  - Order placement with persisted line items

## Why It Matters

The unit tests validate smaller behaviors, while the integration test proves the API works together with the database, which matches the Phase 1 rubric closely.
