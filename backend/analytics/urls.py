from django.urls import path

from .views import (
    EventCreateView,
    RecommendationListView,
    SummaryView,
    TeacherOverviewView,
    TopicPerformanceView,
)

urlpatterns = [
    path('events/', EventCreateView.as_view(), name='analytics-events'),
    path('summary/', SummaryView.as_view(), name='analytics-summary'),
    path('performance/topics/', TopicPerformanceView.as_view(), name='analytics-topic-performance'),
    path('recommendations/', RecommendationListView.as_view(), name='analytics-recommendations'),
    path('teacher/overview/', TeacherOverviewView.as_view(), name='analytics-teacher-overview'),
]
