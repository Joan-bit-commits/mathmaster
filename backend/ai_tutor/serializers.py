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
        fields = ('id', 'role', 'content', 'created_at')


class ChatSessionSerializer(serializers.ModelSerializer):
    """List-view shape for GET /api/ai-tutor/sessions/.

    ChatSession has no dedicated `title` field, so one is derived from the
    session's first user message (falling back to the topic) — this mirrors
    what the mobile client's mock data (mocks/aiTutor.js) already expects
    a session to look like: {id, title, topic, updated_at, message_count}.
    message_count is expected to be annotated onto the queryset by the view
    (Count('messages')) rather than computed per-row here, to avoid an
    extra query per session in the list.
    """

    message_count = serializers.IntegerField(read_only=True)
    title = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ('id', 'topic', 'title', 'message_count', 'created_at', 'updated_at')

    def get_title(self, obj):
        first_message = obj.messages.filter(role='user').first()
        if first_message:
            return first_message.content[:60]
        return obj.topic or 'Chat session'


class ChatSessionDetailSerializer(ChatSessionSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta(ChatSessionSerializer.Meta):
        fields = ChatSessionSerializer.Meta.fields + ('messages',)
