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

  // Tasks
  getTasks: () => request("/api/tasks/"),
  getTask: (id) => request(`/api/tasks/${id}/`),
  createTask: (data) => request("/api/tasks/", { method: "POST", body: data }),
  updateTask: (id, data) => request(`/api/tasks/${id}/`, { method: "PUT", body: data }),
  deleteTask: (id) => request(`/api/tasks/${id}/`, { method: "DELETE" }),
  getTaskMessages: (taskId) => request(`/api/tasks/${taskId}/task-messages/`),
  createTaskMessage: (taskId, data) =>
    request(`/api/tasks/${taskId}/task-messages/`, { method: "POST", body: data }),

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

  // ── Phase 6 — Enterprise Operations Pack ──

  // Advanced Filter Builder
  getFilterMeta: (module = "lead") => request(`/api/filters/meta/?module=${module}`),
  runFilterQuery: (module, filter, limit = 200) =>
    request("/api/filters/query/", {
      method: "POST",
      body: { module, filter, limit },
    }),

  // Import / Export Engine
  listImports: () => request("/api/imports/"),
  uploadImport: (formData) =>
    request("/api/imports/", { method: "POST", body: formData, isForm: true }),
  getImport: (id) => request(`/api/imports/${id}/`),
  commitImport: (id) => request(`/api/imports/${id}/?action=commit`, { method: "POST" }),
  rollbackImport: (id) => request(`/api/imports/${id}/?action=rollback`, { method: "POST" }),
  deleteImport: (id) => request(`/api/imports/${id}/`, { method: "DELETE" }),
  exportCsvUrl: (module) => `${API_URL}/api/export/?module=${module}`,

  // Lead Distribution
  getDistributionRules: () => request("/api/distribution/rules/"),
  createDistributionRule: (data) =>
    request("/api/distribution/rules/", { method: "POST", body: data }),
  updateDistributionRule: (id, data) =>
    request(`/api/distribution/rules/${id}/`, { method: "PATCH", body: data }),
  deleteDistributionRule: (id) =>
    request(`/api/distribution/rules/${id}/`, { method: "DELETE" }),
  getAssignmentLogs: () => request("/api/distribution/logs/"),

  // Session & Device Management
  getMySessions: () => request("/api/sessions/me/"),
  revokeSession: (id) => request(`/api/sessions/${id}/revoke/`, { method: "POST" }),
  revokeAllOtherSessions: () => request("/api/sessions/me/", { method: "DELETE" }),
  getAdminSessions: (params = "") => request(`/api/admin/sessions/${params}`),

  // Approval Workflows
  getApprovals: (mine) => request(`/api/approvals/${mine ? `?mine=${mine}` : ""}`),
  createApproval: (data) => request("/api/approvals/", { method: "POST", body: data }),
  getApproval: (id) => request(`/api/approvals/${id}/`),
  decideApproval: (id, action, comment = "") =>
    request(`/api/approvals/${id}/`, {
      method: "POST",
      body: { action, comment },
    }),
  cancelApproval: (id) => request(`/api/approvals/${id}/`, { method: "DELETE" }),

  // API Keys
  getApiKeys: () => request("/api/api-keys/"),
  createApiKey: (data) => request("/api/api-keys/", { method: "POST", body: data }),
  updateApiKey: (id, data) =>
    request(`/api/api-keys/${id}/`, { method: "PATCH", body: data }),
  revokeApiKey: (id) => request(`/api/api-keys/${id}/`, { method: "DELETE" }),

  // Public docs URLs (for opening in new tab)
  docsUrl: () => `${API_URL}/api/docs/`,
  schemaUrl: () => `${API_URL}/api/schema/`,

  // ── Phase 7 — Enterprise Integrations Pack ──

  // Automation execution
  getAutomationRuns: (ruleId) =>
    request(`/api/automation/runs/${ruleId ? `?rule=${ruleId}` : ""}`),
  testAutomationRule: (ruleId, payload) =>
    request(`/api/automation/rules/${ruleId}/test/`, { method: "POST", body: { payload } }),

  // WhatsApp send
  sendWhatsApp: (data) => request("/api/whatsapp/send/", { method: "POST", body: data }),
  bulkSendWhatsApp: (recipients, body) =>
    request("/api/whatsapp/bulk-send/", { method: "POST", body: { recipients, body } }),

  // Razorpay billing
  createBillingOrder: (planSlug) =>
    request("/api/billing/order/", { method: "POST", body: { plan: planSlug } }),
  verifyBillingPayment: (data) =>
    request("/api/billing/verify/", { method: "POST", body: data }),
  invoicePdfUrl: (invoiceId) => `${API_URL}/api/billing/invoices/${invoiceId}/pdf/`,

  // Helpdesk
  getDepartments: () => request("/api/helpdesk/departments/"),
  createDepartment: (data) => request("/api/helpdesk/departments/", { method: "POST", body: data }),
  updateDepartment: (id, data) => request(`/api/helpdesk/departments/${id}/`, { method: "PATCH", body: data }),
  deleteDepartment: (id) => request(`/api/helpdesk/departments/${id}/`, { method: "DELETE" }),

  getSLAPolicies: () => request("/api/helpdesk/sla-policies/"),
  createSLAPolicy: (data) => request("/api/helpdesk/sla-policies/", { method: "POST", body: data }),
  updateSLAPolicy: (id, data) => request(`/api/helpdesk/sla-policies/${id}/`, { method: "PATCH", body: data }),
  deleteSLAPolicy: (id) => request(`/api/helpdesk/sla-policies/${id}/`, { method: "DELETE" }),

  getTickets: (status) => request(`/api/helpdesk/tickets/${status ? `?status=${status}` : ""}`),
  getTicket: (id) => request(`/api/helpdesk/tickets/${id}/`),
  createTicket: (data) => request("/api/helpdesk/tickets/", { method: "POST", body: data }),
  updateTicket: (id, data) => request(`/api/helpdesk/tickets/${id}/`, { method: "PATCH", body: data }),
  deleteTicket: (id) => request(`/api/helpdesk/tickets/${id}/`, { method: "DELETE" }),
  replyTicket: (id, body, isInternal = false) =>
    request(`/api/helpdesk/tickets/${id}/reply/`, {
      method: "POST", body: { body, is_internal: isInternal },
    }),

  getCannedReplies: () => request("/api/helpdesk/canned-replies/"),
  createCannedReply: (data) => request("/api/helpdesk/canned-replies/", { method: "POST", body: data }),
  updateCannedReply: (id, data) => request(`/api/helpdesk/canned-replies/${id}/`, { method: "PATCH", body: data }),
  deleteCannedReply: (id) => request(`/api/helpdesk/canned-replies/${id}/`, { method: "DELETE" }),

  // Customer portal — admin side
  getPortalTokens: () => request("/api/portal-tokens/"),
  createPortalToken: (data) => request("/api/portal-tokens/", { method: "POST", body: data }),
  revokePortalToken: (id) => request(`/api/portal-tokens/${id}/`, { method: "DELETE" }),

  // ── Phase 8 — Ecosystem & Intelligence Pack ──

  // Knowledge Base
  getKbCategories: () => request("/api/kb/categories/"),
  createKbCategory: (data) => request("/api/kb/categories/", { method: "POST", body: data }),
  updateKbCategory: (id, data) => request(`/api/kb/categories/${id}/`, { method: "PATCH", body: data }),
  deleteKbCategory: (id) => request(`/api/kb/categories/${id}/`, { method: "DELETE" }),
  getKbArticles: (q, category) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    return request(`/api/kb/articles/?${p.toString()}`);
  },
  getKbArticle: (id) => request(`/api/kb/articles/${id}/`),
  createKbArticle: (data) => request("/api/kb/articles/", { method: "POST", body: data }),
  updateKbArticle: (id, data) => request(`/api/kb/articles/${id}/`, { method: "PATCH", body: data }),
  deleteKbArticle: (id) => request(`/api/kb/articles/${id}/`, { method: "DELETE" }),
  voteKbArticle: (id, helpful) => request(`/api/kb/articles/${id}/vote/`, { method: "POST", body: { helpful } }),

  // Forms
  getForms: () => request("/api/forms/"),
  getForm: (id) => request(`/api/forms/${id}/`),
  createForm: (data) => request("/api/forms/", { method: "POST", body: data }),
  updateForm: (id, data) => request(`/api/forms/${id}/`, { method: "PATCH", body: data }),
  deleteForm: (id) => request(`/api/forms/${id}/`, { method: "DELETE" }),
  getFormSubmissions: (id) => request(`/api/forms/${id}/submissions/`),

  // E-signature
  getSignatureRequests: () => request("/api/esign/requests/"),
  getSignatureRequest: (id) => request(`/api/esign/requests/${id}/`),
  createSignatureRequest: (formData) => request("/api/esign/requests/", { method: "POST", body: formData, isForm: true }),
  cancelSignatureRequest: (id) => request(`/api/esign/requests/${id}/`, { method: "DELETE" }),

  // Backups
  getBackups: () => request("/api/backups/"),
  createBackup: (data = {}) => request("/api/backups/", { method: "POST", body: data }),
  restoreBackup: (id) => request(`/api/backups/${id}/restore/`, { method: "POST" }),
  pruneBackups: () => request("/api/backups/prune/", { method: "POST" }),

  // Cloud storage
  getCloudConnections: () => request("/api/cloud/connections/"),
  disconnectCloud: (provider) => request(`/api/cloud/connections/?provider=${provider}`, { method: "DELETE" }),
  startCloudOAuth: (provider) => request(`/api/cloud/${provider}/start/`),
  cloudOAuthCallback: (provider, code) =>
    request(`/api/cloud/${provider}/callback/`, { method: "POST", body: { code } }),

  // AI
  aiSummarizeLead: (leadId) => request(`/api/ai/leads/${leadId}/summary/`, { method: "POST" }),
  aiSuggestFollowup: (leadId) => request(`/api/ai/leads/${leadId}/followup/`, { method: "POST" }),
  aiPredictDealRisk: (dealId) => request(`/api/ai/deals/${dealId}/risk/`, { method: "POST" }),
  aiChat: (messages) => request("/api/ai/chat/", { method: "POST", body: { messages } }),
  getAiRequests: () => request("/api/ai/requests/"),

  // Plugins
  getPlugins: () => request("/api/plugins/"),
  installPlugin: (data) => request("/api/plugins/", { method: "POST", body: data }),
  updatePlugin: (id, data) => request(`/api/plugins/${id}/`, { method: "PATCH", body: data }),
  togglePlugin: (id, action) => request(`/api/plugins/${id}/`, { method: "POST", body: { action } }),
  uninstallPlugin: (id) => request(`/api/plugins/${id}/`, { method: "DELETE" }),
  getPluginHooks: () => request("/api/plugins/hooks/"),

  // Push
  getPushSubscriptions: () => request("/api/push/subscriptions/"),
  subscribePush: (data) => request("/api/push/subscriptions/", { method: "POST", body: data }),
  unsubscribePush: (id) => request(`/api/push/subscriptions/${id}/`, { method: "DELETE" }),
  testPush: (body) => request("/api/push/test/", { method: "POST", body }),
  getPushPublicKey: () => request("/api/push/public-key/"),

  // Advanced Analytics
  getAnalyticsForecast: (months = 12) => request(`/api/analytics/forecast/?months=${months}`),
  getAnalyticsCohort: (weeks = 8) => request(`/api/analytics/cohort/?weeks=${weeks}`),
  getAnalyticsChurn: () => request("/api/analytics/churn/"),
  getAnalyticsFunnel: () => request("/api/analytics/funnel/"),
  getAnalyticsExecutive: () => request("/api/analytics/executive/"),

  // Dashboard layouts
  getDashboardLayouts: () => request("/api/dashboard-layouts/"),
  createDashboardLayout: (data) => request("/api/dashboard-layouts/", { method: "POST", body: data }),
  updateDashboardLayout: (id, data) => request(`/api/dashboard-layouts/${id}/`, { method: "PATCH", body: data }),
  deleteDashboardLayout: (id) => request(`/api/dashboard-layouts/${id}/`, { method: "DELETE" }),

  // Documents (KYC, contracts, attachments — scoped to a Lead)
  getDocuments: () => request("/api/documents/"),
  getDocument: (id) => request(`/api/documents/${id}/`),
  uploadDocument: (formData) =>
    request("/api/documents/", { method: "POST", body: formData, isForm: true }),
  updateDocument: (id, formData) =>
    request(`/api/documents/${id}/`, { method: "PUT", body: formData, isForm: true }),
  deleteDocument: (id) => request(`/api/documents/${id}/`, { method: "DELETE" }),

  // Payments (linked to a Deal)
  getPayments: () => request("/api/payments/"),
  getPayment: (id) => request(`/api/payments/${id}/`),
  createPayment: (formData) =>
    request("/api/payments/", { method: "POST", body: formData, isForm: true }),
  updatePayment: (id, formData) =>
    request(`/api/payments/${id}/`, { method: "PUT", body: formData, isForm: true }),
  deletePayment: (id) => request(`/api/payments/${id}/`, { method: "DELETE" }),

  // Customer portal — customer side. Uses a portal token instead of JWT.
  portal: {
    me: (token) => portalRequest("/api/portal/me/", token),
    dashboard: (token) => portalRequest("/api/portal/dashboard/", token),
    tickets: (token) => portalRequest("/api/portal/tickets/", token),
    createTicket: (token, data) => portalRequest("/api/portal/tickets/", token, { method: "POST", body: data }),
    ticket: (token, id) => portalRequest(`/api/portal/tickets/${id}/`, token),
    replyTicket: (token, id, body) =>
      portalRequest(`/api/portal/tickets/${id}/`, token, { method: "POST", body: { body } }),
    invoices: (token) => portalRequest("/api/portal/invoices/", token),
    documents: (token) => portalRequest("/api/portal/documents/", token),
    deals: (token) => portalRequest("/api/portal/deals/", token),
  },
};

async function portalRequest(path, token, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Portal ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    const err = new Error(data?.error || data?.detail || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export { API_URL, request };
