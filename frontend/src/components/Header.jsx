export function Header() {
  return (
    <section className="hero">
      <div className="hero__copy">
        <p className="eyebrow">ShopSmart Inventory Studio</p>
        <h1>Manage products with a cleaner DevOps-ready workflow.</h1>
        <p className="hero__text">
          ShopSmart gives you a focused inventory dashboard for browsing,
          creating, updating, and deleting product entries while keeping the
          stack simple enough to demonstrate clean DevOps fundamentals.
        </p>
      </div>
      <div className="hero__panel">
        <div className="hero__metric">
          <span>API</span>
          <strong>Express + Prisma</strong>
        </div>
        <div className="hero__metric">
          <span>Database</span>
          <strong>SQLite</strong>
        </div>
        <div className="hero__metric">
          <span>Frontend</span>
          <strong>React + Vite</strong>
        </div>
      </div>
    </section>
  );
}
