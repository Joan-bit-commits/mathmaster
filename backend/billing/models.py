from decimal import Decimal

from django.db import models
from django.utils import timezone


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    price_annual = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    currency = models.CharField(max_length=3, default='USD')
    max_students = models.PositiveIntegerField(null=True, blank=True)
    max_teachers = models.PositiveIntegerField(null=True, blank=True)
    max_documents = models.PositiveIntegerField(null=True, blank=True)
    max_ai_questions_per_month = models.PositiveIntegerField(null=True, blank=True)
    storage_gb = models.PositiveIntegerField(null=True, blank=True)
    features = models.JSONField(default=dict, blank=True)
    stripe_product_id = models.CharField(max_length=100, blank=True)
    stripe_price_id_monthly = models.CharField(max_length=100, blank=True)
    stripe_price_id_annual = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'price_monthly']

    def __str__(self):
        return f'{self.name} (${self.price_monthly}/mo)'


class Subscription(models.Model):
    STATUS_CHOICES = [
        (value, label)
        for value, label in (
            ('trialing', 'Trial'),
            ('active', 'Active'),
            ('past_due', 'Past Due'),
            ('canceled', 'Canceled'),
            ('expired', 'Expired'),
        )
    ]
    BILLING_CYCLE_CHOICES = [('monthly', 'Monthly'), ('annual', 'Annual')]

    school = models.OneToOneField('schools.School', on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trialing')
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES, default='monthly')
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    canceled_at = models.DateTimeField(null=True, blank=True)
    payment_provider = models.CharField(max_length=20, default='stripe')
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def is_active(self):
        return self.status in ('trialing', 'active') and self.current_period_end > timezone.now()


class Invoice(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='invoices')
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='invoices')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, default='draft')
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    issued_at = models.DateTimeField(auto_now_add=True)
    due_at = models.DateTimeField()
    paid_at = models.DateTimeField(null=True, blank=True)
    stripe_invoice_id = models.CharField(max_length=100, blank=True)
    pdf_url = models.URLField(blank=True)

    class Meta:
        ordering = ['-issued_at']
        indexes = [models.Index(fields=['school', 'status'])]


class UsageRecord(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='usage_records')
    metric = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField(default=1)
    period = models.DateField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['school', 'metric', 'period'], name='unique_school_metric_period')
        ]
        indexes = [models.Index(fields=['school', 'metric', 'period'])]


class PaymentMethod(models.Model):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='payment_methods')
    stripe_payment_method_id = models.CharField(max_length=100)
    brand = models.CharField(max_length=20)
    last4 = models.CharField(max_length=4)
    exp_month = models.PositiveIntegerField(null=True, blank=True)
    exp_year = models.PositiveIntegerField(null=True, blank=True)
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_default', '-created_at']
