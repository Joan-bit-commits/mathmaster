from rest_framework import serializers

from .models import Document, DocumentChatSession, DocumentChunk, DocumentQuestion, ScanJob


class ObjectiveSerializer(serializers.Serializer):
    code = serializers.CharField()
    text = serializers.CharField()
    topics = serializers.ListField()
    difficulty = serializers.CharField()
    estimated_hours = serializers.IntegerField()
    common_misconceptions = serializers.ListField()
    workbook_refs = serializers.ListField()
    level = serializers.CharField(required=False)
    subject = serializers.CharField(required=False)
    strand = serializers.CharField(required=False)


class StrandSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    code = serializers.CharField()
    objectives = ObjectiveSerializer(many=True)


class SubjectSerializer(serializers.Serializer):
    name = serializers.CharField()
    code = serializers.CharField()
    strands = serializers.DictField()


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = (
            'owner',
            'file_size',
            'processing_status',
            'processing_error',
            'page_count',
            'extracted_text',
            'detected_level',
            'detected_subject',
        )


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('title', 'document_type', 'file')

    def validate_file(self, value):
        if value.size > 20 * 1024 * 1024:
            raise serializers.ValidationError('Documents must be 20 MB or smaller.')
        if value.content_type not in ('application/pdf', 'image/jpeg', 'image/png'):
            raise serializers.ValidationError('Only PDF, JPEG, and PNG files are supported.')
        return value


class DocumentChunkSerializer(serializers.ModelSerializer):
    content_preview = serializers.SerializerMethodField()

    class Meta:
        model = DocumentChunk
        fields = ('id', 'document', 'chunk_index', 'page_number', 'content', 'content_preview', 'token_count')

    def get_content_preview(self, obj):
        return obj.content[:240]


class DocumentQuestionSerializer(serializers.ModelSerializer):
    cited_chunks = DocumentChunkSerializer(many=True, read_only=True)

    class Meta:
        model = DocumentQuestion
        fields = ('id', 'document', 'user', 'question', 'answer', 'cited_chunks', 'session', 'created_at')
        read_only_fields = fields


class DocumentChatSessionSerializer(serializers.ModelSerializer):
    messages = DocumentQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = DocumentChatSession
        fields = ('id', 'document', 'user', 'title', 'messages', 'created_at', 'updated_at')


class ScanJobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanJob
        fields = ('image',)


class ScanJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanJob
        fields = '__all__'
        read_only_fields = (
            'user',
            'status',
            'extracted_text',
            'detected_uneb_code',
            'detected_topic',
            'problem_text',
            'solution_text',
            'solution_steps',
            'final_answer',
            'similar_problem_ids',
            'error_message',
            'completed_at',
        )
