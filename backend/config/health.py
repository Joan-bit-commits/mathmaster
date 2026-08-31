import os

from django.db import connection
from django.db.utils import OperationalError, ProgrammingError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from utils.gemini import gemini_configured

VERSION = os.getenv('APP_VERSION', '1.0.0')


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    """Liveness/readiness probe: 200 healthy, 503 unhealthy."""
    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
    except (OperationalError, ProgrammingError):
        db_ok = False

    healthy = db_ok
    body = {
        'status': 'healthy' if healthy else 'unhealthy',
        'db': 'up' if db_ok else 'down',
        'version': VERSION,
        'gemini_configured': gemini_configured(),
    }
    return Response(body, status=status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE)
