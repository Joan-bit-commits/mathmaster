import csv
import io

from django.db import transaction
from django.utils import timezone
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from invitations.models import Invitation
from schools.models import School


class BulkImportStudentsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, school_id):
        school = School.objects.filter(id=school_id).first()
        membership = request.user.memberships.filter(
            school=school, role__in=('owner', 'admin'), is_active=True
        ).first()
        if not school or not membership:
            return Response({'error': 'Forbidden'}, status=403)
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)
        try:
            rows = list(csv.DictReader(io.StringIO(file.read().decode('utf-8'))))
        except (UnicodeDecodeError, csv.Error) as exc:
            return Response({'error': f'Invalid CSV: {exc}'}, status=400)
        required = {'email', 'first_name', 'last_name'}
        if not required.issubset(rows[0].keys() if rows else set()):
            return Response({'error': f'CSV must have columns: {", ".join(sorted(required))}'}, status=400)
        created = []
        errors = []
        with transaction.atomic():
            for line, row in enumerate(rows, start=2):
                email = row.get('email', '').strip().lower()
                if '@' not in email:
                    errors.append({'row': line, 'error': 'Invalid email', 'email': email})
                    continue
                if Invitation.objects.filter(
                    school=school, email=email, role='student', status='pending'
                ).exists():
                    errors.append({'row': line, 'error': 'Already invited', 'email': email})
                    continue
                created.append(
                    Invitation.objects.create(
                        school=school,
                        email=email,
                        role='student',
                        invited_by=request.user,
                        metadata={
                            'first_name': row.get('first_name', '').strip(),
                            'last_name': row.get('last_name', '').strip(),
                        },
                        class_level=row.get('class_level', '').strip(),
                        class_stream=row.get('class_stream', '').strip(),
                        admission_number=row.get('admission_number', '').strip(),
                        expires_at=timezone.now() + timezone.timedelta(days=14),
                    )
                )
        return Response(
            {'created': len(created), 'errors': errors, 'invitation_ids': [item.id for item in created]}
        )
