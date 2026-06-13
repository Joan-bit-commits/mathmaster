from django.contrib import admin
from .models import (
    Performance,
    Recommendation
)

# Register your models here.
admin.site.register(Performance)
admin.site.register(Recommendation)