from rest_framework import serializers

from .models import Membership


class MembershipSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'school',
            'role',
            'student_id',
            'admission_number',
            'class_level',
            'class_stream',
            'is_active',
            'joined_at',
            'last_active_at',
            'preferences',
        ]
        read_only_fields = ['id', 'user_name', 'user_email', 'joined_at', 'last_active_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
