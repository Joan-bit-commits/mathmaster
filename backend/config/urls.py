from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from .health import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/learning/', include('learning.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/ai-tutor/', include('ai_tutor.urls')),
    path('api/curriculum/', include('curriculum.urls')),
    path('api/documents/', include('curriculum.urls_documents')),
    path('api/scan/', include('curriculum.urls_scan')),
    path('api/teacher/past-papers/', include('curriculum.urls_past_papers')),
    path('api/health/', health, name='health'),
    path('', include('django_prometheus.urls')),
]
