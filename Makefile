.PHONY: setup run test seed lint migrate shell compose-up compose-down

setup:            ## create venv and install dependencies
	cd backend && python3 -m venv venv
	cd backend && ./venv/bin/pip install --upgrade pip
	cd backend && ./venv/bin/pip install -r requirements.txt -r requirements-dev.txt
	cd backend && python manage.py migrate

run:              ## run the dev server
	cd backend && python manage.py runserver

migrate:          ## apply migrations
	cd backend && python manage.py migrate

seed:             ## seed the Ugandan curriculum
	cd backend && python manage.py seed_learning

seed-reset:       ## wipe and re-seed
	cd backend && python manage.py seed_learning --reset

test:             ## run pytest with coverage
	cd backend && pytest

lint:             ## ruff check + format check
	cd backend && ruff check . && ruff format --check .

fmt:              ## apply ruff formatting
	cd backend && ruff format . && ruff check --fix .

compose-up:       ## start api + postgres + redis via docker compose
	docker compose up --build

compose-down:
	docker compose down -v
