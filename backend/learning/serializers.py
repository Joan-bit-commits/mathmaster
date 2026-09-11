from rest_framework import serializers

from .models import Attempt, Lesson, Question, Quiz, Topic


class TopicSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(source='lessons.count', read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id',
            'name',
            'description',
            'level',
            'subject',
            'lesson_count',
            'progress',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_progress(self, obj):
        """Percentage of this topic's lessons the requesting student has
        completed, derived from LearningEvent('lesson_complete') rows.

        The mobile app already reads `topic.progress` (topics.jsx, and the
        student dashboard) — it just had nothing real to read, since this
        field never existed here. Returns None for unauthenticated/non-
        student requests (progress is meaningless for a teacher browsing
        the catalog), so the client's `topic.progress || 0` fallback still
        does the right thing in that case.
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated or getattr(request.user, 'role', None) != 'student':
            return None

        total_lessons = obj.lessons.count()
        if not total_lessons:
            return 0

        from analytics.models import LearningEvent

        completed = (
            LearningEvent.objects.filter(student=request.user, event_type='lesson_complete', lesson__topic=obj)
            .values('lesson_id')
            .distinct()
            .count()
        )
        return round(min(completed, total_lessons) / total_lessons * 100)


class LessonSerializer(serializers.ModelSerializer):
    topic = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all(), required=False)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'topic',
            'title',
            'content',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class QuizSerializer(serializers.ModelSerializer):
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), required=False)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'lesson',
            'title',
            'description',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class QuestionSerializer(serializers.ModelSerializer):
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all(), required=False)

    class Meta:
        model = Question
        fields = [
            'id',
            'quiz',
            'question_text',
            'choices',
            'correct_answer',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate(self, data):
        choices = data.get('choices')
        correct_answer = data.get('correct_answer')
        # On PATCH the fields may be absent; only validate when provided.
        if choices is not None and correct_answer and choices:
            if str(correct_answer).strip() not in [str(c).strip() for c in choices]:
                raise serializers.ValidationError(
                    {'correct_answer': 'correct_answer must be one of the provided choices.'}
                )
        return data


class QuestionPublicSerializer(serializers.ModelSerializer):
    """For students: no correct_answer leakage."""

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'question_text', 'choices']


class AttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = Attempt
        fields = ['id', 'student', 'quiz', 'quiz_title', 'score', 'attempted_at']
        read_only_fields = ['student', 'quiz_title', 'attempted_at']


class BulkQuestionSerializer(serializers.Serializer):
    question_text = serializers.CharField(max_length=2000)
    choices = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list,
    )
    correct_answer = serializers.CharField(max_length=200)

    def validate(self, data):
        choices = data.get('choices') or []
        if choices and data['correct_answer'] not in choices:
            raise serializers.ValidationError(
                {'correct_answer': 'correct_answer must be one of the provided choices.'}
            )
        return data


class BulkQuestionListSerializer(serializers.Serializer):
    questions = BulkQuestionSerializer(many=True)

    def validate_questions(self, value):
        if not value:
            raise serializers.ValidationError('At least one question is required.')
        if len(value) > 100:
            raise serializers.ValidationError('Bulk upload is limited to 100 questions.')
        return value