# Backend Decisions — Open Proposals

These are proposals for team review. **None of them are implemented yet** on
`feature/backend-hardening`; they are documented here so the team can decide
before follow-up work.

## 1. Email verification on register

**Proposal: yes — simple token email.**

Currently registration immediately returns JWTs and the account is fully
active. Recommendation: on register, create a signed one-time token (Django
`signing.dumps` or a `Token` model), email a verification link, and gate
login (or at least sensitive actions) on a `verified` flag until confirmed.

Trade-offs:
- Requires an email provider (SMTP or a transactional provider) — new infra.
- Ugandan students may use limited-email accounts; consider allowing a grace
  period (e.g. 7 days unverified) instead of hard-blocking.
- Adds an endpoint (`/verify-email/`, `/resend-verification/`) and a `User.email_verified` field.

## 2. Refresh-token rotation

**Proposal: yes — enable `ROTATE_REFRESH_TOKENS` (and `BLACKLIST_AFTER_ROTATION`).**

SimpleJWT supports this out of the box. Rotation limits the damage window of a
stolen refresh token; blacklisting invalidates the old token on each refresh.
Requires the `token_blacklist` app and a periodic `flushexpiredtokens`
cron/celery task. Cost: clients must handle 401 on refresh and re-login.

## 3. Soft delete vs hard delete

**Proposal: soft delete via a `deleted_at` timestamp.**

For learning content (Topic/Lesson/Quiz/Question), hard deletes currently
cascade to questions and attempts — destroying student history. A `deleted_at`
timestamp plus a default manager filtering `deleted_at__isnull=True` would:

- preserve attempts/analytics for deleted content,
- allow "restore" in the admin,
- require every queryset to exclude deleted rows (easy to get wrong —
  consider `django-model-utils.SoftDeletableModel`).

Not recommended for `LearningEvent` / `Attempt` — those should be immutable.

## 4. (Additional) Celery

Recommendation generation currently runs in `transaction.on_commit` on the
request thread. If cohort sizes grow, move `generate_recommendations` to
Celery (Redis is already in docker-compose) — flagged for Phase 2.
