from django.urls import path
from .views import (
    Dashboard, LeadsData, DealData, DocumnetData, PaymentDocuments,
    TaskData, TaskMessageView,
    Me, AdminSystemStats, AdminUsers, AdminUserDetail,
    PipelineList, OrganizationList, OrganizationDetail,
    # platform extensions
    AutomationRuleList, AutomationRuleDetail,
    WhatsAppConfigView, WhatsAppMessageList,
    PlanList, CurrentSubscription, InvoiceList, BillingCheckout,
    CustomFieldList, CustomFieldDetail,
    AuditLogList,
    TwoFactorStatus, TwoFactorSetup, TwoFactorVerify, TwoFactorDisable,
    NotificationList, NotificationMarkRead, NotificationMarkAllRead,
    PipelineStageReorder,
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

    # ── platform extensions (stubs) ──
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

    # ── super-admin ──
    path("admin/stats/", AdminSystemStats.as_view(), name="admin-stats"),
    path("admin/users/", AdminUsers.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/", AdminUserDetail.as_view(), name="admin-user-detail"),
    path("admin/organizations/", OrganizationList.as_view(), name="admin-orgs"),
    path("admin/organizations/<int:org_id>/", OrganizationDetail.as_view(), name="admin-org-detail"),
]
