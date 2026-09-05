from django.urls import path

from .views import ScanHistoryView, ScanJobDetailView, ScanSolveView

urlpatterns = [
    path('solve/', ScanSolveView.as_view()),
    path('history/', ScanHistoryView.as_view()),
    path('jobs/<int:pk>/', ScanJobDetailView.as_view()),
]
