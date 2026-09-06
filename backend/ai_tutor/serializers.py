from rest_framework import serializers

from .models import ChatMessage, ChatSession


class AITutorRequestSerializer(serializers.Serializer):
    topic = serializers.CharField(max_length=200)
    question = serializers.CharField(max_length=2000)
    level = serializers.CharField(max_length=50, required=False, allow_blank=True)
    context = serializers.CharField(max_length=4000, required=False, allow_blank=True)
    session_id = serializers.IntegerField(required=False)


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = fields


class ChatSessionListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ['id', 'topic', 'title', 'created_at', 'updated_at', 'message_count', 'last_message_preview']
        read_only_fields = fields

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message_preview(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if not last:
            return ''
        return f'{last.content[:80]}...' if len(last.content) > 80 else last.content


class ChatSessionDetailSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'topic', 'title', 'created_at', 'updated_at', 'messages']
        read_only_fields = fields
