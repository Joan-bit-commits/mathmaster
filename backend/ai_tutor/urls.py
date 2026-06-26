from django.urls import path

from .views import AITutorAskView

urlpatterns = [
    path('ask-ai-tutor/', AITutorAskView.as_view(), name='ask-ai-tutor'),
]
