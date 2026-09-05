"""Validate the stable influencer-marketing-manager evaluation document."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ALLOWED_TRIGGERS = {"should-trigger", "should-not-trigger", "boundary"}
FIXTURE_ROOT = Path(__file__).with_name("fixtures")


def validate_document(document: Any, fixture_root: Path = FIXTURE_ROOT) -> list[str]:
    """Validate required structure, non-empty text, and unique IDs."""
    errors: list[str] = []

    if not isinstance(document, dict):
        return ["top-level document must be an object"]

    skill_name = document.get("skill_name")
    if skill_name != "influencer-marketing-manager":
        errors.append("skill_name must equal influencer-marketing-manager")

    evals = document.get("evals")
    if not isinstance(evals, list):
        errors.append("evals must be a list")
        return errors

    seen_ids: set[int | str] = set()
    for index, eval_case in enumerate(evals):
        location = f"evals[{index}]"
        if not isinstance(eval_case, dict):
            errors.append(f"{location} must be an object")
            continue

        eval_id = eval_case.get("id")
        if isinstance(eval_id, bool) or not isinstance(eval_id, (int, str)):
            errors.append(f"{location}.id must be a string or integer")
        elif eval_id in seen_ids:
            errors.append(f"duplicate eval id: {eval_id}")
        else:
            seen_ids.add(eval_id)

        for field in ("category", "prompt", "expected_output"):
            value = eval_case.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{location}.{field} must be a non-empty string")

        trigger = eval_case.get("trigger")
        if not isinstance(trigger, str) or trigger not in ALLOWED_TRIGGERS:
            allowed = ", ".join(sorted(ALLOWED_TRIGGERS))
            errors.append(f"{location}.trigger must be one of: {allowed}")

        expectations = eval_case.get("expectations")
        if not isinstance(expectations, list) or not expectations:
            errors.append(f"{location}.expectations must be a non-empty list")
        elif any(not isinstance(item, str) or not item.strip() for item in expectations):
            errors.append(f"{location}.expectations must contain non-empty strings")

        files = eval_case.get("files", [])
        if not isinstance(files, list):
            errors.append(f"{location}.files must be a list")
            continue
        for name in files:
            if not isinstance(name, str) or not name.strip():
                errors.append(f"{location}.files must contain non-empty paths")
                continue
            path = Path(name)
            resolved = (fixture_root / path).resolve()
            if path.is_absolute() or ".." in path.parts or not resolved.is_relative_to(fixture_root.resolve()):
                errors.append(f"{location}.files path escapes fixture directory: {name}")
            elif not resolved.is_file():
                errors.append(f"{location}.files missing fixture: {name}")

    return errors


def run_self_test() -> None:
    """Exercise the validator contract without reading repository data."""
    valid_case = {
        "id": 1,
        "category": "routing",
        "trigger": "should-trigger",
        "prompt": "Plan this creator partnership.",
        "expected_output": "Own the business decision.",
        "expectations": ["Chooses an observable next action"],
    }
    valid = {
        "skill_name": "influencer-marketing-manager",
        "evals": [valid_case],
    }
    assert validate_document(valid) == []

    duplicate_ids = {
        "skill_name": "influencer-marketing-manager",
        "evals": [valid_case, {**valid_case}],
    }
    assert any("duplicate eval id" in error for error in validate_document(duplicate_ids))

    malformed_documents = [
        [],
        {"skill_name": "wrong", "evals": []},
        {"skill_name": "influencer-marketing-manager", "evals": "not-a-list"},
        {
            "skill_name": "influencer-marketing-manager",
            "evals": [{"id": True, "category": "", "prompt": " ", "expected_output": "", "expectations": []}],
        },
        {
            "skill_name": "influencer-marketing-manager",
            "evals": [{**valid_case, "expectations": [" "]}],
        },
        {
            "skill_name": "influencer-marketing-manager",
            "evals": [{**valid_case, "trigger": "maybe"}],
        },
        {
            "skill_name": "influencer-marketing-manager",
            "evals": [{key: value for key, value in valid_case.items() if key != "trigger"}],
        },
        {
            "skill_name": "influencer-marketing-manager",
            "evals": [{**valid_case, "trigger": ["should-trigger"]}],
        },
        *[
            {"skill_name": "influencer-marketing-manager", "evals": [{**valid_case, "files": files}]}
            for files in ("wrong", [None], [""], ["/etc/passwd"], ["../evals.json"], ["missing.txt"])
        ],
    ]
    for malformed in malformed_documents:
        assert validate_document(malformed), malformed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        run_self_test()
        return 0

    eval_path = Path(__file__).with_name("evals.json")
    document: Any = json.loads(eval_path.read_text(encoding="utf-8"))
    errors = validate_document(document)
    if errors:
        for error in errors:
            print(error)
        return 1

    print(f"Validated {len(document['evals'])} evals in {eval_path.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
