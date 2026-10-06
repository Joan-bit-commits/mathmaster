import stripe
from django.conf import settings
from django.utils import timezone

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(school, plan, billing_cycle, success_url, cancel_url):
    from .models import Subscription

    price_id = plan.stripe_price_id_annual if billing_cycle == 'annual' else plan.stripe_price_id_monthly
    if not price_id:
        raise ValueError(f'Plan {plan.slug} has no Stripe price ID configured')
    subscription, _ = Subscription.objects.get_or_create(
        school=school,
        defaults={
            'plan': plan,
            'current_period_start': timezone.now(),
            'current_period_end': timezone.now(),
        },
    )
    customer_id = subscription.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(
            email=school.contact_email, name=school.name, metadata={'school_id': str(school.id)}
        )
        customer_id = customer.id
        subscription.stripe_customer_id = customer_id
        subscription.save(update_fields=['stripe_customer_id'])
    session = stripe.checkout.Session.create(
        customer=customer_id,
        line_items=[{'price': price_id, 'quantity': 1}],
        mode='subscription',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={'school_id': str(school.id), 'plan_slug': plan.slug},
    )
    return session.url


def create_billing_portal_session(school, return_url):
    subscription = school.subscription
    if not subscription.stripe_customer_id:
        raise ValueError('No Stripe customer for this school')
    return stripe.billing_portal.Session.create(
        customer=subscription.stripe_customer_id, return_url=return_url
    ).url


def handle_webhook(event):
    from schools.models import School

    from .models import Subscription, SubscriptionPlan

    event_type = event['type']
    data = event['data']['object']
    if event_type not in (
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
    ):
        return
    metadata = data.get('metadata', {})
    school = School.objects.filter(id=metadata.get('school_id')).first()
    plan = SubscriptionPlan.objects.filter(slug=metadata.get('plan_slug')).first()
    if not school or not plan:
        return
    Subscription.objects.update_or_create(school=school, defaults={'plan': plan})
