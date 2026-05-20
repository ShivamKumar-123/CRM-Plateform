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
]
