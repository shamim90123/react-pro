const BASE = import.meta.env.VITE_API_BASE;

/**
 * Replace this with your real auth store.
 * E.g., read from localStorage or a global auth context.
 */
function getToken() {
  return localStorage.getItem("auth_token") || "";
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err?.message) msg = err.message;
    } catch {}
    throw new Error(msg);
  }
  // Laravel paginated LIST uses JSON object; CREATE returns lead object
  return res.status === 204 ? null : res.json();
}

/** Leads API **/
export const LeadsApi = {
  list: ({ page = 1, perPage = 10, q = "" } = {}) =>
    apiFetch(`/leads?page=${page}&per_page=${perPage}${q ? `&q=${encodeURIComponent(q)}` : ""}`, {
      method: "GET",
    }),

  create: (payload) =>
    apiFetch(`/leads`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  remove: (id) =>
    apiFetch(`/leads/${id}`, {
      method: "DELETE",
    }),
};
