#!/usr/bin/env python3
"""
Verify all locale JSON files have exactly the same keys as en.json.
Exits non-zero and prints a diff if any file is missing or has extra keys.
"""

import json
import sys
from pathlib import Path


def flatten(obj: dict, prefix: str = "") -> set[str]:
    """Recursively flatten a nested dict into a set of dotted key paths."""
    keys: set[str] = set()
    for k, v in obj.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys |= flatten(v, full_key)
        else:
            keys.add(full_key)
    return keys


def main() -> int:
    locales_dir = Path(__file__).parent.parent / "frontend" / "src" / "i18n" / "locales"
    reference_file = locales_dir / "en.json"

    with reference_file.open(encoding="utf-8") as f:
        reference_keys = flatten(json.load(f))

    errors = 0
    for locale_file in sorted(locales_dir.glob("*.json")):
        if locale_file == reference_file:
            continue
        with locale_file.open(encoding="utf-8") as f:
            locale_keys = flatten(json.load(f))

        missing = reference_keys - locale_keys
        extra = locale_keys - reference_keys

        if missing or extra:
            errors += 1
            print(f"\n{locale_file.name} differs from en.json:")
            for key in sorted(missing):
                print(f"  missing : {key}")
            for key in sorted(extra):
                print(f"  extra   : {key}")

    if errors:
        print(f"\n{errors} locale file(s) out of sync with en.json.", file=sys.stderr)
        return 1

    print("All locale files are in sync with en.json.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
