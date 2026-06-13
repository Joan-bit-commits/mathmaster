
from rest_framework import serializers
from datetime import datetime


class EventSerializer(serializers.Serializer):
	"""Generic analytics event serializer."""
	id = serializers.CharField(required=False, allow_blank=True)
	name = serializers.CharField(max_length=200)
	value = serializers.FloatField(required=False, allow_null=True)
	meta = serializers.DictField(child=serializers.CharField(), required=False)
	timestamp = serializers.DateTimeField(default_timezone=None, required=False)

	def validate_timestamp(self, value):
		# If timestamp not provided, set to now
		if value is None:
			return datetime.utcnow()
		return value


class AggregationRequestSerializer(serializers.Serializer):
	"""Serializer for aggregation requests (e.g., counts, sums over a period)."""
	metric = serializers.ChoiceField(choices=[('count', 'count'), ('sum', 'sum'), ('avg', 'avg')])
	event_name = serializers.CharField(max_length=200, required=False)
	start = serializers.DateTimeField(required=False)
	end = serializers.DateTimeField(required=False)

	def validate(self, attrs):
		start = attrs.get('start')
		end = attrs.get('end')
		if start and end and start > end:
			raise serializers.ValidationError('start must be before end')
		return attrs


class AggregationResultSerializer(serializers.Serializer):
	metric = serializers.CharField()
	event_name = serializers.CharField(required=False)
	value = serializers.FloatField()
	start = serializers.DateTimeField(required=False)
	end = serializers.DateTimeField(required=False)
