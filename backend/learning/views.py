from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Topic, Lesson, Quiz, Question, Attempt
from .serializers import (
    TopicSerializer,
    LessonSerializer,
    QuizSerializer,
    QuestionSerializer,
    AttemptSerializer
)

class TopicListView(generics.ListCreateAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class TopicDetailView(generics.RetrieveAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class LessonByTopicListView(generics.ListAPIView):
    serializer_class = LessonSerializer

    def get_queryset(self):
        topic_id = self.kwargs['topic_id']
        return Lesson.objects.filter(topic_id=topic_id)

class LessonDetailView(generics.RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

class QuizByLessonListView(generics.ListAPIView):
    serializer_class = QuizSerializer

    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        return Quiz.objects.filter(lesson_id=lesson_id)

class QuizDetailView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class QuestionByQuizListView(generics.ListAPIView):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        quiz_id = self.kwargs['quiz_id']
        return Question.objects.filter(quiz_id=quiz_id)

class AttemptCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id)
        answers = request.data.get('answers')

        if not isinstance(answers, list):
            return Response({'detail': 'Answers must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

        total = 0
        correct = 0
        for item in answers:
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
        attempt = Attempt.objects.create(student=request.user, quiz=quiz, score=score)
        serializer = AttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PerformanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        attempts = Attempt.objects.filter(student=request.user).select_related('quiz')
        serializer = AttemptSerializer(attempts, many=True)
        return Response(serializer.data)
