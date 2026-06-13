from django.urls import path
from .views import (
    TopicListView,
    LessonListView,
    QuizListView,
    QuestionListView,
    AttemptListView
)
urlpatterns = [
    path('topics/', TopicListView.as_view(), name='topic-list'),    
    path('lessons/', LessonListView.as_view(), name='lesson-list'),
    path('quizzes/', QuizListView.as_view(), name='quiz-list'),
    path('questions/', QuestionListView.as_view(), name='question-list'),
    path('attempts/', AttemptListView.as_view(), name='attempt-list'),
]
