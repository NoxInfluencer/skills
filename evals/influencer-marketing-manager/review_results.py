"""Summarize saved Promptfoo results by metric, keeping runtime errors separate."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from promptfoo_cases import OUTCOME_ASSERTIONS, _run_javascript_assertion


def inspect_shortlist_render(response: dict[str, Any]) -> dict[str, Any] | None:
    """Report observed helper output and propagation, never a business-quality grade."""
    raw = response.get("raw")
    try:
        turn = json.loads(raw) if isinstance(raw, str) else raw
    except (ValueError, TypeError):
        return None
    if not isinstance(turn, dict):
        return None
    items = turn.get("items")
    if not isinstance(items, list):
        return None
    for item in reversed(items):
        if (not isinstance(item, dict) or item.get("type") != "command_execution" or item.get("exit_code") != 0
                or "render_shortlist.py" not in str(item.get("command", ""))):
            continue
        try:
            rendered = json.loads(item.get("aggregated_output", ""))
        except (ValueError, TypeError):
            continue
        if not isinstance(rendered, dict) or not isinstance(rendered.get("markdown"), str) or not rendered["markdown"].strip():
            continue
        return {
            "selected_ids": rendered.get("selected_ids"),
            "selected_count": rendered.get("selected_count"),
            "shortfall": rendered.get("shortfall"),
            "known_quoted_minima_by_currency": rendered.get("known_quoted_minima_by_currency"),
            "table_in_final": isinstance(response.get("output"), str) and rendered["markdown"].strip() in response["output"],
        }
    return None


def inspect_result(row: dict[str, Any], regrade: bool = False) -> dict[str, Any]:
    metadata = row.get("testCase", {}).get("metadata", {})
    response = row.get("response") or {}
    # Promptfoo 0.122.2: 0 = success, 1 = assertion failure, 2 = runtime error.
    runtime_error = row.get("failureReason") == 2 or bool(response.get("error"))
    metrics = {}
    if not runtime_error:
        for component in (row.get("gradingResult") or {}).get("componentResults", []):
            assertion = component.get("assertion") or {}
            name = assertion.get("metric", assertion.get("type", "unknown"))
            metrics[name] = {"pass": component.get("pass"), "reason": component.get("reason", "")}
        if regrade and "task-outcome" in metrics:
            case_id = metadata.get("case_id")
            if case_id not in OUTCOME_ASSERTIONS:
                raise ValueError(f"No current outcome grader for case {case_id}")
            metrics["task-outcome"] = _run_javascript_assertion(case_id, response.get("output", ""))
    return {
        "case_id": metadata.get("case_id"),
        "mode": metadata.get("evaluation_mode", "content"),
        "variant": row.get("provider", {}).get("label", "unknown"),
        "runtime_error": runtime_error,
        "manual_review_required": metadata.get("outcome_review") == "manual",
        "error": (row.get("error") or response.get("error")) if runtime_error else None,
        "metrics": metrics,
        "shortlist_render": inspect_shortlist_render(response) if not runtime_error else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("results", type=Path, nargs="+")
    parser.add_argument("--regrade", action="store_true", help="Replay current outcome graders on saved outputs; no model calls or source-file changes.")
    args = parser.parse_args()
    for path in args.results:
        document = json.loads(path.read_text(encoding="utf-8"))
        rows = document["results"]["results"]
        if not rows:
            raise ValueError(f"No result rows in {path}")
        print(f"\n{path.name} | {document.get('evalId', 'unknown eval')}")
        print("Current outcome-grader replay; NOT a new model run" if args.regrade else "Recorded assertions; NOT an overall Skill-quality score")
        if args.regrade:
            digest = hashlib.sha256(Path(__file__).with_name("promptfoo_cases.py").read_bytes()).hexdigest()
            print(f"Current grader SHA256: {digest}")
        for provider in document.get("config", {}).get("providers", []):
            if isinstance(provider, dict):
                config = provider.get("config", {})
                print(f"  Configured {provider.get('label')}: model={config.get('model')}, reasoning={config.get('model_reasoning_effort')}")
        counts = defaultdict(Counter)
        errors = Counter()
        ungraded = Counter()
        manual = Counter()
        for row in rows:
            result = inspect_result(row, args.regrade)
            key = (result["case_id"], result["mode"], result["variant"])
            if result["runtime_error"]:
                errors[key] += 1
                print(f"  {key}: runtime error: {result['error']}")
                continue
            if not result["metrics"]:
                ungraded[key] += 1
            if result["manual_review_required"]:
                manual[key] += 1
                print(f"  {key}: task outcome requires manual review; evidence checks are not task passes")
            if result["shortlist_render"] is not None:
                print(f"  {key}: observed shortlist render (not business approval): {json.dumps(result['shortlist_render'], ensure_ascii=False)}")
            for name, grade in result["metrics"].items():
                counts[(*key, name)]["pass" if grade["pass"] is True else "fail"] += 1
                if grade["pass"] is not True:
                    print(f"  {key} / {name}: {grade['reason']}")
        for key, count in sorted(counts.items(), key=lambda item: str(item[0])):
            print(f"  {key}: {count['pass']} pass / {count['fail']} fail")
        print(f"Runtime errors: {sum(errors.values())}; rows without assertion results: {sum(ungraded.values())}")
        print(f"Manual task outcomes not graded in this export: {sum(manual.values())}")
    return 0  # This is a read-only report, not a release gate.


if __name__ == "__main__":
    raise SystemExit(main())
