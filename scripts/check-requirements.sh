#!/usr/bin/env bash
set -euo pipefail

VENV="backend/.venv-backend/bin/pip"
REQ="backend/requirements.txt"

if ! diff <("$VENV" freeze | sort -fi) <(sort -fi "$REQ") > /dev/null 2>&1; then
  echo ""
  echo "ERROR: backend/requirements.txt is out of sync with .venv-backend."
  echo "Run:  cd backend && .venv-backend/bin/pip freeze > requirements.txt"
  exit 1
fi
