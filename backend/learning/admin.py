from django.contrib import admin

from .models import (
    Lesson,
    Question,
    Quiz,
    Topic,
)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'level', 'subject', 'created_by', 'updated_at')
    search_fields = ('name', 'subject')
    list_filter = ('level', 'subject')
    autocomplete_fields = ('created_by',)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'topic', 'created_by', 'updated_at')
    search_fields = ('title', 'topic__name')
    list_filter = ('topic__level', 'topic')
    autocomplete_fields = ('topic', 'created_by')


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'lesson', 'created_by', 'updated_at')
    search_fields = ('title', 'lesson__title')
    list_filter = ('lesson__topic',)
    autocomplete_fields = ('lesson', 'created_by')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question_text', 'quiz', 'created_by', 'updated_at')
    search_fields = ('question_text', 'quiz__title')
    list_filter = ('quiz__lesson__topic',)
    autocomplete_fields = ('quiz', 'created_by')
