from rest_framework import serializers

from .models import DailyStreak, LearningEvent, Performance, Recommendation


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningEvent
        fields = [
            'id', 'event_type', 'topic', 'lesson', 'quiz', 'question', 'metadata',
        ]
        read_only_fields = ['id']

    def validate_event_type(self, value):
        valid = [choice[0] for choice in LearningEvent.EVENT_TYPES]
        if value not in valid:
            raise serializers.ValidationError(f'event_type must be one of: {", ".join(valid)}')
        return value


class SummarySerializer(serializers.Serializer):
    period = serializers.CharField()
    total_lessons_viewed = serializers.IntegerField()
    lessons_completed = serializers.IntegerField()
    quizzes_taken = serializers.IntegerField()
    ai_questions_asked = serializers.IntegerField()
    average_score = serializers.FloatField(allow_null=True)
    topics_covered = serializers.IntegerField()
    current_streak_days = serializers.IntegerField()
    time_spent_minutes = serializers.IntegerField()


class TopicPerformanceSerializer(serializers.Serializer):
    topic_id = serializers.IntegerField()
    topic_name = serializers.CharField()
    level = serializers.CharField()
    average_score = serializers.FloatField()
    best_score = serializers.FloatField()
    attempts = serializers.IntegerField()


class RecommendationSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'topic', 'topic_name', 'recommendation_text', 'average_score', 'created_at']


class TeacherOverviewSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    active_7d = serializers.IntegerField()
    active_30d = serializers.IntegerField()
    top_struggling_topics = serializers.ListField()
    score_distribution = serializers.DictField()


class DailyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStreak
        fields = ['date', 'lessons_completed', 'quizzes_passed']


class PerformanceSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)

    class Meta:
        model = Performance
        fields = ['id', 'topic', 'topic_name', 'average_score', 'attempted_at']
