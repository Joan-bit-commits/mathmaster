from django.contrib import admin

from .models import Invitation


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ['email', 'school', 'role', 'status', 'expires_at', 'created_at']
    list_filter = ['status', 'role', 'school']
    search_fields = ['email', 'token', 'school__name']
    raw_id_fields = ['school', 'target_class', 'accepted_by', 'revoked_by', 'invited_by']
