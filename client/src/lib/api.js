const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('strata_token');
  const storedUser = localStorage.getItem('strata_user');
  let userId = null;
  if (storedUser) {
    try {
      userId = JSON.parse(storedUser).id;
    } catch {}
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
    ...options.headers
  };

  if (options.body && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const api = {
  get: (url, options = {}) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => apiRequest(url, { ...options, method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  put: (url, data, options = {}) => apiRequest(url, { ...options, method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }),
  delete: (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' })
};

export default api;
