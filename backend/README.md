# Overview

This project contains the backend for the attendance-taker system.

# Instructions

## Virtualenv Installation instructions

Create virtual env and install dependencies with

```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run instructions

### Backend server

Run the server after installing dependencies with

```
cd backend
uvicorn app.main:app --reload
```

### PostgreSQL Database

Run the database with

```
docker run -d \
  --name attendance-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=attendance \
  -p 5432:5432 \
  postgres:16
```

Run migrations (in the backend .venv) with

```
alembic upgrade head
```
