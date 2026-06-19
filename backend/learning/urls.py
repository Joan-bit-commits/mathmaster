from django.urls import path
from .views import (
    TopicListView,
    TopicDetailView,
    LessonByTopicListView,
    LessonDetailView,
    QuizByLessonListView,
    QuizDetailView,
    QuestionByQuizListView,
    AttemptCreateView,
    PerformanceView,
)

urlpatterns = [
    path('topics/', TopicListView.as_view(), name='topic-list'),
    path('topics/<int:pk>/', TopicDetailView.as_view(), name='topic-detail'),
    path('topics/<int:topic_id>/lessons/', LessonByTopicListView.as_view(), name='lesson-by-topic'),
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<int:lesson_id>/quizzes/', QuizByLessonListView.as_view(), name='quiz-by-lesson'),
    path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:quiz_id>/questions/', QuestionByQuizListView.as_view(), name='question-by-quiz'),
    path('quizzes/<int:quiz_id>/attempts/', AttemptCreateView.as_view(), name='attempt-create'),
    path('performance/', PerformanceView.as_view(), name='performance'),
]
