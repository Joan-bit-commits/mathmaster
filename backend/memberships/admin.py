from django.contrib import admin

from .models import Membership


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'school', 'role', 'is_active', 'joined_at', 'last_active_at']
    list_filter = ['role', 'is_active', 'school']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'school__name']
    raw_id_fields = ['user', 'school', 'invited_by']
