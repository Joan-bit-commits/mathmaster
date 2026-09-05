from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStaffMember

from .models import Document, DocumentChatSession, ScanJob
from .serializers import (
    DocumentChatSessionSerializer,
    DocumentChunkSerializer,
    DocumentQuestionSerializer,
    DocumentSerializer,
    DocumentUploadSerializer,
    ScanJobCreateSerializer,
    ScanJobSerializer,
)
from .services import answer_document, process_document, solve_scanned_problem
from .structure import (
    APPROVED_TEXTBOOKS,
    LOCAL_PROBLEMS,
    UGANDA_LEVELS,
    UGANDA_SYLLABUS,
    UNEB_FORMAT,
    WORKED_EXAMPLES,
    get_objective,
    get_strand,
    search_objectives,
)


class LevelsView(APIView):
    def get(self, request):
        result = []
        for code, name in UGANDA_LEVELS.items():
            subjects = UGANDA_SYLLABUS.get(code, {})
            result.append(
                {'level': code, 'name': name, 'subject_count': len(subjects), 'subjects': list(subjects)}
            )
        return Response(result)


class LevelDetailView(APIView):
    def get(self, request, level):
        data = UGANDA_SYLLABUS.get(level.upper())
        return Response(
            data or {'detail': 'Level not found.'},
            status=status.HTTP_200_OK if data else status.HTTP_404_NOT_FOUND,
        )


class ObjectiveView(APIView):
    def get(self, request, code):
        objective = get_objective(code.upper())
        return Response(
            objective or {'detail': 'Objective not found.'},
            status=status.HTTP_200_OK if objective else status.HTTP_404_NOT_FOUND,
        )


class StrandView(APIView):
    def get(self, request, level, code):
        strand = get_strand(level.upper(), f'{level.upper()}.M.{code}')
        return Response(
            strand or {'detail': 'Strand not found.'},
            status=status.HTTP_200_OK if strand else status.HTTP_404_NOT_FOUND,
        )


class CurriculumLookupView(APIView):
    def get(self, request, kind):
        if kind == 'textbooks':
            return Response(APPROVED_TEXTBOOKS.get(request.query_params.get('level', '').upper(), []))
        if kind == 'worked-examples':
            return Response(WORKED_EXAMPLES.get(request.query_params.get('code', ''), []))
        if kind == 'local-problems':
            problems = LOCAL_PROBLEMS.get(request.query_params.get('code', ''), [])
            difficulty = request.query_params.get('difficulty')
            return Response(
                [item for item in problems if not difficulty or item.get('difficulty') == difficulty]
            )
        if kind == 'uneb-format':
            return Response(UNEB_FORMAT.get(request.query_params.get('exam', 'UCE').upper(), {}))
        return Response(search_objectives(request.query_params.get('q', '')))


class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Document.objects.all()

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)

    def get_serializer_class(self):
        return DocumentUploadSerializer if self.request.method == 'POST' else DocumentSerializer

    def perform_create(self, serializer):
        uploaded = self.request.FILES['file']
        serializer.save(owner=self.request.user, file_size=uploaded.size)


class DocumentDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)


class DocumentProcessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk, owner=request.user)
        process_document(document)
        return Response(DocumentSerializer(document).data)


class DocumentChunksView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentChunkSerializer

    def get_queryset(self):
        return Document.objects.get(pk=self.kwargs['pk'], owner=self.request.user).chunks.all()


class DocumentChunkDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentChunkSerializer

    def get_queryset(self):
        return Document.objects.get(pk=self.kwargs['pk'], owner=self.request.user).chunks.filter(
            pk=self.kwargs['chunk_id']
        )


class DocumentAskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk, owner=request.user)
        record, _ = answer_document(document, request.data.get('question', ''), request.user)
        if record is None:
            return Response({'detail': 'No content found in this document.'}, status=400)
        return Response(DocumentQuestionSerializer(record).data)


class DocumentSessionsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentChatSessionSerializer

    def get_queryset(self):
        return DocumentChatSession.objects.filter(document_id=self.kwargs['pk'], user=self.request.user)


class DocumentSessionDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentChatSessionSerializer

    def get_queryset(self):
        return DocumentChatSession.objects.filter(
            document_id=self.kwargs['pk'], user=self.request.user, id=self.kwargs['session_id']
        )


class ScanSolveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ScanJobCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        scan = serializer.save(user=request.user)
        try:
            solve_scanned_problem(scan)
        except Exception as exc:
            scan.status = ScanJob.ScanStatus.FAILED
            scan.error_message = str(exc)
            scan.save(update_fields=['status', 'error_message'])
        return Response(ScanJobSerializer(scan).data, status=status.HTTP_201_CREATED)


class ScanHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScanJobSerializer

    def get_queryset(self):
        return ScanJob.objects.filter(user=self.request.user)


class ScanJobDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScanJobSerializer

    def get_queryset(self):
        return ScanJob.objects.filter(user=self.request.user)


class PastPaperUploadView(DocumentListCreateView):
    permission_classes = [IsStaffMember]

    def perform_create(self, serializer):
        uploaded = self.request.FILES['file']
        serializer.save(
            owner=self.request.user, file_size=uploaded.size, document_type=Document.DocumentType.PAST_PAPER
        )


class PastPaperExtractView(APIView):
    permission_classes = [IsStaffMember]

    def get(self, request, pk):
        document = get_object_or_404(Document, pk=pk, document_type=Document.DocumentType.PAST_PAPER)
        return Response(
            {
                'questions': [
                    {'question': line.strip(), 'type': 'short-answer', 'marks': 1}
                    for line in document.extracted_text.splitlines()
                    if line.strip()
                ][:100]
            }
        )


class PastPaperSaveQuizView(APIView):
    permission_classes = [IsStaffMember]

    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk, document_type=Document.DocumentType.PAST_PAPER)
        return Response(
            {
                'detail': 'Extract the questions first, then map them to a learning lesson.',
                'document_id': document.id,
            },
            status=501,
        )
