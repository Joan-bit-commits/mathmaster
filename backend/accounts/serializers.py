from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            role=validated_data.get('role', 'student'),
            password=validated_data['password']
        )
        user.save()
        return user
    class RegisterSerializer(serializers.ModelSerializer):  
        password2 = serializers.CharField(write_only=True)
        class Meta:
            model = User
            fields = ['username', 'email', 'role', 'password', 'password2']
            extra_kwargs = {'password': {'write_only': True}}
            def create(self, validated_data):
                password = validated_data.pop('password')
                password2 = validated_data.pop('password2')
                if password != password2:
                    raise serializers.ValidationError("Passwords do not match.")
                user = User.objects.create_user(**validated_data, password=password)
                return user