"""Adapt high-signal cases from evals.json for Promptfoo.

The JSON document remains the source of user prompts and qualitative
expectations. This adapter adds only the deterministic checks needed for the
first executable old/new comparison slice.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path
from typing import Any

DEFAULT_CASE_IDS = (10, 12, 19, 20)
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
const lines = text.split(/\r?\n/);
const isNegated = line => /\b(?:no|not|without|rather than|instead of|defer|until|avoid)\b|(?:不|无|不要|暂不|避免|延后)/i.test(line);
const hasPrematureCount = lines.some(line => /\b\d+\s*(?:[-–—]\s*\d+)?\s+(?:unique\s+)?(?:creators?|candidates?|profiles?|channels?)\b/i.test(line) && !isNegated(line));
const hasPrematureMix = lines.some(line => /\b(?:use|set|assign|allocate|target|force|split)\b[^.\n]{0,80}\b\d+\s*%/i.test(line) && !isNegated(line));
const hasAffirmed = pattern => lines.some(line => pattern.test(line) && !isNegated(line));
const hasPrematureWeight = hasAffirmed(/\bweights?\b|\bweighted\s+(?:score|rubric|model)\b|权重/i);
const hasPrematureThreshold = hasAffirmed(/\b(?:set|use|require|apply|target)\b[^.\n]{0,80}\b(?:minimum|threshold|cutoff)\b|(?:设置|采用|要求).{0,30}(?:阈值|门槛)/i);
const avoidsPrematureFixedRules = !(hasPrematureCount || hasPrematureMix || hasPrematureWeight || hasPrematureThreshold);
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
const lines = text.split(/\r?\n/);
const lineWith = (tool, required) => lines.some(line => tool.test(line) && required.test(line));
const checks = [
  lineWith(/17TRACK/i, /样品|寄出|shipment|sample/i) && lineWith(/17TRACK/i, /延误|拍摄|排期|履约|schedule/i),
  lineWith(/OrderTracker/i, /Amazon|TBA/i) && lineWith(/OrderTracker/i, /状态|包裹|履约|package|delivery/i),
  lineWith(/Sign\.?\s*Plus/i, /文档|签名|signature|artifact/i) &&
    !/Sign\.?\s*Plus[^.\n]{0,100}(?:代表|意味着|means|completes?).{0,30}(?:正式协议|formal agreement).{0,30}(?:完成|complete)/i.test(text),
  lineWith(/YouTube\s*To\s*Text/i, /YouTube|达人|视频|频道|creator|video/i) &&
    lineWith(/YouTube\s*To\s*Text/i, /内容|场景|画面|转录|transcript|scene/i),
  !/我(?:已|已经)(?:使用|查询|执行|生成|完成)|(?:I\s+have|I've)(?:\s+already)?\s+(?:run|used|queried|generated)/i.test(text),
];
const hits = checks.filter(Boolean).length;
return {
  pass: hits === checks.length,
  score: hits / checks.length,
  reason: `operational tool decisions: ${hits}/${checks.length}`,
};
""".strip(),
    20: r"""
const text = typeof output === 'string' ? output : JSON.stringify(output);
const laneHits = [
  /3C|3C\/数码|Apple|桌搭|desk setup|tech/i.test(text),
  /户外|露营|outdoor|camping/i.test(text),
  /Shop\s*with\s*me|haul|折扣购物|好物|购物|gifting/i.test(text),
  /学生|校园|student|campus/i.test(text),
];
const checks = [
  /INIU|Pocket\s*Rocket\s*P50/i.test(text) && /YouTube/i.test(text),
  laneHits.filter(Boolean).length >= 3,
  /90\s*(?:天|days?)|近\s*90\s*天/i.test(text) && /长视频|long-form|longform/i.test(text),
  /Shorts|纯\s*Shorts|排除|exclude|dedup|去重|重复|contact|联系/i.test(text),
  /粗筛|初筛|coarse|精筛|fine|精选/i.test(text) && /下一步|next|资料|数据|input|输入/i.test(text),
  !/我(?:已|已经)(?:搜索|查询|联系|发送|执行|完成)|(?:I\s+have|I've)(?:\s+already)?\s+(?:searched|queried|contacted|sent|executed|completed)/i.test(text),
];
const hits = checks.filter(Boolean).length;
return {
  pass: hits === checks.length,
  score: hits / checks.length,
  reason: 'INIU discovery and outreach setup: ' + hits + '/' + checks.length,
};
""".strip(),
}


def _load_cases() -> dict[int, dict[str, Any]]:
    document = json.loads(Path(__file__).with_name("evals.json").read_text(encoding="utf-8"))
    return {case["id"]: case for case in document["evals"]}


def _run_javascript_assertion(case_id: int, output: str) -> dict[str, Any]:
    """Run one local grader against a supplied string for mutation self-tests."""
    script = (
        "const output = JSON.parse(require('fs').readFileSync(0, 'utf8'));"
        f"const result = new Function('output', {json.dumps(OUTCOME_ASSERTIONS[case_id])})(output);"
        "process.stdout.write(JSON.stringify(result));"
    )
    completed = subprocess.run(
        ["node", "-e", script],
        input=json.dumps(output, ensure_ascii=False),
        text=True,
        capture_output=True,
        check=True,
    )
    return json.loads(completed.stdout)


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

        if case_id == 19:
            tests.append(
                {
                    "description": f"[{case_id}-natural] {case['category']}",
                    "vars": {"request": case["prompt"]},
                    "metadata": {
                        "case_id": case_id,
                        "category": case["category"],
                        "trigger": case["trigger"],
                        "evaluation_mode": "natural-routing",
                        "expected_output": case["expected_output"],
                        "expectations": case["expectations"],
                    },
                    "assert": [
                        {
                            "type": "skill-used",
                            "value": SKILL_NAME,
                            "metric": "routing-evidence",
                            "weight": 1,
                        }
                    ],
                }
            )
    return tests


def run_self_test() -> None:
    tests = create_tests({"case_ids": list(DEFAULT_CASE_IDS)})
    assert [test["metadata"]["case_id"] for test in tests] == [10, 12, 19, 19, 20]
    content_tests = [test for test in tests if len(test["assert"]) == 2]
    assert all(test["assert"][0]["weight"] > test["assert"][1]["weight"] for test in content_tests)
    assert tests[0]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert not tests[1]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert tests[1]["assert"][1]["type"] == "not-skill-used"
    assert tests[0]["assert"][1]["type"] == "skill-used"
    assert tests[2]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert tests[3]["vars"]["request"] == _load_cases()[19]["prompt"]
    assert tests[3]["metadata"]["evaluation_mode"] == "natural-routing"
    assert [assertion["type"] for assertion in tests[3]["assert"]] == ["skill-used"]
    assert tests[4]["metadata"]["case_id"] == 20
    assert tests[4]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")

    good_cold_start = (
        "Use a provisional small pilot with coarse search followed by fine review. "
        "Review 3-5 representative long-form pieces from the last 90 days and separate Shorts. "
        "There is no fixed creator count, no weighted score, and no performance threshold yet."
    )
    assert _run_javascript_assertion(10, good_cold_start)["pass"]
    assert not _run_javascript_assertion(
        10,
        good_cold_start + "\nQueue 20-30 creators in the first batch.",
    )["pass"]
    assert _run_javascript_assertion(
        10,
        good_cold_start.replace("no weighted score", "use a checklist rather than a weighted score"),
    )["pass"]

    good_tools = (
        "样品已寄出：用 17TRACK 查看运输进度，再判断是否影响拍摄排期。\n"
        "Amazon Logistics 的 TBA 包裹：用 OrderTracker 查看包裹状态。\n"
        "普通文档签名样式：用 Sign.Plus 生成签名图，正式协议以批准的签署记录为准。\n"
        "YouTube 达人内容复核：用 YouTube To Text 查看视频转录和内容场景。"
    )
    assert _run_javascript_assertion(19, good_tools)["pass"]
    bad_tools = (
        "17TRACK 用于制作签名，并判断拍摄是否延误。\n"
        "OrderTracker 用于生成视频 transcript，Amazon TBA 不需要查询。\n"
        "Sign.Plus 生成签名后就代表正式协议已完成。\n"
        "YouTube To Text 用于查询包裹物流。"
    )
    assert not _run_javascript_assertion(19, bad_tools)["pass"]

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
