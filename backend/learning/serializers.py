from rest_framework import serializers

from .models import Attempt, Lesson, Question, Quiz, Topic


class TopicSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(source='lessons.count', read_only=True)

    class Meta:
        model = Topic
        fields = [
            'id', 'name', 'description', 'level', 'subject',
            'lesson_count', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class LessonSerializer(serializers.ModelSerializer):
    topic = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all(), required=False)

    class Meta:
        model = Lesson
        fields = [
            'id', 'topic', 'title', 'content',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class QuizSerializer(serializers.ModelSerializer):
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), required=False)

    class Meta:
        model = Quiz
        fields = [
            'id', 'lesson', 'title', 'description',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class QuestionSerializer(serializers.ModelSerializer):
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all(), required=False)

    class Meta:
        model = Question
        fields = [
            'id', 'quiz', 'question_text', 'choices', 'correct_answer',
            'created_by', 'created_at', 'updated_at',
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
