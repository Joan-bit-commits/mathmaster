# Multi-Tenant Implementation Follow-Up

## Overview

Implemented the first shared-database multi-tenant foundation for MathMaster. A `School` represents a tenant/workspace, and `Membership` represents a user’s role within that school. Existing learning, curriculum, AI tutor, and analytics records now carry a school relationship.

The implementation is currently uncommitted and remains on the existing `feature/wire` branch. No branch creation, commit, or push was performed.

## Implemented Features

### Tenant and school models

- Added `School` with:
  - Slug generation and uniqueness.
  - Branding, contact, country, classification, lifecycle, settings, and audit fields.
  - Subscription status helpers.
- Added `SchoolDomain` for custom-domain mapping.
- Added `ClassCode` for school/class joining.
- Added `Membership` with school-specific roles:
  - Owner
  - Admin
  - Teacher
  - Student
  - Parent
- Added school-specific membership profile fields, preferences, status, and activity timestamps.
- Added `SchoolClass` and `ClassEnrollment`.
- Added billing models:
  - `SubscriptionPlan`
  - `Subscription`
  - `Invoice`
  - `UsageRecord`
  - `PaymentMethod`
- Added `Invitation` with token generation, lifecycle state, expiration, and school-specific metadata.
- Added `User.current_school`.

### Existing model scoping

Added school relationships and scoped managers to the existing models:

- Learning: `Topic`, `Lesson`, `Quiz`, `Question`, `Attempt`
- Curriculum: `Document`, `DocumentChunk`, `DocumentChatSession`, `DocumentQuestion`, `ScanJob`
- AI tutor: `ChatSession`, `ChatMessage`
- Analytics: `LearningEvent`, `DailyStreak`, `Performance`, `Recommendation`

The initial FK migrations were created as nullable. Follow-up migrations change these fields to required `PROTECT` relationships after data migration.

### Tenant resolution and permissions

Added `schools.middleware.TenantMiddleware` with resolution order:

1. `X-School-Id` header
2. School subdomain
3. User’s `current_school`

Added membership permissions:

- `IsSchoolMember`
- `IsSchoolAdmin`
- `IsSchoolTeacherOrAdmin`
- `HasQuotaFor`

Added `SchoolScopedManager` and `SchoolScopedQuerySet` with `for_school()` and `for_request()` helpers.

### Billing and Stripe scaffolding

Added quota and usage services for:

- Students
- Teachers
- Documents
- AI questions
- Storage limits

Added plain Stripe scaffolding for:

- Checkout sessions
- Billing portal sessions
- Webhook signature verification
- Basic subscription synchronization

No real Stripe keys or live payment integration were used.

### API and workflows

Added or wired endpoints for:

- School CRUD
- Current user’s schools
- School members
- School usage
- Class codes
- Joining by class code
- Bulk student CSV import
- Billing plans
- Stripe checkout
- Stripe billing portal
- Stripe webhooks
- School switching
- Invitation token acceptance during registration

Existing API routes were retained.

### Admin, signals, and compatibility

- Registered new tenant, membership, billing, invitation, and class models in Django admin.
- Added AI usage tracking signal support.
- Added a compatibility resolver for legacy object creation paths that do not yet provide a school explicitly.
- Updated bulk question creation to propagate the parent quiz’s school because `bulk_create()` bypasses model save signals.

## Files Added

### New applications

- `backend/schools/`
- `backend/memberships/`
- `backend/billing/`
- `backend/invitations/`
- `backend/classes/`

These contain app configs, models, serializers, views, permissions, middleware, managers, services, Stripe integration, admin registrations, signals, tests, and migrations as applicable.

### New migrations

- `backend/accounts/migrations/0002_user_current_school.py`
- `backend/schools/migrations/0001_initial.py`
- `backend/schools/migrations/0002_default_school_for_existing_users.py`
- `backend/schools/migrations/0003_school_required.py`
- `backend/memberships/migrations/0001_initial.py`
- `backend/billing/migrations/0001_initial.py`
- `backend/billing/migrations/0002_initial.py`
- `backend/invitations/migrations/0001_initial.py`
- `backend/classes/migrations/0001_initial.py`
- `backend/classes/migrations/0002_initial.py`
- Existing-app school FK migrations under:
  - `backend/learning/migrations/`
  - `backend/curriculum/migrations/`
  - `backend/ai_tutor/migrations/`
  - `backend/analytics/migrations/`

## Existing Files Changed

- `.env.example`
- `backend/requirements.txt`
- `backend/config/settings.py`
- `backend/config/urls.py`
- `backend/accounts/models.py`
- `backend/accounts/views.py`
- `backend/accounts/urls.py`
- `backend/learning/models.py`
- `backend/learning/views.py`
- `backend/curriculum/models.py`
- `backend/ai_tutor/models.py`
- `backend/analytics/models.py`

The exact final diff should be reviewed with `git diff` before committing because some files were also modified by formatters or other automated edits.

## Dependency Notes

The requested dependency list contained package versions that are not available on PyPI:

- `django-tenants==0.13.0` was unavailable. It was removed because this implementation uses shared-database tenancy and does not use `django-tenants`.
- `django-stripe-subscriptions==1.0.0` was unavailable. It was removed in favor of the plain `stripe` package.
- `django-money==1.5.0` was unavailable. It was replaced with the published `django-money==3.6.1` release.

The existing repository requirement is `Django==6.0.6`, despite the original feature request referring to Django 5.0. The implementation was validated against the repository’s current Django 6 configuration.

## Data Migration Behavior

`schools.0002_default_school_for_existing_users`:

- Creates a personal school for each existing user.
- Creates an owner membership.
- Sets `User.current_school`.
- Assigns existing records to schools using common ownership fields.
- Assigns remaining unscoped records to the first created personal school when a fallback is needed.

The required-field migrations are owned by their respective applications because Django does not allow a migration in `schools` to alter fields owned by other apps.

## Validation Performed

Passed:

- `python manage.py check`
- `python manage.py makemigrations --check --dry-run`
- Python bytecode compilation for the backend modules.
- Ruff lint and formatting after safe auto-fixes.
- Tenant and learning regression slice: `31 passed`.
- Test collection: existing tests were successfully discovered.

The focused test command used SQLite to avoid requiring the Docker Postgres hostname:

```bash
DB_ENGINE=django.db.backends.sqlite3 .venv/bin/pytest \
  schools/tests memberships/tests billing/tests learning/tests/test_content.py \
  -q --tb=no --no-cov
```

Warnings observed during focused tests:

- Missing local `staticfiles/` directory.
- DRF pagination warning for unordered topic querysets.

## Known Errors and Remaining Work

The complete backend suite is not green yet. The latest full-suite run completed with failures concentrated in legacy paths:

- AI tutor session/message flows:
  - Existing code assumes a string or session identifier in places now interacting with school-aware session objects.
  - Several AI tutor tests fail with `AttributeError: 'str' object has no attribute 'school_id'` or downstream `session_id` errors.
- Analytics recommendations:
  - Some recommendation creation paths still omit the required school FK.
  - These fail with `NOT NULL constraint failed` errors.
- Curriculum document processing:
  - Upload and Celery processing paths still have school propagation gaps.
  - Several tests return HTTP 500 or fail on required document school fields.
- Other full-suite failures remain in legacy integrations that were not updated to pass the active school explicitly.

These failures indicate that the compatibility resolver covers normal model saves but not every indirect creation path, task, bulk operation, or service-level constructor. The next implementation phase should make school propagation explicit in those paths rather than relying on fallback behavior.

## Recommended Next Steps

1. Update AI tutor services and views to resolve the active school from `request.school` and pass it into session/message creation.
2. Update analytics signal/service code to copy school from the related topic, lesson, quiz, or request context.
3. Update curriculum upload, document chunking, scan, and Celery task paths to preserve the document’s school.
4. Add API tests for school isolation across every existing viewset and service.
5. Run the full suite with Docker Postgres and Redis enabled, not only SQLite.
6. Add full billing, Stripe webhook, invitation, bulk import, and school API view tests.
7. Review and commit the work in logical groups after the full suite is green.

## Current Status

The multi-tenant foundation is implemented and the core tenant slice is validated. It is not yet ready to be called production-complete because several existing AI tutor, analytics, and curriculum workflows still need explicit school propagation and the complete test suite remains failing.
