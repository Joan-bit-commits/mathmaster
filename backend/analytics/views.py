# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import EventSerializer, AggregationRequestSerializer, AggregationResultSerializer


@api_view(['GET'])
def analytics_home(request):
    return Response({"status": "analytics home"})


@api_view(['GET', 'POST'])
def analytics_summary(request):
    if request.method == 'POST':
        serializer = AggregationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Placeholder: return an empty aggregation result
        result = {'metric': serializer.validated_data.get('metric'), 'value': 0}
        return Response(result)
    return Response({"summary": []})


@api_view(['GET', 'POST'])
def analytics_events(request):
    if request.method == 'POST':
        serializer = EventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Process event here (store, forward, etc.) — currently echo back
        return Response(serializer.validated_data, status=201)
    return Response([])




