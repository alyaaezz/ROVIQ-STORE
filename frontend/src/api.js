const API = "http://localhost:5000/api";

export function getAdminToken() {
  return localStorage.getItem("admin_token");
}

export function getCustomerToken() {
  return localStorage.getItem("customer_token");
}

// Keep compatibility with any older code
export function getToken() {
  return getAdminToken();
}

export async function api(path, options = {}) {
  const adminToken = getAdminToken();
  const customerToken = getCustomerToken();

  const token = customerToken || adminToken;

  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export { API };