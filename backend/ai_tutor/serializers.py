from rest_framework import serializers


class AITutorRequestSerializer(serializers.Serializer):
    topic = serializers.CharField(max_length=200)
    question = serializers.CharField(max_length=2000)
    level = serializers.CharField(max_length=50, required=False, allow_blank=True)
    context = serializers.CharField(max_length=4000, required=False, allow_blank=True)
