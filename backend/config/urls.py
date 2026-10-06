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
from schools.admin_views import (
    AssignClassTeacherView,
    AuditLogsView,
    BulkInviteView,
    CancelSubscriptionView,
    CurrentClassCodeView,
    GenerateClassCodeView,
    InvitationDetailView,
    SchoolClassDetailView,
    SchoolClassesView,
    SchoolInvitationsView,
    SchoolInvoicesView,
    SchoolSubscriptionView,
)
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
    path('api/schools/<int:school_id>/classes/', SchoolClassesView.as_view(), name='school-classes'),
    path(
        'api/schools/<int:school_id>/classes/<int:class_id>/assign-teacher/',
        AssignClassTeacherView.as_view(),
        name='assign-class-teacher',
    ),
    path(
        'api/schools/<int:school_id>/classes/<int:pk>/',
        SchoolClassDetailView.as_view(),
        name='school-class-detail',
    ),
    path('api/schools/<int:school_id>/invitations/', SchoolInvitationsView.as_view(), name='school-invitations'),
    path('api/schools/<int:school_id>/invitations/bulk/', BulkInviteView.as_view(), name='bulk-invite'),
    path(
        'api/schools/<int:school_id>/invitations/<int:invitation_id>/resend/',
        InvitationDetailView.as_view(),
        name='invitation-resend',
    ),
    path(
        'api/schools/<int:school_id>/invitations/<int:invitation_id>/',
        InvitationDetailView.as_view(),
        name='invitation-detail',
    ),
    path('api/schools/<int:school_id>/audit-logs/', AuditLogsView.as_view(), name='audit-logs'),
    path('api/schools/<int:school_id>/subscription/', SchoolSubscriptionView.as_view(), name='school-subscription'),
    path(
        'api/schools/<int:school_id>/subscription/cancel/',
        CancelSubscriptionView.as_view(),
        name='cancel-subscription',
    ),
    path('api/schools/<int:school_id>/invoices/', SchoolInvoicesView.as_view(), name='school-invoices'),
    path(
        'api/schools/<int:school_id>/class-code/generate/',
        GenerateClassCodeView.as_view(),
        name='generate-class-code',
    ),
    path('api/schools/<int:school_id>/class-code/', CurrentClassCodeView.as_view(), name='current-class-code'),
    path('api/billing/webhooks/stripe/', stripe_webhook, name='stripe-webhook'),
    path('api/billing/checkout/', CheckoutSessionView.as_view(), name='checkout'),
    path('api/billing/portal/', BillingPortalView.as_view(), name='billing-portal'),
    path('api/billing/plans/', PlansListView.as_view(), name='plans'),
    path('', include('django_prometheus.urls')),
]
