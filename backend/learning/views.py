from django.core.cache import cache
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStudent, IsTeacherOrAdmin
from analytics.services import generate_recommendations
from analytics.signals_utils import track_event

from .models import Attempt, Lesson, Question, Quiz, Topic
from .serializers import (
    AttemptSerializer,
    BulkQuestionListSerializer,
    LessonSerializer,
    QuestionPublicSerializer,
    QuestionSerializer,
    QuizSerializer,
    TopicSerializer,
)


def _set_created_by(serializer, request):
    serializer.save(created_by=request.user)


@method_decorator(cache_page(60 * 5, key_prefix='topics:list'), name='get')
class TopicListCreateView(generics.ListCreateAPIView):
    serializer_class = TopicSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        qs = Topic.objects.all().select_related('created_by')
        level = self.request.query_params.get('level')
        subject = self.request.query_params.get('subject')
        if level:
            qs = qs.filter(level=level)
        if subject:
            qs = qs.filter(subject__iexact=subject)
        return qs

    def perform_create(self, serializer):
        _set_created_by(serializer, self.request)


class TopicDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [IsTeacherOrAdmin]

    def perform_update(self, serializer):
        _set_created_by(serializer, self.request)


class LessonListCreateByTopicView(generics.ListCreateAPIView):
    """GET /topics/{topic_id}/lessons/ (authenticated) and POST (teacher/admin)."""
    serializer_class = LessonSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Lesson.objects.filter(topic_id=self.kwargs['topic_id'])

    def perform_create(self, serializer):
        topic = get_object_or_404(Topic, id=self.kwargs['topic_id'])
        serializer.save(topic=topic, created_by=self.request.user)


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsTeacherOrAdmin]

    def perform_update(self, serializer):
        _set_created_by(serializer, self.request)


class QuizListCreateByLessonView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Quiz.objects.filter(lesson_id=self.kwargs['lesson_id'])

    def perform_create(self, serializer):
        lesson = get_object_or_404(Lesson, id=self.kwargs['lesson_id'])
        serializer.save(lesson=lesson, created_by=self.request.user)


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsTeacherOrAdmin]

    def perform_update(self, serializer):
        _set_created_by(serializer, self.request)


class QuestionListCreateByQuizView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuestionSerializer
        user = self.request.user
        if user.is_authenticated and (user.role in ('teacher', 'admin') or user.is_superuser):
            return QuestionSerializer
        return QuestionPublicSerializer

    def get_queryset(self):
        return Question.objects.filter(quiz_id=self.kwargs['quiz_id'])

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz, id=self.kwargs['quiz_id'])
        serializer.save(quiz=quiz, created_by=self.request.user)


class QuestionBulkCreateView(APIView):
    """POST /api/learning/quizzes/{quiz_id}/questions/bulk/ (max 100)."""
    permission_classes = [IsTeacherOrAdmin]

    def post(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id)
        serializer = BulkQuestionListSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        questions = serializer.validated_data['questions']
        created = [
            Question(quiz=quiz, created_by=request.user, **q)
            for q in questions
        ]
        with transaction.atomic():
            Question.objects.bulk_create(created)
        return Response(
            {'created': len(created)},
            status=status.HTTP_201_CREATED,
        )


class AttemptCreateView(APIView):
    """Students submit quiz answers; scoring + recommendation generation."""
    permission_classes = [IsStudent]
    throttle_scope = 'quiz_attempt'

    def post(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id)
        answers = request.data.get('answers')

        if not isinstance(answers, list):
            return Response(
                {'detail': 'Answers must be a list.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total = 0
        correct = 0
        for item in answers:
            if not isinstance(item, dict):
                continue
            question_id = item.get('question')
            answer_value = item.get('answer')
            if question_id is None or answer_value is None:
                continue
            try:
                question = Question.objects.get(id=question_id, quiz=quiz)
            except Question.DoesNotExist:
                continue
            total += 1
            if str(question.correct_answer).strip().lower() == str(answer_value).strip().lower():
                correct += 1

        score = (correct / total * 100) if total > 0 else 0
        with transaction.atomic():
            attempt = Attempt.objects.create(student=request.user, quiz=quiz, score=score)
            transaction.on_commit(lambda: generate_recommendations(request.user))

        track_event(request.user, 'quiz_submit', quiz=quiz)
        serializer = AttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PerformanceView(APIView):
    """Student-only: their own attempt history."""
    permission_classes = [IsStudent]

    def get(self, request):
        attempts = Attempt.objects.filter(student=request.user).select_related('quiz')
        serializer = AttemptSerializer(attempts, many=True)
        return Response(serializer.data)
