from django.conf import settings
from django.db import models


class SchoolClass(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='classes')
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=20)
    class_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='classes_led'
    )
    color = models.CharField(max_length=7, blank=True)
    room = models.CharField(max_length=50, blank=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'name', 'academic_year'], name='unique_school_class_year'
            )
        ]
        ordering = ['school', 'level', 'name']
        verbose_name_plural = 'School classes'

    def __str__(self):
        return f'{self.name} ({self.school.name})'

    @property
    def student_count(self):
        return self.enrollments.filter(is_active=True).count()


class ClassEnrollment(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='class_enrollments')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='class_enrollments'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['school_class', 'student'], name='unique_class_student')
        ]
        indexes = [models.Index(fields=['school', 'school_class', 'is_active'])]
