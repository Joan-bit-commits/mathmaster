import logging

from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Uniform error envelope: {error: {code, message, details?}}."""
    response = drf_exception_handler(exc, context)

    if response is None:
        if isinstance(exc, Http404):
            response = Response({}, status=status.HTTP_404_NOT_FOUND)
            code, message, details = 'NOT_FOUND', 'Resource not found.', None
        elif isinstance(exc, PermissionDenied):
            response = Response({}, status=status.HTTP_403_FORBIDDEN)
            code, message, details = 'FORBIDDEN', 'Permission denied.', None
        else:
            logger.exception('Unhandled exception at %s', context.get('view'))
            response = Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            code, message, details = 'SERVER_ERROR', 'Internal server error.', None
    else:
        detail = response.data
        if isinstance(detail, dict) and 'detail' in detail and len(detail) == 1:
            detail_text = str(detail['detail'])
            details = None
        elif isinstance(detail, dict):
            details = {k: v for k, v in detail.items() if k != 'detail'}
            detail_text = str(detail.get('detail') or 'Validation failed.')
        else:
            details = None
            detail_text = str(detail)

        code_map = {
            status.HTTP_400_BAD_REQUEST: 'VALIDATION_ERROR',
            status.HTTP_401_UNAUTHORIZED: 'UNAUTHORIZED',
            status.HTTP_403_FORBIDDEN: 'FORBIDDEN',
            status.HTTP_404_NOT_FOUND: 'NOT_FOUND',
            status.HTTP_405_METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
            status.HTTP_429_TOO_MANY_REQUESTS: 'THROTTLED',
            status.HTTP_500_INTERNAL_SERVER_ERROR: 'SERVER_ERROR',
            status.HTTP_503_SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
        }
        code = code_map.get(response.status_code, 'ERROR')
        message = detail_text

    body = {'error': {'code': code, 'message': message}}
    if details:
        body['error']['details'] = details

    response.data = body
    return response
