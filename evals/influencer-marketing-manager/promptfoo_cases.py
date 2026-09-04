"""Adapt high-signal cases from evals.json for Promptfoo.

The JSON document remains the source of user prompts and qualitative
expectations. This adapter adds only the deterministic checks needed for the
first executable old/new comparison slice.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

DEFAULT_CASE_IDS = (10, 12, 19)
SKILL_NAME = "influencer-marketing-manager"


OUTCOME_ASSERTIONS = {
    10: r"""
const text = typeof output === 'string' ? output : JSON.stringify(output);
const positiveChecks = [
  /暂定|初始假设|工作假设|可调整|provisional|working assumption/i.test(text),
  /90\s*(?:天|days?)|60\s*(?:天|days?)|近期.{0,20}活跃|recent.{0,20}activ/i.test(text),
  /长视频|短视频|Shorts|内容形式|format/i.test(text),
  /3\s*(?:[-–—~～至到]|to)\s*5|三\s*(?:至|到)\s*五|three\s+to\s+five/i.test(text),
  /(粗筛|初筛|结构化搜索|coarse|search|搜索)/i.test(text) &&
    /(精筛|精选|深度|fine|fine-qualified)/i.test(text),
  /小批|小型|试跑|验证|复盘|回看|pilot|first batch|first findings|bounded|review point/i.test(text),
];
const avoidsPrematureFixedRules = !(
  /\b\d+\s*(?:[-–—]\s*\d+)?\s+(?:unique\s+)?creators?\b/i.test(text) ||
  /\b\d+\s*%/.test(text) ||
  /\bweights?\b|\bweighted\b|权重/i.test(text) ||
  /at least\s+(?:two|2)\s+relevant pieces/i.test(text)
);
const hits = positiveChecks.filter(Boolean).length;
return {
  pass: hits >= 5 && avoidsPrematureFixedRules,
  score: (hits + Number(avoidsPrematureFixedRules)) / (positiveChecks.length + 1),
  reason: `baseline signals: ${hits}/${positiveChecks.length}; avoids premature fixed rules: ${avoidsPrematureFixedRules}`,
};
""".strip(),
    12: r"""
const text = typeof output === 'string' ? output : JSON.stringify(output);
const identifiesMissingSource =
  /(?:请|麻烦).{0,30}(?:提供|粘贴|发送).{0,80}(?:英文|原文|邮件)/is.test(text) ||
  /(?:provide|paste|send).{0,80}(?:email|source|original)/is.test(text);
const avoidsInventedCompletion = !/已(?:完成|翻译)|译文如下|translation\s*:/i.test(text);
const checks = [identifiesMissingSource, avoidsInventedCompletion];
const hits = checks.filter(Boolean).length;
return {
  pass: hits === checks.length,
  score: hits / checks.length,
  reason: `bounded translation handling: ${hits}/${checks.length}`,
};
""".strip(),
    19: r"""
const text = typeof output === 'string' ? output : JSON.stringify(output);
const checks = [
  /17TRACK/i.test(text) && /延误|拍摄|履约|schedule/i.test(text),
  /OrderTracker/i.test(text) && /Amazon|TBA/i.test(text),
  /Sign\.?\s*Plus/i.test(text) && /正式|协议|签署记录|签名|signature/i.test(text),
  /YouTube\s*To\s*Text/i.test(text) && /视频|画面|频道|场景|transcript/i.test(text),
  !/我已(?:使用|查询|执行|生成|完成)|(?:I\s+have|I've)\s+(?:run|used|queried|generated)/i.test(text),
];
const hits = checks.filter(Boolean).length;
return {
  pass: hits === checks.length,
  score: hits / checks.length,
  reason: `operational tool decisions: ${hits}/${checks.length}`,
};
""".strip(),
}


def _load_cases() -> dict[int, dict[str, Any]]:
    document = json.loads(Path(__file__).with_name("evals.json").read_text(encoding="utf-8"))
    return {case["id"]: case for case in document["evals"]}


def create_tests(config: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    """Return Promptfoo tests for the requested canonical case IDs."""
    requested_ids = (config or {}).get("case_ids", DEFAULT_CASE_IDS)
    if not isinstance(requested_ids, list | tuple) or not requested_ids:
        raise ValueError("case_ids must be a non-empty list")

    cases = _load_cases()
    tests: list[dict[str, Any]] = []
    for case_id in requested_ids:
        if case_id not in cases:
            raise ValueError(f"unknown eval case id: {case_id}")
        if case_id not in OUTCOME_ASSERTIONS:
            raise ValueError(f"case {case_id} has no deterministic outcome assertion")

        case = cases[case_id]
        routing_type = "not-skill-used" if case["trigger"] == "should-not-trigger" else "skill-used"
        tests.append(
            {
                "description": f"[{case_id}] {case['category']}",
                "vars": {
                    "request": (
                        "Use the influencer-marketing-manager skill to handle this request.\n\n"
                        + case["prompt"]
                        if case["trigger"] == "should-trigger"
                        else case["prompt"]
                    )
                },
                "metadata": {
                    "case_id": case_id,
                    "category": case["category"],
                    "trigger": case["trigger"],
                    "expected_output": case["expected_output"],
                    "expectations": case["expectations"],
                },
                "assert": [
                    {
                        "type": "javascript",
                        "value": OUTCOME_ASSERTIONS[case_id],
                        "metric": "task-outcome",
                        "weight": 4,
                    },
                    {
                        "type": routing_type,
                        "value": SKILL_NAME,
                        "metric": "routing-evidence",
                        "weight": 1,
                    },
                ],
            }
        )
    return tests


def run_self_test() -> None:
    tests = create_tests({"case_ids": list(DEFAULT_CASE_IDS)})
    assert [test["metadata"]["case_id"] for test in tests] == list(DEFAULT_CASE_IDS)
    assert all(test["assert"][0]["weight"] > test["assert"][1]["weight"] for test in tests)
    assert tests[0]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert not tests[1]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert tests[1]["assert"][1]["type"] == "not-skill-used"
    assert tests[0]["assert"][1]["type"] == "skill-used"

    for invalid in ([], [999], [1]):
        try:
            create_tests({"case_ids": invalid})
        except ValueError:
            pass
        else:
            raise AssertionError(f"expected invalid case selection to fail: {invalid}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        run_self_test()
        print(f"Validated Promptfoo adapter for cases {', '.join(map(str, DEFAULT_CASE_IDS))}")
        return 0
    print(json.dumps(create_tests(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
