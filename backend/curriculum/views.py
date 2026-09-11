import logging

from django.db import transaction
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStaffMember
from utils.renderers import ServerSentEventRenderer

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
from .services import (
    answer_document,
    answer_document_stream,
    extract_past_paper_questions,
    process_document,
    solve_scanned_problem,
)
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

logger = logging.getLogger(__name__)


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

    def create(self, request, *args, **kwargs):
        # DocumentUploadSerializer (used for validating the POST body) only
        # exposes title/document_type/file — it has no `id`. Left as the
        # default ListCreateAPIView behaviour, the create response would
        # echo that same shape back, meaning the client's `document.id`
        # (used to navigate to the detail screen right after upload) is
        # always undefined. Respond with the full DocumentSerializer
        # representation instead, so the caller gets an id and the
        # now-current processing_status/extracted_text/etc.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            DocumentSerializer(serializer.instance, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def perform_create(self, serializer):
        uploaded = self.request.FILES['file']
        document = serializer.save(owner=self.request.user, file_size=uploaded.size)
        # The mobile app has no separate "process this document" step — it
        # uploads, then immediately navigates to the detail screen expecting
        # content. Previously nothing ever called process_document() unless
        # something explicitly hit /process/, so every upload sat at
        # `pending` forever. Trigger it here instead.
        #
        # This runs synchronously in the request/response cycle (there's no
        # background job queue in this codebase yet), so a large PDF or a
        # slow Gemini OCR call will make the upload response itself slow.
        # That's an acceptable trade-off for now to make uploads work at
        # all; moving this to a background task is the follow-up once a
        # task queue exists.
        try:
            process_document(document)
        except Exception:
            # process_document() already records FAILED + processing_error
            # on the document itself before re-raising. The upload should
            # still succeed — the student should see the (now failed)
            # document and be able to retry via DocumentProcessView,
            # rather than losing the whole upload over a processing error.
            logger.exception('Automatic processing failed for document %s', document.id)


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
    """Non-streaming document Q&A (JSON request/response)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk, owner=request.user)
        record, _ = answer_document(
            document,
            request.data.get('question', ''),
            request.user,
            session_id=request.data.get('session_id'),
        )
        if record is None:
            return Response({'detail': 'No content found in this document.'}, status=400)
        return Response(DocumentQuestionSerializer(record).data)


class DocumentAskStreamView(APIView):
    """SSE streaming document Q&A — this is the endpoint the mobile client's
    askDocumentStream() actually expects; the plain DocumentAskView above
    only ever returned a single JSON body, which askDocumentStream's SSE
    frame parser could never make sense of."""

    permission_classes = [IsAuthenticated]
    # Without this, DRF's content negotiation 406s every request before
    # post() runs: the client sends Accept: text/event-stream, and the
    # default renderer classes (JSON, browsable API) don't declare that
    # media type. See utils/renderers.py for the full explanation.
    renderer_classes = [ServerSentEventRenderer, JSONRenderer]

    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk, owner=request.user)
        response = StreamingHttpResponse(
            answer_document_stream(
                document,
                request.data.get('question', ''),
                request.user,
                session_id=request.data.get('session_id'),
            ),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response


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
        document = serializer.save(
            owner=self.request.user, file_size=uploaded.size, document_type=Document.DocumentType.PAST_PAPER
        )
        # This override replaces DocumentListCreateView.perform_create()
        # entirely (it needs to set document_type), which means it was
        # never inheriting the auto-process-on-upload fix made there —
        # past papers sat at `pending` forever, same bug, same fix.
        try:
            process_document(document)
        except Exception:
            logger.exception('Automatic processing failed for past paper %s', document.id)


class PastPaperExtractView(APIView):
    permission_classes = [IsStaffMember]

    def get(self, request, pk):
        document = get_object_or_404(Document, pk=pk, document_type=Document.DocumentType.PAST_PAPER)
        if document.processing_status in (Document.ProcessingStatus.PENDING, Document.ProcessingStatus.PROCESSING):
            return Response({'detail': 'This paper is still processing. Try again shortly.'}, status=409)
        if document.processing_status == Document.ProcessingStatus.FAILED:
            return Response(
                {'detail': f'Processing failed: {document.processing_error or "unknown error"}'}, status=422
            )
        try:
            questions = extract_past_paper_questions(document)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=409)
        except Exception:
            logger.exception('Past paper extraction failed for document %s', document.id)
            return Response({'detail': 'Could not extract questions from this paper.'}, status=502)
        return Response({'questions': questions})


class PastPaperSaveQuizView(APIView):
    permission_classes = [IsStaffMember]

    def post(self, request, pk):
        from learning.models import Lesson, Question, Quiz

        document = get_object_or_404(Document, pk=pk, document_type=Document.DocumentType.PAST_PAPER)
        lesson_id = request.data.get('lesson_id')
        questions = request.data.get('questions')
        if not lesson_id:
            return Response({'detail': 'lesson_id is required.'}, status=400)
        if not isinstance(questions, list) or not questions:
            return Response({'detail': 'At least one question is required.'}, status=400)

        lesson = get_object_or_404(Lesson, pk=lesson_id)

        with transaction.atomic():
            quiz = Quiz.objects.create(
                lesson=lesson,
                title=request.data.get('title') or f'{document.title} — Quiz',
                description=f'Generated from past paper "{document.title}".',
                created_by=request.user,
            )
            created = []
            for item in questions[:100]:
                if not isinstance(item, dict):
                    continue
                question_text = str(item.get('question') or '').strip()
                if not question_text:
                    continue
                choices = item.get('choices') if isinstance(item.get('choices'), list) else []
                created.append(
                    Question(
                        quiz=quiz,
                        question_text=question_text,
                        choices=[str(c) for c in choices],
                        correct_answer=str(item.get('correct_answer') or ''),
                        created_by=request.user,
                    )
                )
            if not created:
                # Roll back the quiz we just created — every incoming item
                # failed validation, so there's nothing to save.
                transaction.set_rollback(True)
                return Response({'detail': 'No valid questions to save.'}, status=400)
            Question.objects.bulk_create(created)

        return Response(
            {'quiz_id': quiz.id, 'lesson_id': lesson.id, 'question_count': len(created)},
            status=201,
        )