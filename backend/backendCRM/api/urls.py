from django.urls import path
from .views import Dashboard, LeadsData, DealData, DocumnetData, PaymentDocuments,TaskData, TaskMessageView



urlpatterns = [
    # dashboard

    path('dashboard/', Dashboard.as_view(), name='dashboard'),

    # leads
    
    path('leads/', LeadsData.as_view()),
    path('leads/<int:lead_id>/', LeadsData.as_view(), name='lead-detail'),

    # deals

    path('deals/', DealData.as_view(), name='deal-list-create'),
    path('deals/<int:deal_id>/', DealData.as_view(), name='deal-detail'),

    # documents

    path('documents/', DocumnetData.as_view(), name='document-list'),
    path('documents/<int:doc_id>/', DocumnetData.as_view(), name='document-detail'),

    # payments

    path('payments/', PaymentDocuments.as_view(), name='paymentDocument-list'),
    path('payments/<int:payment_id>/', PaymentDocuments.as_view(), name='paymentDocument-detail'),
    
    # tasks

    path("tasks/", TaskData.as_view()),
    path("tasks/<int:task_id>/", TaskData.as_view()),

    # task messege
    path('tasks/<int:task_id>/task-messages/', TaskMessageView.as_view(), name='task-message-create'),
]
