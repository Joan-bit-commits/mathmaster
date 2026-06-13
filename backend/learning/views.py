from rest_framework import generics
from .models import Topic,Lesson,Quiz,Question,Attempt 
from django.shortcuts import render

# Create your views here.
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
class LessonListView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
class QuizListView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
class QuestionListView(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
class AttemptListView(generics.ListCreateAPIView):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer