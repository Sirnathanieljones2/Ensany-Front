export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function api(path, options = {}) {
  const token = localStorage.getItem("ensany_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}
