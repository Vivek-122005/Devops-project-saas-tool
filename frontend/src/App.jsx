import { useEffect, useMemo, useState } from 'react';
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminDashboard,
  getAdminOrders,
  getAdminProducts,
  getStoreProducts,
  placeOrder,
  updateAdminOrderStatus,
  updateAdminProduct
} from './lib/api.js';

const initialProductForm = {
  name: '',
  category: 'Crew Socks',
  description: '',
  price: '',
  stock: '',
  featured: false,
  colorway: '',
  sizeRange: 'S-M-L',
  aesthetic: '',
  imageUrl: '',
  active: true
};

const initialCheckout = {
  customerName: '',
  email: '',
  address: ''
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function parseSizes(sizeRange) {
  if (!sizeRange) {
    return ['M'];
  }

  return sizeRange
    .split('-')
    .map((size) => size.trim())
    .filter(Boolean);
}

function App() {
  const [view, setView] = useState('shop');
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeLoading, setStoreLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [checkoutForm, setCheckoutForm] = useState(initialCheckout);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lastOrder, setLastOrder] = useState(null);

  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(initialProductForm);

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal >= 60 || subtotal === 0 ? 0 : 7.5;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      total: Number((subtotal + shipping).toFixed(2))
    };
  }, [cartItems]);

  async function loadStoreProducts(search = '') {
    setStoreLoading(true);
    try {
      const payload = await getStoreProducts({ search });
      setStoreProducts(payload.items);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setStoreLoading(false);
    }
  }

  useEffect(() => {
    loadStoreProducts();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStoreProducts(storeSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [storeSearch]);

  async function loadAdminData(key) {
    const [productsPayload, ordersPayload, dashboardPayload] = await Promise.all([
      getAdminProducts(key),
      getAdminOrders(key),
      getAdminDashboard(key)
    ]);

    setAdminProducts(productsPayload.items);
    setAdminOrders(ordersPayload.items);
    setAdminDashboard(dashboardPayload);
  }

  function addToCart(product, size) {
    const chosenSize = size || parseSizes(product.sizeRange)[0] || 'M';

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === product.id && item.size === chosenSize
      );

      if (existingItem) {
        return currentItems.map((item) => {
          if (item.id !== existingItem.id) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(item.quantity + 1, product.stock)
          };
        });
      }

      return [
        ...currentItems,
        {
          id: `${product.id}-${chosenSize}`,
          productId: product.id,
          name: product.name,
          size: chosenSize,
          quantity: 1,
          price: product.price,
          maxStock: product.stock
        }
      ];
    });

    setMessage({
      type: 'success',
      text: `${product.name} (${chosenSize}) added to cart.`
    });
  }

  function updateCartQuantity(itemId, nextQuantity) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.max(1, Math.min(Number(nextQuantity), item.maxStock))
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeCartItem(itemId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  }

  async function submitCheckout(event) {
    event.preventDefault();

    if (cartItems.length === 0) {
      setMessage({ type: 'error', text: 'Your cart is empty.' });
      return;
    }

    setCheckoutBusy(true);
    try {
      const order = await placeOrder({
        ...checkoutForm,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size
        }))
      });

      setLastOrder(order);
      setCartItems([]);
      setCheckoutForm(initialCheckout);
      setMessage({
        type: 'success',
        text: `Order #${order.id} placed successfully.`
      });
      await loadStoreProducts(storeSearch);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setCheckoutBusy(false);
    }
  }

  async function loginAdmin(event) {
    event.preventDefault();
    if (!adminKeyInput.trim()) {
      return;
    }

    setAdminBusy(true);
    try {
      await loadAdminData(adminKeyInput.trim());
      setAdminKey(adminKeyInput.trim());
      setMessage({ type: 'success', text: 'Admin panel unlocked.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setAdminBusy(false);
    }
  }

  function beginEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      featured: product.featured,
      colorway: product.colorway || '',
      sizeRange: product.sizeRange || 'S-M-L',
      aesthetic: product.aesthetic || '',
      imageUrl: product.imageUrl || '',
      active: product.active
    });
  }

  function resetProductForm() {
    setEditingProduct(null);
    setProductForm(initialProductForm);
  }

  async function submitProduct(event) {
    event.preventDefault();
    if (!adminKey) {
      return;
    }

    setAdminBusy(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock)
      };

      if (editingProduct) {
        await updateAdminProduct(adminKey, editingProduct.id, payload);
        setMessage({ type: 'success', text: 'Product updated.' });
      } else {
        await createAdminProduct(adminKey, payload);
        setMessage({ type: 'success', text: 'Product created.' });
      }

      await Promise.all([loadAdminData(adminKey), loadStoreProducts(storeSearch)]);
      resetProductForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setAdminBusy(false);
    }
  }

  async function removeProduct(productId) {
    if (!adminKey) {
      return;
    }

    setAdminBusy(true);
    try {
      await deleteAdminProduct(adminKey, productId);
      setMessage({ type: 'success', text: 'Product deleted.' });
      await Promise.all([loadAdminData(adminKey), loadStoreProducts(storeSearch)]);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setAdminBusy(false);
    }
  }

  async function changeOrderStatus(orderId, status) {
    if (!adminKey) {
      return;
    }

    setAdminBusy(true);
    try {
      await updateAdminOrderStatus(adminKey, orderId, status);
      await loadAdminData(adminKey);
      setMessage({ type: 'success', text: `Order #${orderId} updated.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setAdminBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <div className="grain-overlay" />
      <div className="layout">
        <header className="topbar">
          <div>
            <p className="eyebrow">Aesthetic Sock Commerce</p>
            <h1>Sock Aura Atelier</h1>
          </div>
          <nav className="topbar__actions">
            <button
              className={view === 'shop' ? 'tab-button tab-button--active' : 'tab-button'}
              onClick={() => setView('shop')}
              type="button"
            >
              Shop
            </button>
            <button
              className={view === 'admin' ? 'tab-button tab-button--active' : 'tab-button'}
              onClick={() => setView('admin')}
              type="button"
            >
              Admin Panel
            </button>
          </nav>
        </header>

        {message.text ? (
          <p className={`flash flash--${message.type || 'info'}`}>{message.text}</p>
        ) : null}

        {view === 'shop' ? (
          <section className="shop-view">
            <section className="hero">
              <div>
                <p className="eyebrow">Trend-Led Socks</p>
                <h2>Streetwear, pastel, retro and luxe socks for everyday style.</h2>
                <p>
                  Explore statement socks with curated colorways and aesthetics,
                  add sizes to cart, and checkout instantly.
                </p>
              </div>
              <div className="hero__meta">
                <label>
                  Search collection
                  <input
                    placeholder="Try cosmic, pastel, luxe..."
                    value={storeSearch}
                    onChange={(event) => setStoreSearch(event.target.value)}
                  />
                </label>
                <div className="hero__pill">
                  <span>Items live</span>
                  <strong>{storeProducts.length}</strong>
                </div>
              </div>
            </section>

            <section className="store-layout">
              <section className="product-grid">
                {storeLoading ? (
                  <article className="card">Loading socks...</article>
                ) : null}
                {!storeLoading && storeProducts.length === 0 ? (
                  <article className="card">No products found for this search.</article>
                ) : null}
                {!storeLoading
                  ? storeProducts.map((product) => (
                      <article className="product-card" key={product.id}>
                        <div className="product-card__media">
                          {product.imageUrl ? (
                            <img alt={product.name} src={product.imageUrl} />
                          ) : (
                            <div className="image-fallback">{product.name}</div>
                          )}
                        </div>
                        <div className="product-card__body">
                          <div className="pill-row">
                            <span>{product.aesthetic}</span>
                            <span>{product.colorway}</span>
                          </div>
                          <h3>{product.name}</h3>
                          <p>{product.description}</p>
                          <div className="price-row">
                            <strong>{formatCurrency(product.price)}</strong>
                            <span>{product.stock} in stock</span>
                          </div>
                          <div className="size-row">
                            {parseSizes(product.sizeRange).map((size) => (
                              <button
                                className="size-button"
                                key={size}
                                onClick={() => addToCart(product, size)}
                                type="button"
                              >
                                Add {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))
                  : null}
              </section>

              <aside className="cart-panel">
                <h3>Cart</h3>
                {cartItems.length === 0 ? (
                  <p className="muted">No items yet.</p>
                ) : (
                  <ul className="cart-list">
                    {cartItems.map((item) => (
                      <li key={item.id}>
                        <div>
                          <strong>{item.name}</strong>
                          <p>Size {item.size}</p>
                        </div>
                        <div className="cart-list__controls">
                          <input
                            min="1"
                            max={item.maxStock}
                            type="number"
                            value={item.quantity}
                            onChange={(event) =>
                              updateCartQuantity(item.id, event.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => removeCartItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="totals">
                  <p>
                    <span>Subtotal</span>
                    <strong>{formatCurrency(cartSummary.subtotal)}</strong>
                  </p>
                  <p>
                    <span>Shipping</span>
                    <strong>{formatCurrency(cartSummary.shipping)}</strong>
                  </p>
                  <p className="totals__final">
                    <span>Total</span>
                    <strong>{formatCurrency(cartSummary.total)}</strong>
                  </p>
                </div>

                <form className="checkout-form" onSubmit={submitCheckout}>
                  <label>
                    Full name
                    <input
                      required
                      value={checkoutForm.customerName}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          customerName: event.target.value
                        }))
                      }
                    />
                  </label>
                  <label>
                    Email
                    <input
                      required
                      type="email"
                      value={checkoutForm.email}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          email: event.target.value
                        }))
                      }
                    />
                  </label>
                  <label>
                    Shipping address
                    <textarea
                      required
                      rows="3"
                      value={checkoutForm.address}
                      onChange={(event) =>
                        setCheckoutForm((current) => ({
                          ...current,
                          address: event.target.value
                        }))
                      }
                    />
                  </label>
                  <button className="primary-button" disabled={checkoutBusy}>
                    {checkoutBusy ? 'Placing order...' : 'Place Order'}
                  </button>
                </form>

                {lastOrder ? (
                  <div className="order-note">
                    <strong>Latest order: #{lastOrder.id}</strong>
                    <p>
                      Status: {lastOrder.status} | Total:{' '}
                      {formatCurrency(lastOrder.total)}
                    </p>
                  </div>
                ) : null}
              </aside>
            </section>
          </section>
        ) : null}

        {view === 'admin' ? (
          <section className="admin-view">
            {!adminKey ? (
              <form className="admin-login" onSubmit={loginAdmin}>
                <h2>Admin Access</h2>
                <p>Enter your admin key to manage sock catalog and orders.</p>
                <input
                  placeholder="x-admin-key"
                  value={adminKeyInput}
                  onChange={(event) => setAdminKeyInput(event.target.value)}
                />
                <button className="primary-button" disabled={adminBusy}>
                  {adminBusy ? 'Checking...' : 'Unlock Admin Panel'}
                </button>
              </form>
            ) : (
              <>
                <section className="stats-grid">
                  <article>
                    <span>Products</span>
                    <strong>{adminDashboard?.totals.products ?? 0}</strong>
                  </article>
                  <article>
                    <span>Active</span>
                    <strong>{adminDashboard?.totals.activeProducts ?? 0}</strong>
                  </article>
                  <article>
                    <span>Low Stock</span>
                    <strong>{adminDashboard?.totals.lowStockProducts ?? 0}</strong>
                  </article>
                  <article>
                    <span>Orders</span>
                    <strong>{adminDashboard?.totals.orders ?? 0}</strong>
                  </article>
                </section>

                <section className="admin-layout">
                  <form className="admin-product-form card" onSubmit={submitProduct}>
                    <h3>{editingProduct ? 'Edit Sock Product' : 'Create Sock Product'}</h3>
                    <input
                      placeholder="Name"
                      required
                      value={productForm.name}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          name: event.target.value
                        }))
                      }
                    />
                    <input
                      placeholder="Category"
                      required
                      value={productForm.category}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          category: event.target.value
                        }))
                      }
                    />
                    <textarea
                      placeholder="Description"
                      required
                      rows="3"
                      value={productForm.description}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          description: event.target.value
                        }))
                      }
                    />
                    <div className="grid-two">
                      <input
                        min="0"
                        placeholder="Price"
                        required
                        step="0.01"
                        type="number"
                        value={productForm.price}
                        onChange={(event) =>
                          setProductForm((current) => ({
                            ...current,
                            price: event.target.value
                          }))
                        }
                      />
                      <input
                        min="0"
                        placeholder="Stock"
                        required
                        step="1"
                        type="number"
                        value={productForm.stock}
                        onChange={(event) =>
                          setProductForm((current) => ({
                            ...current,
                            stock: event.target.value
                          }))
                        }
                      />
                    </div>
                    <div className="grid-two">
                      <input
                        placeholder="Colorway"
                        required
                        value={productForm.colorway}
                        onChange={(event) =>
                          setProductForm((current) => ({
                            ...current,
                            colorway: event.target.value
                          }))
                        }
                      />
                      <input
                        placeholder="Size Range (e.g. S-M-L)"
                        required
                        value={productForm.sizeRange}
                        onChange={(event) =>
                          setProductForm((current) => ({
                            ...current,
                            sizeRange: event.target.value
                          }))
                        }
                      />
                    </div>
                    <input
                      placeholder="Aesthetic"
                      required
                      value={productForm.aesthetic}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          aesthetic: event.target.value
                        }))
                      }
                    />
                    <input
                      placeholder="Image URL (optional)"
                      value={productForm.imageUrl}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          imageUrl: event.target.value
                        }))
                      }
                    />
                    <div className="checkbox-row">
                      <label>
                        <input
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(event) =>
                            setProductForm((current) => ({
                              ...current,
                              featured: event.target.checked
                            }))
                          }
                        />
                        Featured
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={productForm.active}
                          onChange={(event) =>
                            setProductForm((current) => ({
                              ...current,
                              active: event.target.checked
                            }))
                          }
                        />
                        Active
                      </label>
                    </div>
                    <div className="button-row">
                      <button className="primary-button" disabled={adminBusy}>
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </button>
                      {editingProduct ? (
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={resetProductForm}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </form>

                  <section className="card admin-catalog">
                    <h3>Catalog</h3>
                    <ul>
                      {adminProducts.map((product) => (
                        <li key={product.id}>
                          <div>
                            <strong>{product.name}</strong>
                            <p>
                              {product.colorway} | Stock {product.stock} |{' '}
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                          <div className="button-row">
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => beginEditProduct(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="danger-button"
                              type="button"
                              onClick={() => removeProduct(product.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </section>

                <section className="card order-board">
                  <h3>Recent Orders</h3>
                  {adminOrders.length === 0 ? (
                    <p className="muted">No orders yet.</p>
                  ) : (
                    <ul>
                      {adminOrders.map((order) => (
                        <li key={order.id}>
                          <div>
                            <strong>Order #{order.id}</strong>
                            <p>
                              {order.customerName} | {order.email} |{' '}
                              {formatCurrency(order.total)}
                            </p>
                          </div>
                          <select
                            value={order.status}
                            onChange={(event) =>
                              changeOrderStatus(order.id, event.target.value)
                            }
                          >
                            <option value="PLACED">PLACED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default App;
