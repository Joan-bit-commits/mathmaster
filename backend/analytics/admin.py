from django.contrib import admin

from .models import DailyStreak, LearningEvent, Performance, Recommendation


@admin.register(LearningEvent)
class LearningEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'event_type', 'topic', 'quiz', 'created_at')
    search_fields = ('student__username', 'event_type')
    list_filter = ('event_type', 'created_at')
    date_hierarchy = 'created_at'


@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'lessons_completed', 'quizzes_passed')
    search_fields = ('student__username',)
    list_filter = ('date',)


@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'topic', 'average_score', 'attempted_at')
    search_fields = ('student__username', 'topic__name')
    list_filter = ('topic',)


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'topic', 'average_score', 'created_at')
    search_fields = ('student__username', 'topic__name')
    list_filter = ('topic',)
