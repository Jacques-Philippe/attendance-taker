#!/usr/bin/env python3
"""
Verify that backend/.venv-backend is in sync with backend/requirements.txt.
Exits non-zero if the venv is missing or its installed packages differ.
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
VENV_PIP = ROOT / "backend" / ".venv-backend" / "bin" / "pip"
REQUIREMENTS = ROOT / "backend" / "requirements.txt"


def normalise(lines: list[str]) -> set[str]:
    """Lower-case and strip each non-empty, non-comment line."""
    return {
        line.strip().lower()
        for line in lines
        if line.strip() and not line.startswith("#")
    }


def main() -> int:
    if not VENV_PIP.is_file() or not VENV_PIP.stat().st_mode & 0o111:
        print(f"ERROR: Virtual environment not found at {VENV_PIP}")
        print(
            "Create it with: cd backend && python -m venv .venv-backend && .venv-backend/bin/pip install -r requirements.txt"
        )
        return 1

    frozen = subprocess.run(
        [str(VENV_PIP), "freeze"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.splitlines()

    required = REQUIREMENTS.read_text(encoding="utf-8").splitlines()

    installed = normalise(frozen)
    expected = normalise(required)

    missing = expected - installed
    extra = installed - expected

    if missing or extra:
        print("\nERROR: backend/requirements.txt is out of sync with .venv-backend.")
        for pkg in sorted(missing):
            print(f"  missing : {pkg}")
        for pkg in sorted(extra):
            print(f"  extra   : {pkg}")
        print("\nRun:  cd backend && .venv-backend/bin/pip freeze > requirements.txt")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
