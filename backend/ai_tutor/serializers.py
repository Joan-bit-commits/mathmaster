from rest_framework import serializers

from utils.geogebra import extract_geogebra
from utils.prompts import REFUSAL_PHRASE

from .models import ChatMessage, ChatSession


class AITutorRequestSerializer(serializers.Serializer):
    topic = serializers.CharField(max_length=200)
    question = serializers.CharField(max_length=2000)
    level = serializers.CharField(max_length=50, required=False, allow_blank=True)
    context = serializers.CharField(max_length=4000, required=False, allow_blank=True)
    session_id = serializers.IntegerField(required=False)


class GeoGebraPayloadSerializer(serializers.Serializer):
    """Read-only shape of the validated GeoGebra sketch payload."""

    view = serializers.ChoiceField(choices=('2D', '3D'))
    title = serializers.CharField()
    commands = serializers.ListField(child=serializers.CharField())
    axes = serializers.BooleanField(required=False)
    grid = serializers.BooleanField(required=False)
    x_min = serializers.FloatField(required=False)
    x_max = serializers.FloatField(required=False)
    y_min = serializers.FloatField(required=False)
    y_max = serializers.FloatField(required=False)
    x_label = serializers.CharField(required=False, allow_blank=True)
    y_label = serializers.CharField(required=False, allow_blank=True)
    z_label = serializers.CharField(required=False, allow_blank=True)


class ChatMessageSerializer(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()
    geogebra = serializers.SerializerMethodField()
    is_refusal = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ('id', 'role', 'content', 'geogebra', 'is_refusal', 'created_at')

    def get_geogebra(self, obj):
        if obj.role != 'assistant':
            return None
        _visible, geogebra = extract_geogebra(obj.content)
        return geogebra

    def get_content(self, obj):
        """Present the visible answer with the [GEOGEBRA_DATA] tag stripped
        (the raw content is persisted so the sketch data survives)."""
        if obj.role != 'assistant':
            return obj.content
        visible, _geogebra = extract_geogebra(obj.content)
        return visible

    def get_is_refusal(self, obj):
        return obj.role == 'assistant' and obj.content.strip().startswith(REFUSAL_PHRASE)


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
