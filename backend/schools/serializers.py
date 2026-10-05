from rest_framework import serializers

from billing.models import Invoice, Subscription
from classes.models import SchoolClass
from memberships.models import Membership
from memberships.serializers import MembershipSerializer

from .models import AuditLog, ClassCode, School, SchoolDomain


class SchoolSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()
    plan = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = [
            'id',
            'name',
            'slug',
            'logo',
            'primary_color',
            'contact_email',
            'contact_phone',
            'address',
            'country',
            'school_type',
            'is_active',
            'plan',
            'status',
            'settings',
            'created_at',
            'updated_at',
            'student_count',
            'teacher_count',
        ]
        read_only_fields = [
            'slug',
            'created_at',
            'updated_at',
            'plan',
            'status',
            'student_count',
            'teacher_count',
        ]

    def get_student_count(self, obj):
        return obj.memberships.filter(role='student', is_active=True).count()

    def get_teacher_count(self, obj):
        return obj.memberships.filter(role__in=('teacher', 'admin', 'owner'), is_active=True).count()

    def get_plan(self, obj):
        subscription = getattr(obj, 'subscription', None)
        return subscription.plan.slug if subscription else None

    def get_status(self, obj):
        subscription = getattr(obj, 'subscription', None)
        return subscription.status if subscription else None


class SchoolDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolDomain
        fields = ['id', 'domain', 'is_verified', 'is_primary', 'verified_at', 'created_at']
        read_only_fields = ['id', 'verified_at', 'created_at']


class ClassCodeSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ClassCode
        fields = [
            'id',
            'code',
            'url',
            'target_role',
            'target_class',
            'max_uses',
            'current_uses',
            'is_active',
            'expires_at',
            'created_at',
        ]
        read_only_fields = ['id', 'code', 'url', 'current_uses', 'created_at']

    def get_url(self, obj):
        request = self.context.get('request')
        return f'{request.scheme}://{request.get_host()}/join/{obj.code}' if request else f'/join/{obj.code}'


class SchoolDetailSerializer(SchoolSerializer):
    """Extends the base school payload with the subscription fields the web
    settings/billing pages read directly off the School object."""

    logo_url = serializers.SerializerMethodField()
    trial_ends_at = serializers.SerializerMethodField()
    current_period_end = serializers.SerializerMethodField()

    class Meta(SchoolSerializer.Meta):
        fields = SchoolSerializer.Meta.fields + ['logo_url', 'trial_ends_at', 'current_period_end']

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and request is not None:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url if obj.logo else None

    def get_trial_ends_at(self, obj):
        subscription = getattr(obj, 'subscription', None)
        return subscription.trial_ends_at if subscription else None

    def get_current_period_end(self, obj):
        subscription = getattr(obj, 'subscription', None)
        return subscription.current_period_end if subscription else None


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    actor_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ('id', 'actor_name', 'actor_email', 'action', 'target', 'metadata', 'created_at')

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.username
        return 'system'

    def get_actor_email(self, obj):
        return obj.actor.email if obj.actor else ''


class SubscriptionSerializer(serializers.ModelSerializer):
    """Shape expected by the web app's Subscription type: plan slug, amount
    from the plan's current billing cycle, and default payment method last4."""

    plan = serializers.SerializerMethodField()
    amount = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    payment_method_last4 = serializers.SerializerMethodField()
    invoices_url = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = (
            'id', 'plan', 'status', 'billing_cycle', 'amount', 'currency',
            'current_period_start', 'current_period_end', 'trial_ends_at',
            'payment_method_last4', 'invoices_url',
        )

    def get_plan(self, obj):
        return obj.plan.slug

    def get_currency(self, obj):
        return obj.plan.currency

    def get_amount(self, obj):
        return float(obj.plan.price_annual if obj.billing_cycle == 'annual' else obj.plan.price_monthly)

    def get_payment_method_last4(self, obj):
        pm = obj.school.payment_methods.filter(is_default=True).first()
        return pm.last4 if pm else None

    def get_invoices_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(f'/api/schools/{obj.school_id}/invoices/') if request else None


class InvoiceSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(source='issued_at', read_only=True)

    class Meta:
        model = Invoice
        fields = ('id', 'amount', 'currency', 'status', 'period_start', 'period_end', 'paid_at', 'pdf_url', 'created_at')


class SchoolClassSerializer(serializers.ModelSerializer):
    school = serializers.CharField(source='school_id', read_only=True)
    class_teacher_name = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    academic_year = serializers.CharField()

    class Meta:
        model = SchoolClass
        fields = (
            'id', 'school', 'name', 'level', 'class_teacher_name',
            'academic_year', 'student_count', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def get_class_teacher_name(self, obj):
        if obj.class_teacher:
            return obj.class_teacher.get_full_name() or obj.class_teacher.username
        return None

    def get_student_count(self, obj):
        return obj.student_count
