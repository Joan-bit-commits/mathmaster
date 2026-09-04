"""
Django settings for the MathMaster project.

All secrets and deployment-specific configuration are read from environment
variables (via python-decouple, with a `.env` file supported for local dev).
See docs/ENV.md for the full list of variables.
"""

import logging.config
from datetime import timedelta
from pathlib import Path

from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------

SECRET_KEY = config('SECRET_KEY', default='dev-insecure-secret-key-change-me')
DEBUG = config('DEBUG', default=True, cast=bool)
LOG_LEVEL = config('LOG_LEVEL', default='INFO')

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())
if DEBUG:
    ALLOWED_HOSTS = list(ALLOWED_HOSTS) + ['testserver']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    'django_prometheus',
    # Local apps
    'accounts',
    'learning',
    'analytics',
    'ai_tutor',
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'analytics.middleware.AnalyticsMiddleware',
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]

# CORS: explicit allow-list. No CORS_ALLOW_ALL_ORIGINS in any environment.
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173',
    cast=Csv(),
)

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='mathmaster_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5433'),
    }
}

# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'accounts.validators.ComplexityValidator',
    },
]

# ---------------------------------------------------------------------------
# Internationalization / static
# ---------------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# DRF / JWT
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': config('PAGE_SIZE', default=20, cast=int),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': config('THROTTLE_ANON_RATE', default='30/min'),
        'user': config('THROTTLE_USER_RATE', default='200/min'),
        'auth': config('THROTTLE_AUTH_RATE', default='5/min'),
        'ai_tutor': '20/hour',
        'quiz_attempt': '60/min',
    },
    'EXCEPTION_HANDLER': 'config.exceptions.custom_exception_handler',
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_MIN', default=60, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_DAYS', default=1, cast=int)),
    'ROTATE_REFRESH_TOKENS': config('JWT_ROTATE_REFRESH', default=False, cast=bool),
}

AUTH_USER_MODEL = 'accounts.User'

# ---------------------------------------------------------------------------
# Gemini
# ---------------------------------------------------------------------------

GENAI_API_KEY = config('GENAI_API_KEY', default='')
GEMINI_MODEL = config('GEMINI_MODEL', default='gemini-1.5-flash')

# ---------------------------------------------------------------------------
# Cache (LocMemCache for dev; swap for Redis in production)
# ---------------------------------------------------------------------------

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'mathmaster-default',
    }
}

# ---------------------------------------------------------------------------
# Security (production-only settings are guarded by DEBUG=False)
# ---------------------------------------------------------------------------

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

if not DEBUG:
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=31536000, cast=int)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# ---------------------------------------------------------------------------
# Analytics / recommendations
# ---------------------------------------------------------------------------

RECOMMENDATION_TTL_DAYS = config('RECOMMENDATION_TTL_DAYS', default=14, cast=int)
RECOMMENDATION_MIN_AVG_SCORE = config('RECOMMENDATION_MIN_AVG_SCORE', default=60.0, cast=float)
RECOMMENDATION_MAX_ITEMS = config('RECOMMENDATION_MAX_ITEMS', default=5, cast=int)

# ---------------------------------------------------------------------------
# Sentry (optional)
# ---------------------------------------------------------------------------

SENTRY_DSN = config('SENTRY_DSN', default='')

SPECTACULAR_SETTINGS = {
    'TITLE': 'MathMaster API',
    'DESCRIPTION': 'AI-powered math learning platform (Ugandan curriculum).',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=config('SENTRY_TRACES_RATE', default=0.1, cast=float),
        send_default_pii=False,
    )

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

LOGGING_CONFIG = None  # configured manually below so LOG_LEVEL is respected
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'console': {
            'format': '[%(asctime)s] %(levelname)s %(name)s: %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'console',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': LOG_LEVEL,
    },
    'loggers': {
        'django': {'level': LOG_LEVEL, 'propagate': True},
        'django.request': {'level': LOG_LEVEL, 'propagate': True},
        'analytics': {'level': LOG_LEVEL, 'propagate': True},
        'ai_tutor': {'level': LOG_LEVEL, 'propagate': True},
    },
}
logging.config.dictConfig(LOGGING)
