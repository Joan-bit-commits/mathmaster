#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python -m gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers "${GUNICORN_WORKERS:-3}"