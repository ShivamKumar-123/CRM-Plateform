from django.urls import path
from .views import Dashboard, LeadsData

urlpatterns = [
    path('dashboard/', Dashboard.as_view(), name='dashboard'),
    path('leads-data/', LeadsData.as_view(), name='leads-data'),
]
