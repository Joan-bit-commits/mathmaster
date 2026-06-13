from django.contrib import admin
from .models import (
    Topic,
    Lesson,
    Quiz,
    Question,
    Attempt
)

# Register your models here.
admin.site.register(Topic)
admin.site.register(Lesson)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Attempt)