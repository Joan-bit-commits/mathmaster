from django.contrib import admin

from .models import (
    Document,
    DocumentChatSession,
    DocumentChunk,
    DocumentQuestion,
    ScanJob,
)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'document_type', 'processing_status', 'page_count', 'created_at')
    list_filter = ('document_type', 'processing_status', 'used_vision_ocr', 'created_at')
    search_fields = ('title', 'owner__username', 'owner__email', 'detected_subject')
    readonly_fields = ('file_size', 'page_count', 'created_at', 'updated_at')
    raw_id_fields = ('owner',)


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ('document', 'chunk_index', 'page_number', 'token_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('document__title', 'content')
    raw_id_fields = ('document',)
    readonly_fields = ('created_at',)


@admin.register(DocumentChatSession)
class DocumentChatSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'document', 'user', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'document__title', 'user__username', 'user__email')
    raw_id_fields = ('document', 'user')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DocumentQuestion)
class DocumentQuestionAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'session', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('question', 'answer', 'document__title', 'user__username', 'user__email')
    raw_id_fields = ('document', 'user', 'session', 'cited_chunks')
    readonly_fields = ('created_at',)


@admin.register(ScanJob)
class ScanJobAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'detected_uneb_code', 'detected_topic', 'created_at', 'completed_at')
    list_filter = ('status', 'created_at', 'completed_at')
    search_fields = ('user__username', 'user__email', 'detected_uneb_code', 'detected_topic', 'problem_text')
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'completed_at')
