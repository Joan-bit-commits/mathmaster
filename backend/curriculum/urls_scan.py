from django.urls import path

from .views import ScanHistoryView, ScanJobDetailView, ScanSolveView

urlpatterns = [
    path('solve/', ScanSolveView.as_view(), name='scan-solve'),
    path('history/', ScanHistoryView.as_view(), name='scan-history'),
    path('jobs/<int:pk>/', ScanJobDetailView.as_view(), name='scan-job-detail'),
]
