from rest_framework import serializers

from .models import ClassCode, School, SchoolDomain


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
