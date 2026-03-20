const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/+$/, '');

function buildRequestUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (API_URL.endsWith('/api') && normalizedPath.startsWith('/api')) {
    return `${API_URL.slice(0, -4)}${normalizedPath}`;
  }

  return `${API_URL}${normalizedPath}`;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(buildRequestUrl(path), {
    headers,
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({
      message: 'Request failed'
    }));

    const firstError = Array.isArray(payload.errors)
      ? payload.errors[0]
      : payload.message;

    throw new Error(firstError || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getStoreProducts(filters = {}) {
  const params = new URLSearchParams({ scope: 'store' });

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.aesthetic) {
    params.set('aesthetic', filters.aesthetic);
  }

  return request(`/api/products?${params.toString()}`);
}

export async function getAdminProducts(adminKey) {
  return request('/api/admin/products', {
    headers: { 'x-admin-key': adminKey }
  });
}

export async function createAdminProduct(adminKey, payload) {
  return request('/api/admin/products', {
    method: 'POST',
    headers: { 'x-admin-key': adminKey },
    body: JSON.stringify(payload)
  });
}

export async function updateAdminProduct(adminKey, id, payload) {
  return request(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'x-admin-key': adminKey },
    body: JSON.stringify(payload)
  });
}

export async function deleteAdminProduct(adminKey, id) {
  return request(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey }
  });
}

export async function getAdminDashboard(adminKey) {
  return request('/api/admin/dashboard', {
    headers: { 'x-admin-key': adminKey }
  });
}

export async function getAdminOrders(adminKey) {
  return request('/api/admin/orders', {
    headers: { 'x-admin-key': adminKey }
  });
}

export async function updateAdminOrderStatus(adminKey, id, status) {
  return request(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'x-admin-key': adminKey },
    body: JSON.stringify({ status })
  });
}

export async function placeOrder(payload) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
