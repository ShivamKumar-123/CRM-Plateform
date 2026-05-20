from django.urls import path
from .views import (
    Dashboard, LeadsData, DealData, DocumnetData, PaymentDocuments,
    TaskData, TaskMessageView,
    Me, AdminSystemStats, AdminUsers, AdminUserDetail,
    PipelineList, OrganizationList, OrganizationDetail,
    AutomationRuleList, AutomationRuleDetail,
    WhatsAppConfigView, WhatsAppMessageList,
    PlanList, CurrentSubscription, InvoiceList, BillingCheckout,
    CustomFieldList, CustomFieldDetail,
    AuditLogList,
    TwoFactorStatus, TwoFactorSetup, TwoFactorVerify, TwoFactorDisable,
    NotificationList, NotificationMarkRead, NotificationMarkAllRead,
    PipelineStageReorder,
    # Phase 5
    LeadScoreRuleList, LeadScoreRuleDetail, LeadScoreHistoryView,
    LeadDuplicates, LeadDuplicateMerge,
    SalesTargetList, SalesTargetDetail, SalesLeaderboard,
    SavedViewList, SavedViewDetail,
    CallLogList,
    IndustryTemplateList, IndustryTemplateApply,
    # Phase 6
    FilterMeta, FilterQuery,
    ImportJobList, ImportJobDetail, ExportData,
    DistributionRuleList, DistributionRuleDetail, AssignmentLogList,
    MySessions, SessionRevoke, AdminSessionList,
    ApprovalRequestList, ApprovalRequestDetail,
    APIKeyList, APIKeyDetail,
    # Phase 7
    AutomationRunList, AutomationRuleTest,
    WhatsAppSend, WhatsAppBulkSend, WhatsAppWebhook,
    BillingCheckoutOrder, BillingVerify, BillingWebhook, InvoiceDownload,
    DepartmentList, DepartmentDetail,
    SLAPolicyList, SLAPolicyDetail,
    TicketList, TicketDetail, TicketReply,
    CannedReplyList, CannedReplyDetail,
    PortalTokenList, PortalTokenDetail,
    PortalMe, PortalDashboard, PortalTickets, PortalTicketDetail,
    PortalInvoices, PortalDocuments, PortalDeals,
    # Phase 8
    KbCategoryList, KbCategoryDetail,
    KbArticleList, KbArticleDetail, KbArticleVote,
    FormList, FormDetail, FormSubmissionsList, PublicFormView,
    SignatureRequestList, SignatureRequestDetail, PublicSignView,
    BackupList, BackupRestore, BackupPrune,
    CloudConnectionList, CloudConnectStart, CloudConnectCallback,
    AILeadSummary, AIFollowupSuggest, AIDealRisk, AIChat, AIRequestLog,
    PluginList, PluginDetail, PluginHooks,
    PushSubscriptionList, PushSubscriptionDelete, PushTest, PushPublicKey,
    AnalyticsForecast, AnalyticsCohort, AnalyticsChurn,
    AnalyticsFunnel, AnalyticsExecutive,
    DashboardLayoutList, DashboardLayoutDetail,
)


urlpatterns = [
    # current user
    path("me/", Me.as_view(), name="me"),

    # dashboard
    path("dashboard/", Dashboard.as_view(), name="dashboard"),

    # pipelines
    path("pipelines/", PipelineList.as_view(), name="pipelines"),
    path("pipelines/<int:pipeline_id>/reorder/", PipelineStageReorder.as_view(), name="pipeline-reorder"),

    # leads
    path("leads/", LeadsData.as_view()),
    path("leads/<int:lead_id>/", LeadsData.as_view(), name="lead-detail"),
    path("leads/<int:lead_id>/duplicates/", LeadDuplicates.as_view(), name="lead-duplicates"),
    path("leads/<int:lead_id>/score-history/", LeadScoreHistoryView.as_view(), name="lead-score-history"),
    path("leads/merge/", LeadDuplicateMerge.as_view(), name="lead-merge"),

    # deals
    path("deals/", DealData.as_view(), name="deal-list-create"),
    path("deals/<int:deal_id>/", DealData.as_view(), name="deal-detail"),

    # documents
    path("documents/", DocumnetData.as_view(), name="document-list"),
    path("documents/<int:doc_id>/", DocumnetData.as_view(), name="document-detail"),

    # payments
    path("payments/", PaymentDocuments.as_view(), name="paymentDocument-list"),
    path("payments/<int:payment_id>/", PaymentDocuments.as_view(), name="paymentDocument-detail"),

    # tasks
    path("tasks/", TaskData.as_view()),
    path("tasks/<int:task_id>/", TaskData.as_view()),
    path("tasks/<int:task_id>/task-messages/", TaskMessageView.as_view(), name="task-message-create"),

    # platform extensions
    path("automation/rules/", AutomationRuleList.as_view(), name="automation-rules"),
    path("automation/rules/<int:rule_id>/", AutomationRuleDetail.as_view(), name="automation-rule-detail"),

    path("whatsapp/config/", WhatsAppConfigView.as_view(), name="whatsapp-config"),
    path("whatsapp/messages/", WhatsAppMessageList.as_view(), name="whatsapp-messages"),

    path("billing/plans/", PlanList.as_view(), name="billing-plans"),
    path("billing/subscription/", CurrentSubscription.as_view(), name="billing-subscription"),
    path("billing/invoices/", InvoiceList.as_view(), name="billing-invoices"),
    path("billing/checkout/", BillingCheckout.as_view(), name="billing-checkout"),

    path("custom-fields/", CustomFieldList.as_view(), name="custom-fields"),
    path("custom-fields/<int:field_id>/", CustomFieldDetail.as_view(), name="custom-field-detail"),

    path("audit-logs/", AuditLogList.as_view(), name="audit-logs"),

    path("2fa/status/", TwoFactorStatus.as_view(), name="2fa-status"),
    path("2fa/setup/", TwoFactorSetup.as_view(), name="2fa-setup"),
    path("2fa/verify/", TwoFactorVerify.as_view(), name="2fa-verify"),
    path("2fa/disable/", TwoFactorDisable.as_view(), name="2fa-disable"),

    path("notifications/", NotificationList.as_view(), name="notifications"),
    path("notifications/<int:notification_id>/read/", NotificationMarkRead.as_view(), name="notification-read"),
    path("notifications/read-all/", NotificationMarkAllRead.as_view(), name="notifications-read-all"),

    # ── Phase 5 — Enterprise Foundation Pack ──
    path("score-rules/", LeadScoreRuleList.as_view(), name="score-rules"),
    path("score-rules/<int:rule_id>/", LeadScoreRuleDetail.as_view(), name="score-rule-detail"),

    path("sales-targets/", SalesTargetList.as_view(), name="sales-targets"),
    path("sales-targets/<int:target_id>/", SalesTargetDetail.as_view(), name="sales-target-detail"),
    path("sales-leaderboard/", SalesLeaderboard.as_view(), name="sales-leaderboard"),

    path("saved-views/", SavedViewList.as_view(), name="saved-views"),
    path("saved-views/<int:view_id>/", SavedViewDetail.as_view(), name="saved-view-detail"),

    path("call-logs/", CallLogList.as_view(), name="call-logs"),

    path("industry-templates/", IndustryTemplateList.as_view(), name="industry-templates"),

    # super-admin
    path("admin/stats/", AdminSystemStats.as_view(), name="admin-stats"),
    path("admin/users/", AdminUsers.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/", AdminUserDetail.as_view(), name="admin-user-detail"),
    path("admin/organizations/", OrganizationList.as_view(), name="admin-orgs"),
    path("admin/organizations/<int:org_id>/", OrganizationDetail.as_view(), name="admin-org-detail"),
    path("admin/organizations/<int:org_id>/apply-template/", IndustryTemplateApply.as_view(), name="apply-template"),

    # ── Phase 6 — Enterprise Operations Pack ──
    # Advanced Filter Builder
    path("filters/meta/", FilterMeta.as_view(), name="filter-meta"),
    path("filters/query/", FilterQuery.as_view(), name="filter-query"),

    # Import / Export Engine
    path("imports/", ImportJobList.as_view(), name="imports"),
    path("imports/<int:job_id>/", ImportJobDetail.as_view(), name="import-detail"),
    path("export/", ExportData.as_view(), name="export"),

    # Lead Distribution Engine
    path("distribution/rules/", DistributionRuleList.as_view(), name="distribution-rules"),
    path("distribution/rules/<int:rule_id>/", DistributionRuleDetail.as_view(), name="distribution-rule-detail"),
    path("distribution/logs/", AssignmentLogList.as_view(), name="assignment-logs"),

    # Session & Device Management
    path("sessions/me/", MySessions.as_view(), name="my-sessions"),
    path("sessions/<int:session_id>/revoke/", SessionRevoke.as_view(), name="session-revoke"),
    path("admin/sessions/", AdminSessionList.as_view(), name="admin-sessions"),

    # Approval Workflows
    path("approvals/", ApprovalRequestList.as_view(), name="approvals"),
    path("approvals/<int:req_id>/", ApprovalRequestDetail.as_view(), name="approval-detail"),

    # API Keys
    path("api-keys/", APIKeyList.as_view(), name="api-keys"),
    path("api-keys/<int:key_id>/", APIKeyDetail.as_view(), name="api-key-detail"),

    # ── Phase 7 — Enterprise Integrations Pack ──

    # Automation execution
    path("automation/runs/", AutomationRunList.as_view(), name="automation-runs"),
    path("automation/rules/<int:rule_id>/test/", AutomationRuleTest.as_view(), name="automation-test"),

    # WhatsApp send + webhook
    path("whatsapp/send/", WhatsAppSend.as_view(), name="whatsapp-send"),
    path("whatsapp/bulk-send/", WhatsAppBulkSend.as_view(), name="whatsapp-bulk-send"),
    path("whatsapp/webhook/", WhatsAppWebhook.as_view(), name="whatsapp-webhook"),

    # Razorpay billing
    path("billing/order/", BillingCheckoutOrder.as_view(), name="billing-order"),
    path("billing/verify/", BillingVerify.as_view(), name="billing-verify"),
    path("billing/webhook/", BillingWebhook.as_view(), name="billing-webhook"),
    path("billing/invoices/<int:invoice_id>/pdf/", InvoiceDownload.as_view(), name="billing-invoice-pdf"),

    # Helpdesk
    path("helpdesk/departments/", DepartmentList.as_view(), name="helpdesk-departments"),
    path("helpdesk/departments/<int:dept_id>/", DepartmentDetail.as_view(), name="helpdesk-department-detail"),
    path("helpdesk/sla-policies/", SLAPolicyList.as_view(), name="helpdesk-sla"),
    path("helpdesk/sla-policies/<int:pid>/", SLAPolicyDetail.as_view(), name="helpdesk-sla-detail"),
    path("helpdesk/tickets/", TicketList.as_view(), name="helpdesk-tickets"),
    path("helpdesk/tickets/<int:ticket_id>/", TicketDetail.as_view(), name="helpdesk-ticket-detail"),
    path("helpdesk/tickets/<int:ticket_id>/reply/", TicketReply.as_view(), name="helpdesk-ticket-reply"),
    path("helpdesk/canned-replies/", CannedReplyList.as_view(), name="helpdesk-canned"),
    path("helpdesk/canned-replies/<int:rid>/", CannedReplyDetail.as_view(), name="helpdesk-canned-detail"),

    # Customer portal — admin side (mint tokens)
    path("portal-tokens/", PortalTokenList.as_view(), name="portal-tokens"),
    path("portal-tokens/<int:token_id>/", PortalTokenDetail.as_view(), name="portal-token-detail"),

    # Customer portal — customer-facing (auth via Portal token header)
    path("portal/me/", PortalMe.as_view(), name="portal-me"),
    path("portal/dashboard/", PortalDashboard.as_view(), name="portal-dashboard"),
    path("portal/tickets/", PortalTickets.as_view(), name="portal-tickets"),
    path("portal/tickets/<int:ticket_id>/", PortalTicketDetail.as_view(), name="portal-ticket-detail"),
    path("portal/invoices/", PortalInvoices.as_view(), name="portal-invoices"),
    path("portal/documents/", PortalDocuments.as_view(), name="portal-documents"),
    path("portal/deals/", PortalDeals.as_view(), name="portal-deals"),

    # ── Phase 8 — Ecosystem & Intelligence Pack ──

    # Knowledge Base
    path("kb/categories/", KbCategoryList.as_view(), name="kb-categories"),
    path("kb/categories/<int:cat_id>/", KbCategoryDetail.as_view(), name="kb-category-detail"),
    path("kb/articles/", KbArticleList.as_view(), name="kb-articles"),
    path("kb/articles/<int:article_id>/", KbArticleDetail.as_view(), name="kb-article-detail"),
    path("kb/articles/<int:article_id>/vote/", KbArticleVote.as_view(), name="kb-article-vote"),

    # Form Builder
    path("forms/", FormList.as_view(), name="forms"),
    path("forms/<int:form_id>/", FormDetail.as_view(), name="form-detail"),
    path("forms/<int:form_id>/submissions/", FormSubmissionsList.as_view(), name="form-submissions"),
    path("public/forms/<slug:slug>/", PublicFormView.as_view(), name="public-form"),

    # E-signature
    path("esign/requests/", SignatureRequestList.as_view(), name="esign-requests"),
    path("esign/requests/<int:req_id>/", SignatureRequestDetail.as_view(), name="esign-request-detail"),
    path("public/sign/<str:token>/", PublicSignView.as_view(), name="public-sign"),

    # Backup & Restore
    path("backups/", BackupList.as_view(), name="backups"),
    path("backups/<int:job_id>/restore/", BackupRestore.as_view(), name="backup-restore"),
    path("backups/prune/", BackupPrune.as_view(), name="backup-prune"),

    # Cloud storage
    path("cloud/connections/", CloudConnectionList.as_view(), name="cloud-connections"),
    path("cloud/<str:provider>/start/", CloudConnectStart.as_view(), name="cloud-start"),
    path("cloud/<str:provider>/callback/", CloudConnectCallback.as_view(), name="cloud-callback"),

    # AI
    path("ai/leads/<int:lead_id>/summary/", AILeadSummary.as_view(), name="ai-lead-summary"),
    path("ai/leads/<int:lead_id>/followup/", AIFollowupSuggest.as_view(), name="ai-followup"),
    path("ai/deals/<int:deal_id>/risk/", AIDealRisk.as_view(), name="ai-deal-risk"),
    path("ai/chat/", AIChat.as_view(), name="ai-chat"),
    path("ai/requests/", AIRequestLog.as_view(), name="ai-requests"),

    # Plugins
    path("plugins/", PluginList.as_view(), name="plugins"),
    path("plugins/<int:plugin_id>/", PluginDetail.as_view(), name="plugin-detail"),
    path("plugins/hooks/", PluginHooks.as_view(), name="plugin-hooks"),

    # Push
    path("push/subscriptions/", PushSubscriptionList.as_view(), name="push-subscriptions"),
    path("push/subscriptions/<int:sub_id>/", PushSubscriptionDelete.as_view(), name="push-subscription-detail"),
    path("push/test/", PushTest.as_view(), name="push-test"),
    path("push/public-key/", PushPublicKey.as_view(), name="push-public-key"),

    # Advanced Analytics
    path("analytics/forecast/", AnalyticsForecast.as_view(), name="analytics-forecast"),
    path("analytics/cohort/", AnalyticsCohort.as_view(), name="analytics-cohort"),
    path("analytics/churn/", AnalyticsChurn.as_view(), name="analytics-churn"),
    path("analytics/funnel/", AnalyticsFunnel.as_view(), name="analytics-funnel"),
    path("analytics/executive/", AnalyticsExecutive.as_view(), name="analytics-executive"),

    # Dashboard layouts
    path("dashboard-layouts/", DashboardLayoutList.as_view(), name="dashboard-layouts"),
    path("dashboard-layouts/<int:layout_id>/", DashboardLayoutDetail.as_view(), name="dashboard-layout-detail"),
]
