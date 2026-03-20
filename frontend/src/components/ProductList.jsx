import { ProductCard } from './ProductCard.jsx';

export function ProductList({ products, onEdit, onDelete, busy }) {
  if (!products.length) {
    return (
      <section className="panel panel--list empty-state">
        <p className="eyebrow">No products yet</p>
        <h2>Your catalog is ready for its first product.</h2>
        <p>
          Add an item using the form to verify the full CRUD flow between the
          React frontend and Express API.
        </p>
      </section>
    );
  }

  return (
    <section className="panel panel--list">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Inventory overview</p>
          <h2>Current product list</h2>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            busy={busy}
            key={product.id}
            onDelete={onDelete}
            onEdit={onEdit}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
