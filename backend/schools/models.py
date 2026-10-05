from django.conf import settings as django_settings
from django.db import models
from django.utils.text import slugify


class School(models.Model):
    SCHOOL_TYPE_CHOICES = [
        ('primary', 'Primary'),
        ('secondary', 'Secondary'),
        ('university', 'University'),
        ('tutoring', 'Tutoring Center'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    logo = models.ImageField(upload_to='school_logos/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#0EA5E9')
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    country = models.CharField(max_length=2, default='UG')
    school_type = models.CharField(max_length=20, choices=SCHOOL_TYPE_CHOICES, default='secondary')
    is_active = models.BooleanField(default=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        django_settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='schools_created'
    )

    class Meta:
        ordering = ['name']
        indexes = [models.Index(fields=['is_active']), models.Index(fields=['slug'])]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)[:90]
            candidate = base_slug
            counter = 1
            while type(self).objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f'{base_slug}-{counter}'
                counter += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    @property
    def is_in_trial(self):
        subscription = getattr(self, 'subscription', None)
        return bool(subscription and subscription.status == 'trialing')

    @property
    def is_active_subscription(self):
        subscription = getattr(self, 'subscription', None)
        return bool(subscription and subscription.status in ('trialing', 'active'))


class SchoolDomain(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='domains')
    domain = models.CharField(max_length=255, unique=True)
    is_verified = models.BooleanField(default=False)
    is_primary = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['domain']

    def __str__(self):
        return f'{self.domain} -> {self.school.name}'


class ClassCode(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='class_codes')
    code = models.CharField(max_length=20, unique=True, db_index=True)
    target_class = models.ForeignKey(
        'classes.SchoolClass', on_delete=models.CASCADE, null=True, blank=True, related_name='join_codes'
    )
    target_role = models.CharField(max_length=20, default='student')
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    current_uses = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        django_settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='class_codes_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.code} ({self.school.name})'

    def is_valid(self):
        from django.utils import timezone

        return (
            self.is_active
            and (not self.expires_at or self.expires_at >= timezone.now())
            and (self.max_uses is None or self.current_uses < self.max_uses)
        )
