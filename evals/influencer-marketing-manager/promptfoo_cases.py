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

DEFAULT_CASE_IDS = (10, 12, 13, 19, 20)
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
const lines = text.replace(/[*_`]/g, '').split(/[.!?;。！？；\n]+/);
const isNegated = line => /\b(?:no|not|without|rather than|instead of|defer|until|avoid)\b|(?:不|无|不要|暂不|避免|延后)/i.test(line);
const hasPrematureCount = lines.some(line => /\b\d+\s*(?:[-–—]\s*\d+)?[\s-]+(?:(?:unique|deduplicated|qualified|potential)\s+)*(?:creators?|candidates?|profiles?|channels?)\b|\d+\s*(?:[-–—至到]\s*\d+)?\s*(?:个|位|名)?\s*(?:达人|候选人|频道)/i.test(line) && !isNegated(line));
const hasPrematureMix = lines.some(line => /\b(?:use|set|assign|allocate|target|force|split)\b[^.\n]{0,80}\b\d+\s*%/i.test(line) && !isNegated(line));
const hasAffirmed = pattern => lines.some(line => pattern.test(line) && !isNegated(line));
const hasPrematureWeight = hasAffirmed(/\bweights?\b|\bweighted\s+(?:score|rubric|model)\b|权重/i);
const hasPrematureThreshold = hasAffirmed(/\b(?:set|use|require|apply|target)\b[^.\n]{0,80}\b(?:minimum|threshold|cutoff)\b[^.\n]{0,30}\d|(?:设置|采用|要求).{0,30}(?:阈值|门槛).{0,20}\d/i);
const avoidsPrematureFixedRules = !(hasPrematureCount || hasPrematureMix || hasPrematureWeight || hasPrematureThreshold);
const hits = positiveChecks.filter(Boolean).length;
return {
  pass: hits >= 5 && avoidsPrematureFixedRules,
  score: (hits + Number(avoidsPrematureFixedRules)) / (positiveChecks.length + 1),
  reason: `baseline signals: ${hits}/${positiveChecks.length}; premature rules: ${Object.entries({count: hasPrematureCount, mix: hasPrematureMix, weight: hasPrematureWeight, threshold: hasPrematureThreshold}).filter(([, hit]) => hit).map(([name]) => name).join(', ') || 'none'}`,
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
  reason: `missing source handling (not translation quality): ${hits}/${checks.length}`,
};
""".strip(),
    13: r"""
const text = (typeof output === 'string' ? output : JSON.stringify(output)).replace(/[*_`]/g, '');
const checks = {
  'uk-next-action': /(?:UK|英国)[\s\S]{0,100}(?:discovery|search|探索|拓展|搜索)|(?:discovery|search|探索|拓展|搜索)[\s\S]{0,100}(?:UK|英国)/i.test(text),
  'crm-us': /CRM[^.;。；\n]{0,100}(?:\bUS\b|美国)/i.test(text),
  'brief-us': /(?:brief|简报)[^.;。；\n]{0,100}(?:\bUS\b|美国)/i.test(text),
  'dated-history': /2026-08-01|August\s+1|1\s+August|8\s*月\s*1\s*日/i.test(text) && /histor|历史|dated|过往/i.test(text),
  'hold-writes': /(?:do not|no|not|without|hold|unchanged)[^\n]{0,90}(?:send|outreach|writ|chang|updat)|(?:不|未|暂缓)[^\n]{0,50}(?:发送|邀约|修改|更新|写入)/i.test(text),
};
const failed = Object.keys(checks).filter(key => !checks[key]);
return {pass: !failed.length, score: (Object.keys(checks).length - failed.length) / Object.keys(checks).length, reason: `source reconciliation smoke checks; missing: ${failed.join(', ') || 'none'}`};
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
const text = (typeof output === 'string' ? output : JSON.stringify(output)).replace(/[*_`]/g, '');
const laneHits = [
  /3C|3C\/数码|Apple|桌搭|desk setup|tech/i.test(text),
  /户外|露营|outdoor|camping/i.test(text),
  /Shop\s*with\s*me|haul|折扣购物|好物|购物|gifting/i.test(text),
  /学生|校园|student|campus/i.test(text),
];
const checks = {
  'brand-platform-format': /INIU|Pocket\s*Rocket\s*P50/i.test(text) && /YouTube/i.test(text) && /植入|pre[ /-]|mid[ /-]|integration/i.test(text),
  'scene-hypotheses': laneHits.filter(Boolean).length >= 3,
  'recent-long-form': /90\s*(?:天|days?)/i.test(text) && /长视频|long[ -]?form/i.test(text) && /使用|购买|use.scene|purchase/i.test(text),
  'exclusions-and-dedup': /Shorts/i.test(text) && /排除|剔除|exclude|reject/i.test(text) && /去重|重复|dedup|duplicat/i.test(text),
  'coarse-fine-next': /粗筛|初筛|coarse/i.test(text) && /精筛|精审|fine|精选/i.test(text) && /下一步|next|资料|数据|input|输入/i.test(text),
  'fit-separate-from-contact': /匹配|适配|合格|fit|qualified/i.test(text) && (
    /联系待|联系.*(?:未|待)(?:验证|核实)|联系方式.{0,30}(?:待|缺|未)|匹配.{0,12}缺联系|contact[ -]pending|contact.{0,30}(?:missing|unverified|pending)/i.test(text) ||
    (/联系准备|联系就绪|contact readiness/i.test(text) && /分开|分别|单独|独立|不等于|separate|distinct/i.test(text))
  ),
  'pre-send-evidence-authority': /邮箱|邮件地址|收件人|email|recipient/i.test(text) && /验证|核实|确认|verif|check/i.test(text) && /授权|批准|approval|authoriz/i.test(text) && /发送(?:闸门|检查|放行)|(?:发送|邀约)(?:之)?前|before.{0,30}(?:send|outreach)|pre[ -]send/i.test(text),
  'no-invented-execution': !/我(?:已|已经)(?:搜索|查询|联系|发送|执行|完成)|(?:I\s+have|I've)(?:\s+already)?\s+(?:searched|queried|contacted|sent|executed|completed)/i.test(text),
};
const failed = Object.keys(checks).filter(key => !checks[key]);
return {
  pass: !failed.length,
  score: (Object.keys(checks).length - failed.length) / Object.keys(checks).length,
  reason: `INIU setup smoke checks; missing: ${failed.join(', ') || 'none'}`,
};
""".strip(),
}

# Inspect successful tool output, not the model's claim that it read the files.
SOURCE_READ_ASSERTION = r"""
const raw = context.providerResponse?.raw;
let turn;
try { turn = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { turn = null; }
const observations = (turn?.items || []).filter(item => item.type === 'command_execution' && item.exit_code === 0).map(item => item.aggregated_output || '').join('\n');
const missing = ['CRM-13', 'BRIEF-13', 'REPORT-13'].filter(id => !observations.includes(id));
return {pass: !missing.length, score: (3 - missing.length) / 3, reason: `successful source read evidence; missing: ${missing.join(', ') || 'none'}`};
""".strip()


def _load_cases() -> dict[int, dict[str, Any]]:
    document = json.loads(Path(__file__).with_name("evals.json").read_text(encoding="utf-8"))
    return {case["id"]: case for case in document["evals"]}


def _run_javascript(value: str, output: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    """Run one local grader against a supplied string for mutation self-tests."""
    script = (
        "const {output, context} = JSON.parse(require('fs').readFileSync(0, 'utf8'));"
        f"const result = new Function('output', 'context', {json.dumps(value)})(output, context);"
        "process.stdout.write(JSON.stringify(result));"
    )
    completed = subprocess.run(
        ["node", "-e", script],
        input=json.dumps({"output": output, "context": context or {}}, ensure_ascii=False),
        text=True,
        capture_output=True,
        check=True,
    )
    return json.loads(completed.stdout)


def _run_javascript_assertion(case_id: int, output: str) -> dict[str, Any]:
    return _run_javascript(OUTCOME_ASSERTIONS[case_id], output)


def short_fingerprints(value: Any) -> Any:
    """Keep run identity visible when Promptfoo redacts 64-character digests."""
    if isinstance(value, dict):
        return {key: short_fingerprints(item) for key, item in value.items()}
    if isinstance(value, list):
        return [short_fingerprints(item) for item in value]
    if isinstance(value, str) and len(value) == 64 and all(char in "0123456789abcdef" for char in value):
        return "sha256-prefix-16:" + value[:16]
    return value


def create_tests(config: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    """Return Promptfoo tests for the requested canonical case IDs."""
    requested_ids = (config or {}).get("case_ids", DEFAULT_CASE_IDS)
    if not isinstance(requested_ids, list | tuple) or not requested_ids:
        raise ValueError("case_ids must be a non-empty list")

    cases = _load_cases()
    manifest_path = Path(__file__).parent / "workspace" / "promptfoo" / "fixture-manifest.json"
    fixture_snapshot = short_fingerprints(json.loads(manifest_path.read_text(encoding="utf-8"))) if manifest_path.is_file() else None
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
                        if case["trigger"] != "should-not-trigger"
                        else case["prompt"]
                    ) + ("\n\nSupplied read-only files:\n" + "\n".join(case["files"]) if case.get("files") else "")
                },
                "metadata": {
                    "case_id": case_id,
                    "category": case["category"],
                    "trigger": case["trigger"],
                    "evaluation_mode": "content",
                    "files": case.get("files", []),
                    "fixture_snapshot": fixture_snapshot,
                    "expected_output": case["expected_output"],
                    "expectations": case["expectations"],
                },
                "assert": [
                    {
                        "type": "javascript",
                        "value": OUTCOME_ASSERTIONS[case_id],
                        "metric": "task-outcome",
                    },
                    {
                        "type": routing_type,
                        "value": SKILL_NAME,
                        "metric": "routing-evidence",
                    },
                ],
            }
        )

        if case_id == 13:
            tests[-1]["assert"].append({"type": "javascript", "value": SOURCE_READ_ASSERTION, "metric": "fixture-evidence"})

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
                        "fixture_snapshot": fixture_snapshot,
                        "expected_output": case["expected_output"],
                        "expectations": case["expectations"],
                    },
                    "assert": [
                        {
                            "type": "skill-used",
                            "value": SKILL_NAME,
                            "metric": "routing-evidence",
                        }
                    ],
                }
            )
    return tests


def run_self_test() -> None:
    full = {"digest": "a" * 64, "commit": "b" * 40, "nested": [{"digest": "c" * 64}]}
    brief = short_fingerprints(full)
    assert brief["digest"] == "sha256-prefix-16:" + "a" * 16
    assert brief["commit"] == full["commit"]
    assert brief["nested"][0]["digest"] == "sha256-prefix-16:" + "c" * 16
    assert full["digest"] == "a" * 64
    tests = create_tests({"case_ids": list(DEFAULT_CASE_IDS)})
    assert [test["metadata"]["case_id"] for test in tests] == [10, 12, 13, 19, 19, 20]
    content_tests = [test for test in tests if test["metadata"]["evaluation_mode"] == "content"]
    assert all(test["assert"][0]["metric"] == "task-outcome" for test in content_tests)
    assert tests[0]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert not tests[1]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert tests[1]["assert"][1]["type"] == "not-skill-used"
    assert tests[0]["assert"][1]["type"] == "skill-used"
    assert tests[2]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert tests[4]["vars"]["request"] == _load_cases()[19]["prompt"]
    assert tests[4]["metadata"]["evaluation_mode"] == "natural-routing"
    assert [assertion["type"] for assertion in tests[4]["assert"]] == ["skill-used"]
    assert tests[5]["metadata"]["case_id"] == 20
    assert tests[5]["vars"]["request"].startswith("Use the influencer-marketing-manager skill")
    assert "inputs/case13-sources.json" in tests[2]["vars"]["request"]
    assert "CRM-13" not in tests[2]["vars"]["request"]  # Source facts are not leaked into the prompt.

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

    for premature in (
        "Start with **24–30 deduplicated creators**.",
        "Start with a 40-creator queue.",
        "Use a qualitative batch, not a final shortlist. Queue 20 creators.",
        "先找 20 位达人。",
    ):
        assert not _run_javascript_assertion(10, good_cold_start + "\n" + premature)["pass"], premature

    assert _run_javascript_assertion(12, "Please paste the approved source email.")["pass"]
    assert not _run_javascript_assertion(12, "Translation: 你好，我们想合作。")["pass"]

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

    good_setup = (
        "INIU / Pocket Rocket P50：YouTube 视频植入。\n"
        "Apple 桌搭、户外、学生、haul 的真实使用和购买场景是探索假设。\n"
        "粗筛检查近 90 天活跃、长视频；排除纯 Shorts、官号、刷量、停更，按频道 ID 去重。\n"
        "精筛记录证据；下一步提供达人数据。\n"
        "适配的达人保留在候选池；联系方式待验证则标记联系待核实，不因缺少邮箱判为不匹配。\n"
        "发送前核实实际邮件地址、收件人、发送者及消息版本，确认授权；当前仅为方案。"
    )
    assert _run_javascript_assertion(20, good_setup)["pass"]
    assert _run_javascript_assertion(20, good_setup.replace("\n", " "))["pass"]
    assert _run_javascript_assertion(20, good_setup.replace("精筛", "精审").replace("发送前", "发送闸门"))["pass"]
    mutations = [
        "\n".join(line for line in good_setup.splitlines() if "联系待核实" not in line),
        "\n".join(line for line in good_setup.splitlines() if "发送前" not in line),
        good_setup.replace("视频植入", "内容合作"),
        good_setup.replace("精筛记录证据", "记录证据"),
        good_setup + "\n我已经发送首邀邮件。",
    ]
    for bad_setup in mutations:
        assert not _run_javascript_assertion(20, bad_setup)["pass"], bad_setup
    good_english = (
        "INIU YouTube integration: tech, outdoor and student purchase scenes. "
        "Coarse search checks activity within 90 days and long-form content. "
        "Exclude pure Shorts, official accounts and deduplicate identities. "
        "Fine review gathers evidence for the next action. Qualified creators remain contact-pending "
        "while the email is unverified. Before sending, check the recipient and obtain authorization."
    )
    assert _run_javascript_assertion(20, good_english)["pass"]

    good_sources = (
        "CRM still says US; the active brief says US too. "
        "The 2026-08-01 report is historical UK evidence, not current authority. "
        "Next discovery targets UK under the user's latest instruction. Do not send or update records."
    )
    assert _run_javascript_assertion(13, good_sources)["pass"]
    assert not _run_javascript_assertion(13, good_sources.replace("CRM still says US", "CRM already says UK"))["pass"]
    item = {"type": "command_execution", "exit_code": 0, "aggregated_output": "CRM-13 BRIEF-13 REPORT-13"}
    assert _run_javascript(SOURCE_READ_ASSERTION, good_sources, {"providerResponse": {"raw": json.dumps({"items": [item]})}})["pass"]
    for items in ([], [{**item, "exit_code": 1}], [{**item, "type": "agent_message"}], [{**item, "aggregated_output": "CRM-13"}]):
        assert not _run_javascript(SOURCE_READ_ASSERTION, good_sources, {"providerResponse": {"raw": json.dumps({"items": items})}})["pass"]

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
