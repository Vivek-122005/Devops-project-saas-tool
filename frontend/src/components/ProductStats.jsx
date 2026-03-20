function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function ProductStats({ products }) {
  const featuredCount = products.filter((product) => product.featured).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );

  const cards = [
    {
      label: 'Products',
      value: products.length
    },
    {
      label: 'Featured',
      value: featuredCount
    },
    {
      label: 'Units in Stock',
      value: totalStock
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(inventoryValue)
    }
  ];

  return (
    <section className="stats">
      {cards.map((card) => (
        <article className="stats__card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}
