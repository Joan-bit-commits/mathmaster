import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from memberships.permissions import IsSchoolAdmin
from schools.models import School

from .models import SubscriptionPlan
from .stripe_service import create_billing_portal_session, create_checkout_session, handle_webhook


class PlanInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price_monthly',
            'price_annual',
            'currency',
            'max_students',
            'max_teachers',
            'max_documents',
            'max_ai_questions_per_month',
            'storage_gb',
            'features',
            'is_popular',
        ]


@csrf_exempt
def stripe_webhook(request):
    try:
        event = stripe.Webhook.construct_event(
            request.body, request.META.get('HTTP_STRIPE_SIGNATURE'), settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)
    handle_webhook(event)
    return HttpResponse(status=200)


class CheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def post(self, request):
        school = School.objects.get(id=request.data.get('school_id'))
        if not request.user.memberships.filter(
            school=school, role__in=('owner', 'admin'), is_active=True
        ).exists():
            return Response({'error': 'Forbidden'}, status=403)
        plan = SubscriptionPlan.objects.get(slug=request.data.get('plan_id'))
        url = create_checkout_session(
            school,
            plan,
            request.data.get('billing_cycle', 'monthly'),
            request.data['success_url'],
            request.data['cancel_url'],
        )
        return Response({'url': url})


class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def post(self, request):
        school = School.objects.get(id=request.data.get('school_id'))
        return Response({'url': create_billing_portal_session(school, request.data['return_url'])})


class PlansListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = PlanInfoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
