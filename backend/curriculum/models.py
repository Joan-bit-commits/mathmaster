from django.conf import settings
from django.db import models


class Document(models.Model):
    class DocumentType(models.TextChoices):
        TEXTBOOK = 'textbook', 'Textbook chapter'
        PAST_PAPER = 'past_paper', 'Past paper'
        NOTES = 'notes', 'Personal notes'
        WORKSHEET = 'worksheet', 'Worksheet'
        OTHER = 'other', 'Other'

    class ProcessingStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        READY = 'ready', 'Ready'
        FAILED = 'failed', 'Failed'

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DocumentType.choices, default=DocumentType.OTHER)
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_size = models.PositiveIntegerField()
    page_count = models.PositiveIntegerField(null=True, blank=True)
    extracted_text = models.TextField(blank=True, default='')
    processing_status = models.CharField(
        max_length=20, choices=ProcessingStatus.choices, default=ProcessingStatus.PENDING
    )
    processing_error = models.TextField(blank=True, default='')
    detected_level = models.CharField(max_length=20, blank=True, default='')
    detected_subject = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.owner.username})'


class DocumentChunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.PositiveIntegerField()
    page_number = models.PositiveIntegerField(null=True, blank=True)
    content = models.TextField()
    embedding = models.JSONField(default=list, blank=True)
    token_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['document', 'chunk_index']
        constraints = [
            models.UniqueConstraint(fields=['document', 'chunk_index'], name='unique_document_chunk')
        ]


class DocumentChatSession(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chat_sessions')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='document_sessions'
    )
    title = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']


class DocumentQuestion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='questions')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='document_questions'
    )
    question = models.TextField()
    answer = models.TextField(blank=True, default='')
    cited_chunks = models.ManyToManyField(DocumentChunk, related_name='citations', blank=True)
    session = models.ForeignKey(
        DocumentChatSession, on_delete=models.CASCADE, related_name='messages', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class ScanJob(models.Model):
    class ScanStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        OCR = 'ocr', 'Reading image'
        SOLVING = 'solving', 'Solving problem'
        READY = 'ready', 'Ready'
        FAILED = 'failed', 'Failed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scans')
    image = models.ImageField(upload_to='scans/%Y/%m/')
    status = models.CharField(max_length=20, choices=ScanStatus.choices, default=ScanStatus.PENDING)
    extracted_text = models.TextField(blank=True, default='')
    detected_uneb_code = models.CharField(max_length=20, blank=True, default='')
    detected_topic = models.CharField(max_length=255, blank=True, default='')
    problem_text = models.TextField(blank=True, default='')
    solution_text = models.TextField(blank=True, default='')
    solution_steps = models.JSONField(default=list, blank=True)
    final_answer = models.TextField(blank=True, default='')
    similar_problem_ids = models.JSONField(default=list, blank=True)
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
