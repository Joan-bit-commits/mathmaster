from django.urls import path

from .views import ScanHistoryView, ScanJobDetailView, ScanJobImageView, ScanSolveView

urlpatterns = [
    path('solve/', ScanSolveView.as_view(), name='scan-solve'),
    path('history/', ScanHistoryView.as_view(), name='scan-history'),
    path('jobs/<int:pk>/', ScanJobDetailView.as_view(), name='scan-job-detail'),
    path('jobs/<int:pk>/image/', ScanJobImageView.as_view(), name='scan-job-image'),
]
