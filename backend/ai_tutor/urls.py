from django.urls import path

from .views import AITutorAskView, AITutorStreamView

urlpatterns = [
    path('ask-ai-tutor/', AITutorAskView.as_view(), name='ask-ai-tutor'),
    path('ask-ai-tutor/stream/', AITutorStreamView.as_view(), name='ask-ai-tutor-stream'),
]
