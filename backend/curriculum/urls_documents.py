from django.urls import path

from .views import (
    DocumentAskView,
    DocumentChunkDetailView,
    DocumentChunksView,
    DocumentDetailView,
    DocumentListCreateView,
    DocumentProcessView,
    DocumentSessionDetailView,
    DocumentSessionsView,
)

urlpatterns = [
    path('', DocumentListCreateView.as_view()),
    path('<int:pk>/', DocumentDetailView.as_view()),
    path('<int:pk>/process/', DocumentProcessView.as_view()),
    path('<int:pk>/chunks/', DocumentChunksView.as_view()),
    path('<int:pk>/chunks/<int:chunk_id>/', DocumentChunkDetailView.as_view()),
    path('<int:pk>/ask/', DocumentAskView.as_view()),
    path('<int:pk>/sessions/', DocumentSessionsView.as_view()),
    path('<int:pk>/sessions/<int:session_id>/', DocumentSessionDetailView.as_view()),
]
