from django.urls import path
from .views import Dashboard, LeadsData, DealData, DocumnetData, PaymentDocuments

urlpatterns = [
    path('dashboard/', Dashboard.as_view(), name='dashboard'),
    
    path('leads/', LeadsData.as_view()),
    path('leads/<int:lead_id>/', LeadsData.as_view(), name='lead-detail'),

    path('deals/', DealData.as_view(), name='deal-list-create'),
    path('deals/<int:deal_id>/', DealData.as_view(), name='deal-detail'),

    path('documents/', DocumnetData.as_view(), name='document-list'),
    path('documents/<int:doc_id>/', DocumnetData.as_view(), name='document-detail'),

    path('payments/', PaymentDocuments.as_view(), name='paymentDocument-list'),
    path('payments/<int:payment_id>/', PaymentDocuments.as_view(), name='paymentDocument-detail'),

]
