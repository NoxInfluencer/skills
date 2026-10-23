"""Validate the stable NoxInfluencer evaluation document."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def validate_document(document: Any) -> list[str]:
    """校验评测文档结构、必填文本和编号唯一性。"""
    errors: list[str] = []

    # 校验顶层结构
    if not isinstance(document, dict):
        return ["top-level document must be an object"]
    if not isinstance(document.get("skill_name"), str) or not document["skill_name"].strip():
        errors.append("skill_name must be a non-empty string")
    evals = document.get("evals")
    if not isinstance(evals, list):
        errors.append("evals must be a list")
        return errors

    # 校验每条评测及唯一编号
    seen_ids: set[int | str] = set()
    for index, eval_case in enumerate(evals):
        location = f"evals[{index}]"
        if not isinstance(eval_case, dict):
            errors.append(f"{location} must be an object")
            continue

        eval_id = eval_case.get("id")
        if isinstance(eval_id, bool) or not isinstance(eval_id, (int, str)):
            errors.append(f"{location}.id must be a string or integer")
            continue
        if eval_id in seen_ids:
            errors.append(f"duplicate eval id: {eval_id}")
        seen_ids.add(eval_id)

        prompt = eval_case.get("prompt")
        if not isinstance(prompt, str) or not prompt.strip():
            errors.append(f"{location}.prompt must be a non-empty string")

        expectations = eval_case.get("expectations")
        if not isinstance(expectations, list) or not expectations:
            errors.append(f"{location}.expectations must be a non-empty list")
        elif any(not isinstance(item, str) or not item.strip() for item in expectations):
            errors.append(f"{location}.expectations must contain non-empty strings")
    return errors


def run_self_test() -> None:
    """不读取仓库数据，直接验证校验器的稳定契约。"""
    valid = {
        "skill_name": "noxinfluencer",
        "evals": [
            {
                "id": 1,
                "prompt": "Create a standalone email task.",
                "expectations": ["Does not include campaign_id"],
            }
        ],
    }
    assert validate_document(valid) == []

    duplicate_ids = {
        "skill_name": "noxinfluencer",
        "evals": [valid["evals"][0], {**valid["evals"][0]}],
    }
    errors = validate_document(duplicate_ids)
    assert any("duplicate eval id: 1" in error for error in errors)

    malformed_documents = [
        [],
        {"skill_name": "", "evals": []},
        {"skill_name": "noxinfluencer", "evals": "not-a-list"},
        {
            "skill_name": "noxinfluencer",
            "evals": [{"id": 2, "prompt": " ", "expectations": []}],
        },
        {
            "skill_name": "noxinfluencer",
            "evals": [{"id": 3, "prompt": "Valid", "expectations": [" "]}],
        },
    ]
    for malformed in malformed_documents:
        assert validate_document(malformed), malformed


def main() -> int:
    """运行内置测试，或校验仓库中的评测文件。"""
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
