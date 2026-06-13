from django.urls import path

from . import views

urlpatterns = [
    path("", views.analytics_home, name="analytics_home"),
    path("summary/", views.analytics_summary, name="analytics_summary"),
    path("events/", views.analytics_events, name="analytics_events"),
]
