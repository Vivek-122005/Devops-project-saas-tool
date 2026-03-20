import { useEffect, useState } from 'react';

const defaultForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  stock: '',
  featured: false
};

export function ProductForm({ activeProduct, onSubmit, onCancel, busy }) {
  const [formState, setFormState] = useState(defaultForm);

  useEffect(() => {
    if (!activeProduct) {
      setFormState(defaultForm);
      return;
    }

    setFormState({
      name: activeProduct.name,
      category: activeProduct.category,
      description: activeProduct.description,
      price: String(activeProduct.price),
      stock: String(activeProduct.stock),
      featured: activeProduct.featured
    });
  }, [activeProduct]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      ...formState,
      price: Number(formState.price),
      stock: Number(formState.stock)
    });
  }

  return (
    <section className="panel panel--form">
      <div className="panel__header">
        <div>
          <p className="eyebrow">
            {activeProduct ? 'Edit product' : 'Add product'}
          </p>
          <h2>{activeProduct ? 'Update an item' : 'Create a new listing'}</h2>
        </div>
        {activeProduct ? (
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancel edit
          </button>
        ) : null}
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <label>
          Product name
          <input
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="Aurora Backpack"
            required
          />
        </label>

        <label>
          Category
          <input
            name="category"
            value={formState.category}
            onChange={handleChange}
            placeholder="Travel"
            required
          />
        </label>

        <label className="product-form__full">
          Description
          <textarea
            name="description"
            value={formState.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe why shoppers would choose this product."
            required
          />
        </label>

        <label>
          Price
          <input
            min="0"
            name="price"
            onChange={handleChange}
            step="0.01"
            type="number"
            value={formState.price}
            required
          />
        </label>

        <label>
          Stock
          <input
            min="0"
            name="stock"
            onChange={handleChange}
            step="1"
            type="number"
            value={formState.stock}
            required
          />
        </label>

        <label className="checkbox">
          <input
            checked={formState.featured}
            name="featured"
            onChange={handleChange}
            type="checkbox"
          />
          Featured product
        </label>

        <button className="primary-button product-form__submit" disabled={busy}>
          {busy ? 'Saving...' : activeProduct ? 'Update product' : 'Add product'}
        </button>
      </form>
    </section>
  );
}
