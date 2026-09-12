from django.urls import path

from .views import (
    AITutorAskView,
    AITutorStreamView,
    ChatSessionDetailView,
    ChatSessionListView,
)

urlpatterns = [
    path('ask-ai-tutor/', AITutorAskView.as_view(), name='ask-ai-tutor'),
    path('ask-ai-tutor/stream/', AITutorStreamView.as_view(), name='ask-ai-tutor-stream'),
    path('sessions/', ChatSessionListView.as_view(), name='ai-tutor-sessions'),
    path('sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='ai-tutor-session-detail'),
]
