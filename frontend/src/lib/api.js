const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ACCESS_KEY = "crm_access";
const REFRESH_KEY = "crm_refresh";

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function refreshAccessToken() {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    tokenStore.clear();
    return null;
  }
  const data = await res.json();
  tokenStore.set(data.access, null);
  return data.access;
}

async function request(path, { method = "GET", body, headers = {}, isForm = false, retry = true } = {}) {
  const access = tokenStore.getAccess();

  const finalHeaders = { ...headers };
  if (access) finalHeaders["Authorization"] = `Bearer ${access}`;
  if (!isForm && body !== undefined) finalHeaders["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry && tokenStore.getRefresh()) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return request(path, { method, body, headers, isForm, retry: false });
    }
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

  // Dashboard
  getDashboard: () => request("/api/dashboard/"),

  // Leads
  getLeads: () => request("/api/leads/"),
  getLead: (id) => request(`/api/leads/${id}/`),
  createLead: (data) => request("/api/leads/", { method: "POST", body: data }),
  updateLead: (id, data) => request(`/api/leads/${id}/`, { method: "PUT", body: data }),
  deleteLead: (id) => request(`/api/leads/${id}/`, { method: "DELETE" }),

  // Deals
  getDeals: () => request("/api/deals/"),
  getDeal: (id) => request(`/api/deals/${id}/`),
  createDeal: (data) => request("/api/deals/", { method: "POST", body: data }),
  updateDeal: (id, data) => request(`/api/deals/${id}/`, { method: "PUT", body: data }),
  deleteDeal: (id) => request(`/api/deals/${id}/`, { method: "DELETE" }),

  // Current user
  getMe: () => request("/api/me/"),

  // Pipelines (dynamic stages per org / module)
  getLeadPipeline: () => request("/api/pipelines/?module=lead"),
  getDealPipeline: () => request("/api/pipelines/?module=deal"),

  // Super admin: stats & users
  getAdminStats: (params = "") => request(`/api/admin/stats/${params}`),
  getAdminUsers: () => request("/api/admin/users/"),
  createAdminUser: (data) => request("/api/admin/users/", { method: "POST", body: data }),
  updateAdminUser: (id, data) => request(`/api/admin/users/${id}/`, { method: "PATCH", body: data }),
  deleteAdminUser: (id) => request(`/api/admin/users/${id}/`, { method: "DELETE" }),

  // Super admin: organizations (tenants)
  getOrganizations: () => request("/api/admin/organizations/"),
  getOrganization: (id) => request(`/api/admin/organizations/${id}/`),
  createOrganization: (data) => request("/api/admin/organizations/", { method: "POST", body: data }),
  updateOrganization: (id, data) => request(`/api/admin/organizations/${id}/`, { method: "PATCH", body: data }),
  deleteOrganization: (id) => request(`/api/admin/organizations/${id}/`, { method: "DELETE" }),

  // ── Platform extensions (stubs) ──

  // Automation
  getAutomationRules: () => request("/api/automation/rules/"),
  createAutomationRule: (data) => request("/api/automation/rules/", { method: "POST", body: data }),
  updateAutomationRule: (id, data) => request(`/api/automation/rules/${id}/`, { method: "PATCH", body: data }),
  deleteAutomationRule: (id) => request(`/api/automation/rules/${id}/`, { method: "DELETE" }),

  // WhatsApp
  getWhatsAppConfig: () => request("/api/whatsapp/config/"),
  updateWhatsAppConfig: (data) => request("/api/whatsapp/config/", { method: "PUT", body: data }),
  getWhatsAppMessages: () => request("/api/whatsapp/messages/"),
  sendWhatsAppMessage: (data) => request("/api/whatsapp/messages/", { method: "POST", body: data }),

  // Billing
  getPlans: () => request("/api/billing/plans/"),
  getSubscription: () => request("/api/billing/subscription/"),
  subscribe: (planSlug) => request("/api/billing/subscription/", { method: "POST", body: { plan: planSlug } }),
  getInvoices: () => request("/api/billing/invoices/"),
  startCheckout: (planSlug) => request("/api/billing/checkout/", { method: "POST", body: { plan: planSlug } }),

  // Custom fields
  getCustomFields: (module) => request(`/api/custom-fields/${module ? `?module=${module}` : ""}`),
  createCustomField: (data) => request("/api/custom-fields/", { method: "POST", body: data }),
  updateCustomField: (id, data) => request(`/api/custom-fields/${id}/`, { method: "PATCH", body: data }),
  deleteCustomField: (id) => request(`/api/custom-fields/${id}/`, { method: "DELETE" }),

  // Audit logs
  getAuditLogs: () => request("/api/audit-logs/"),

  // 2FA
  get2FAStatus: () => request("/api/2fa/status/"),
  setup2FA: () => request("/api/2fa/setup/", { method: "POST" }),
  verify2FA: (code) => request("/api/2fa/verify/", { method: "POST", body: { code } }),
  disable2FA: () => request("/api/2fa/disable/", { method: "POST" }),

  // Notifications
  getNotifications: () => request("/api/notifications/"),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read/`, { method: "POST" }),
  markAllNotificationsRead: () => request("/api/notifications/read-all/", { method: "POST" }),

  // Drag-drop pipelines
  reorderPipelineStages: (pipelineId, stages) =>
    request(`/api/pipelines/${pipelineId}/reorder/`, { method: "POST", body: { stages } }),

  // ── Phase 5 — Enterprise Foundation Pack ──

  // Lead scoring
  getScoreRules: () => request("/api/score-rules/"),
  createScoreRule: (data) => request("/api/score-rules/", { method: "POST", body: data }),
  updateScoreRule: (id, data) => request(`/api/score-rules/${id}/`, { method: "PATCH", body: data }),
  deleteScoreRule: (id) => request(`/api/score-rules/${id}/`, { method: "DELETE" }),
  getLeadScoreHistory: (leadId) => request(`/api/leads/${leadId}/score-history/`),

  // Duplicate detection
  getLeadDuplicates: (leadId) => request(`/api/leads/${leadId}/duplicates/`),
  mergeLeads: (targetId, sourceId) =>
    request("/api/leads/merge/", { method: "POST", body: { target_id: targetId, source_id: sourceId } }),

  // Sales targets + leaderboard
  getSalesTargets: () => request("/api/sales-targets/"),
  createSalesTarget: (data) => request("/api/sales-targets/", { method: "POST", body: data }),
  updateSalesTarget: (id, data) => request(`/api/sales-targets/${id}/`, { method: "PATCH", body: data }),
  deleteSalesTarget: (id) => request(`/api/sales-targets/${id}/`, { method: "DELETE" }),
  getSalesLeaderboard: () => request("/api/sales-leaderboard/"),

  // Saved views
  getSavedViews: (module) => request(`/api/saved-views/${module ? `?module=${module}` : ""}`),
  createSavedView: (data) => request("/api/saved-views/", { method: "POST", body: data }),
  updateSavedView: (id, data) => request(`/api/saved-views/${id}/`, { method: "PATCH", body: data }),
  deleteSavedView: (id) => request(`/api/saved-views/${id}/`, { method: "DELETE" }),

  // Call logs
  getCallLogs: (leadId) => request(`/api/call-logs/${leadId ? `?lead=${leadId}` : ""}`),
  createCallLog: (data) => request("/api/call-logs/", { method: "POST", body: data }),

  // Industry templates
  getIndustryTemplates: () => request("/api/industry-templates/"),
  applyIndustryTemplate: (orgId, template, replacePipelines = false) =>
    request(`/api/admin/organizations/${orgId}/apply-template/`, {
      method: "POST",
      body: { template, replace_pipelines: replacePipelines },
    }),
};

export { API_URL, request };
