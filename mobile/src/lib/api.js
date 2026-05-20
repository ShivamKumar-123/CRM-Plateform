import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const ACCESS_KEY = "crm_access";
const REFRESH_KEY = "crm_refresh";
const USER_KEY = "crm_username";

export const tokenStore = {
  async getAccess() {
    return AsyncStorage.getItem(ACCESS_KEY);
  },
  async getRefresh() {
    return AsyncStorage.getItem(REFRESH_KEY);
  },
  async getUsername() {
    return AsyncStorage.getItem(USER_KEY);
  },
  async set({ access, refresh, username }) {
    const pairs = [];
    if (access !== undefined) pairs.push([ACCESS_KEY, access || ""]);
    if (refresh !== undefined) pairs.push([REFRESH_KEY, refresh || ""]);
    if (username !== undefined) pairs.push([USER_KEY, username || ""]);
    if (pairs.length) await AsyncStorage.multiSet(pairs);
  },
  async clear() {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, USER_KEY]);
  },
};

async function refreshAccessToken() {
  const refresh = await tokenStore.getRefresh();
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    await tokenStore.clear();
    return null;
  }
  const data = await res.json();
  await tokenStore.set({ access: data.access });
  return data.access;
}

async function request(path, { method = "GET", body, headers = {}, retry = true } = {}) {
  const access = await tokenStore.getAccess();
  const finalHeaders = { ...headers };
  if (access) finalHeaders["Authorization"] = `Bearer ${access}`;
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry && (await tokenStore.getRefresh())) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return request(path, { method, body, headers, retry: false });
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const text = await res.text();
  const data = text ? safeParse(text) : null;

  if (!res.ok) {
    const err = new Error(data?.detail || data?.error || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  login: (username, password, otp) => {
    const body = { username, password };
    if (otp) body.otp = otp;
    return request("/api/token/", { method: "POST", body });
  },
  refresh: refreshAccessToken,

  // Current user (with nested organization)
  getMe: () => request("/api/me/"),

  // Core data
  getDashboard: () => request("/api/dashboard/"),
  getLeads: () => request("/api/leads/"),
  getDeals: () => request("/api/deals/"),

  // Pipelines (dynamic stages)
  getLeadPipeline: () => request("/api/pipelines/?module=lead"),
  getDealPipeline: () => request("/api/pipelines/?module=deal"),

  // Notifications
  getNotifications: () => request("/api/notifications/"),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read/`, { method: "POST" }),
  markAllNotificationsRead: () => request("/api/notifications/read-all/", { method: "POST" }),
};
