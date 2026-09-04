# Environment Variables

All configuration is read from environment variables via [python-decouple](https://github.com/HBNetwork/python-decouple). A `.env` file placed in the repo root (or `backend/`) is loaded automatically. Copy `.env.example` as a starting point — never commit real `.env` files.

## Core Django

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `dev-insecure-secret-key-change-me` | Django secret key. **Must** be a long random string in production. |
| `DEBUG` | `true` | Debug mode. Must be `false` in production (enables HSTS, secure cookies, SSL redirect). |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated list of allowed hostnames. |
| `LOG_LEVEL` | `INFO` | Root log level: `DEBUG`, `INFO`, `WARNING`, `ERROR`. |

## Database (PostgreSQL)

| Variable | Default | Description |
|---|---|---|
| `DB_NAME` | `mathmaster_db` | Database name. |
| `DB_USER` | `postgres` | Database user. |
| `DB_PASSWORD` | `password` | Database password. |
| `DB_HOST` | `localhost` | Database host. |
| `DB_PORT` | `5433` | Database port (compose maps Postgres to 5433). |

## Gemini (AI tutor)

| Variable | Default | Description |
|---|---|---|
| `GENAI_API_KEY` | *(empty)* | Google Generative AI API key. Empty disables the AI tutor (endpoints return 503). |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name used by the tutor. |

## JWT

| Variable | Default | Description |
|---|---|---|
| `JWT_ACCESS_MIN` | `60` | Access token lifetime in minutes. |
| `JWT_REFRESH_DAYS` | `1` | Refresh token lifetime in days. |
| `JWT_ROTATE_REFRESH` | `false` | Rotate refresh tokens on refresh (recommended for production). |

## CORS

| Variable | Default | Description |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated exact origins allowed to call the API. |

## DRF / throttling / pagination

| Variable | Default | Description |
|---|---|---|
| `THROTTLE_ANON_RATE` | `30/min` | Anonymous request rate. |
| `THROTTLE_USER_RATE` | `200/min` | Authenticated request rate. |
| `THROTTLE_AUTH_RATE` | `5/min` | Register/login rate per IP. |
| `PAGE_SIZE` | `20` | Page size for paginated list endpoints. |

## Analytics / recommendations

| Variable | Default | Description |
|---|---|---|
| `RECOMMENDATION_TTL_DAYS` | `14` | Days before a stored recommendation expires on read. |
| `RECOMMENDATION_MIN_AVG_SCORE` | `60` | Topics with avg score below this are recommended. |
| `RECOMMENDATION_MAX_ITEMS` | `5` | Max recommendations per student. |

## Ops

| Variable | Default | Description |
|---|---|---|
| `SENTRY_DSN` | *(empty)* | Sentry DSN. Empty disables Sentry. |
| `SECURE_SSL_REDIRECT` | `true` | Redirect HTTP→HTTPS (only when `DEBUG=false`). |
| `SECURE_HSTS_SECONDS` | `31536000` | HSTS max-age (only when `DEBUG=false`). |