from django.contrib import admin

from .models import ChatMessage, ChatSession


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'topic', 'title', 'created_at', 'updated_at')
    list_filter = ('topic', 'created_at')
    search_fields = ('student__username', 'title', 'topic')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('student',)
    inlines = [ChatMessageInline]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'role', 'created_at')
    search_fields = ('session__student__username', 'content')
    list_filter = ('role',)
