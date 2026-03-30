#!/usr/bin/env python3
"""
Verify all locale JSON files have exactly the same keys as en.json,
and that interpolation placeholders (e.g. {name}) match per key.
Exits non-zero and prints a diff if any file is out of sync.
"""

import json
import re
import sys
from pathlib import Path


def flatten_keys(obj: dict, prefix: str = "") -> set[str]:
    """Recursively flatten a nested dict into a set of dotted key paths."""
    keys: set[str] = set()
    for k, v in obj.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys |= flatten_keys(v, full_key)
        else:
            keys.add(full_key)
    return keys


def flatten_values(obj: dict, prefix: str = "") -> dict[str, str]:
    """Recursively flatten a nested dict into a dotted key -> string value map.
    Non-string leaf values are omitted."""
    result: dict[str, str] = {}
    for k, v in obj.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            result |= flatten_values(v, full_key)
        elif isinstance(v, str):
            result[full_key] = v
    return result


def extract_placeholders(text: str) -> set[str]:
    """Return the set of {word} interpolation tokens in text."""
    return set(re.findall(r"\{(\w+)\}", text))


def main() -> int:
    locales_dir = Path(__file__).parent.parent / "frontend" / "src" / "i18n" / "locales"
    reference_file = locales_dir / "en.json"

    with reference_file.open(encoding="utf-8") as f:
        reference_data = json.load(f)

    reference_keys = flatten_keys(reference_data)
    reference_values = flatten_values(reference_data)

    errors = 0
    for locale_file in sorted(locales_dir.glob("*.json")):
        if locale_file == reference_file:
            continue

        with locale_file.open(encoding="utf-8") as f:
            locale_data = json.load(f)

        locale_keys = flatten_keys(locale_data)
        locale_values = flatten_values(locale_data)

        missing_keys = reference_keys - locale_keys
        extra_keys = locale_keys - reference_keys

        if missing_keys or extra_keys:
            errors += 1
            print(f"\n{locale_file.name} differs from en.json:")
            for key in sorted(missing_keys):
                print(f"  missing key : {key}")
            for key in sorted(extra_keys):
                print(f"  extra key   : {key}")

        # Check placeholder parity for keys present in both files
        for key in sorted(reference_keys & locale_keys):
            ref_val = reference_values.get(key)
            loc_val = locale_values.get(key)
            if ref_val is None or loc_val is None:
                continue
            ref_ph = extract_placeholders(ref_val)
            loc_ph = extract_placeholders(loc_val)
            missing_ph = ref_ph - loc_ph
            extra_ph = loc_ph - ref_ph
            if missing_ph or extra_ph:
                errors += 1
                print(f"\n{locale_file.name} placeholder mismatch in '{key}':")
                for ph in sorted(missing_ph):
                    print(f"  missing placeholder : {{{ph}}}")
                for ph in sorted(extra_ph):
                    print(f"  extra placeholder   : {{{ph}}}")

    if errors:
        print(f"\n{errors} issue(s) found in locale files.", file=sys.stderr)
        return 1

    print("All locale files are in sync with en.json.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
