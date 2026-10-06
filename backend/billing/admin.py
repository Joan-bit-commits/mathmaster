from django.contrib import admin

from .models import Invoice, PaymentMethod, Subscription, SubscriptionPlan, UsageRecord

admin.site.register(SubscriptionPlan)
admin.site.register(Subscription)
admin.site.register(Invoice)
admin.site.register(UsageRecord)
admin.site.register(PaymentMethod)
