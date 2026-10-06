from rest_framework import serializers

from .models import Invitation


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = [
            'id',
            'school',
            'email',
            'role',
            'token',
            'class_level',
            'class_stream',
            'admission_number',
            'target_class',
            'message',
            'status',
            'expires_at',
            'created_at',
        ]
        read_only_fields = ['id', 'token', 'status', 'created_at']
