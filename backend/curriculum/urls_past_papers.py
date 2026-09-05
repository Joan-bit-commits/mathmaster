from django.urls import path

from .views import PastPaperExtractView, PastPaperSaveQuizView, PastPaperUploadView

urlpatterns = [
    path('', PastPaperUploadView.as_view()),
    path('<int:pk>/extract-quiz/', PastPaperExtractView.as_view()),
    path('<int:pk>/save-as-quiz/', PastPaperSaveQuizView.as_view()),
]
