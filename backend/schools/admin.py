from django.contrib import admin

from .models import ClassCode, School, SchoolDomain


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'school_type', 'is_active', 'created_at']
    list_filter = ['school_type', 'is_active', 'country']
    search_fields = ['name', 'slug', 'contact_email']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['created_by']


@admin.register(SchoolDomain)
class SchoolDomainAdmin(admin.ModelAdmin):
    list_display = ['domain', 'school', 'is_verified', 'is_primary', 'created_at']
    list_filter = ['is_verified', 'is_primary']
    search_fields = ['domain', 'school__name']
    raw_id_fields = ['school']


@admin.register(ClassCode)
class ClassCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'school', 'target_role', 'current_uses', 'max_uses', 'is_active', 'expires_at']
    list_filter = ['is_active', 'target_role']
    search_fields = ['code', 'school__name']
    raw_id_fields = ['school', 'target_class', 'created_by']
