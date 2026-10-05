from django.contrib import admin

from .models import ClassEnrollment, SchoolClass


@admin.register(SchoolClass)
class SchoolClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'school', 'level', 'academic_year', 'class_teacher', 'is_archived']
    list_filter = ['school', 'level', 'academic_year', 'is_archived']
    search_fields = ['name', 'school__name']
    raw_id_fields = ['school', 'class_teacher']


@admin.register(ClassEnrollment)
class ClassEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['school_class', 'student', 'school', 'is_active', 'enrolled_at']
    list_filter = ['school', 'is_active']
    search_fields = ['student__email', 'school_class__name']
    raw_id_fields = ['school', 'school_class', 'student']
