from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.routers import DefaultRouter

from billing.views import BillingPortalView, CheckoutSessionView, PlansListView, stripe_webhook
from memberships.views import BulkImportStudentsView
from schools.views import ClassCodeViewSet, JoinSchoolByCodeView, SchoolViewSet

from .health import health

router = DefaultRouter()
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'schools/(?P<school_id>[^/.]+)/class-codes', ClassCodeViewSet, basename='class-code')

urlpatterns = [
    path('api/', include(router.urls)),
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
    path('api/schools/join-by-code/', JoinSchoolByCodeView.as_view(), name='join-school'),
    path(
        'api/schools/<int:school_id>/members/bulk-import/',
        BulkImportStudentsView.as_view(),
        name='bulk-import',
    ),
    path('api/billing/webhooks/stripe/', stripe_webhook, name='stripe-webhook'),
    path('api/billing/checkout/', CheckoutSessionView.as_view(), name='checkout'),
    path('api/billing/portal/', BillingPortalView.as_view(), name='billing-portal'),
    path('api/billing/plans/', PlansListView.as_view(), name='plans'),
    path('', include('django_prometheus.urls')),
]
