from django.urls import path

from .views import (
    AttemptCreateView,
    LessonDetailView,
    LessonListCreateByTopicView,
    PerformanceView,
    QuestionBulkCreateView,
    QuestionListCreateByQuizView,
    QuizDetailView,
    QuizListCreateByLessonView,
    TopicDetailView,
    TopicListCreateView,
)

urlpatterns = [
    path('topics/', TopicListCreateView.as_view(), name='topic-list'),
    path('topics/<int:pk>/', TopicDetailView.as_view(), name='topic-detail'),
    path('topics/<int:topic_id>/lessons/', LessonListCreateByTopicView.as_view(), name='lesson-by-topic'),
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<int:lesson_id>/quizzes/', QuizListCreateByLessonView.as_view(), name='quiz-by-lesson'),
    path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:quiz_id>/questions/', QuestionListCreateByQuizView.as_view(), name='question-by-quiz'),
    path('quizzes/<int:quiz_id>/questions/bulk/', QuestionBulkCreateView.as_view(), name='question-bulk'),
    path('quizzes/<int:quiz_id>/attempts/', AttemptCreateView.as_view(), name='attempt-create'),
    path('performance/', PerformanceView.as_view(), name='performance'),
]
