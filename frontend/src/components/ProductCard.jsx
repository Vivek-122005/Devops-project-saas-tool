function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function ProductCard({ product, onEdit, onDelete, busy }) {
  return (
    <article className="product-card">
      <div className="product-card__top">
        <div>
          <div className="product-card__meta">
            <span>{product.category}</span>
            {product.featured ? <span>Featured</span> : null}
          </div>
          <h3>{product.name}</h3>
        </div>
        <strong>{formatCurrency(product.price)}</strong>
      </div>

      <p>{product.description}</p>

      <div className="product-card__footer">
        <span>{product.stock} units available</span>
        <div className="product-card__actions">
          <button
            className="ghost-button"
            disabled={busy}
            onClick={() => onEdit(product)}
            type="button"
          >
            Edit
          </button>
          <button
            className="danger-button"
            disabled={busy}
            onClick={() => onDelete(product.id)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
