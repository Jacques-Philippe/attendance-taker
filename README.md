# Overview

The purpose of this project will be to build an attendance taker web application that allows TAs to track the attendance of students to their sessions.

# Stack

- Frontend; Vue.js + TypeScript application
- Frontend dependency manager; npm
- Backend; FastAPI server
- Backend dependency manager; pip

# Local Development Setup

## First-time setup:

```bash
# Clone repository
git clone <repo-url>
cd attendance-taker

# Create and activate a project virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install pre-commit into the project virtualenv and install git hooks
pip install pre-commit
pre-commit install

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

**Running locally:**

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Running checks manually:**

```bash
# Backend
cd backend
black .
isort .
flake8 .
mypy .
pytest

# Frontend
cd frontend
npm run lint
npm run format
npm test
npm run build
```

# Developer environment

- Dockerized containers
