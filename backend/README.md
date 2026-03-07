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

Run the server after installing dependencies with

```
cd backend
uvicorn app.main:app --reload
```
