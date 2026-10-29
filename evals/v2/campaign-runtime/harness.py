"""Offline case preparation and evidence review. Never executes marketing tools."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CASES = Path(__file__).with_name('evals.json')

def load_cases():
    cases = json.loads(CASES.read_text(encoding='utf-8'))['evals']
    seen = set()
    for case in cases:
        if case['id'] in seen or not case['expectations'] or not case['prompt']:
            raise ValueError('Invalid or duplicate case')
        seen.add(case['id'])
        if set(case['runtimes']) != {'cli', 'mcp'} or case.get('review_required') is not True:
            raise ValueError('Each case requires both runtime probes and semantic review')
    return cases

def prepare(case, runtime):
    if runtime not in case['runtimes']:
        raise ValueError('Unsupported runtime')
    # Only current evidence is visible. Expectations and later user turns stay out.
    prompt = ('Use the provided noxinfluencer Skill and, when relevant, the marketing manager. '
              f'This is an isolated {runtime.upper()} business-reasoning probe. '
              'All evidence below is synthetic. Do not call live marketing services or perform writes. '
              'State the next supported actions and distinguish proposed from observed results.\n\n'
              + case['prompt'] + '\n\nEvidence:\n' + json.dumps(case['evidence'], ensure_ascii=False))
    skill_root = ROOT / ('v2/skills' if runtime == 'cli' else 'plugins/noxinfluencer/skills')
    product = skill_root / ('noxinfluencer-v2' if runtime == 'cli' else 'noxinfluencer-mcp')
    manager = ROOT / 'skills/influencer-marketing-manager'
    digest = hashlib.sha256()
    for directory in [product, manager]:
        if not (directory / 'SKILL.md').is_file():
            raise ValueError('Missing generated Skill')
        for path in sorted(directory.rglob('*')):
            if path.is_file():
                digest.update(path.relative_to(ROOT).as_posix().encode())
                digest.update(path.read_bytes())
    return {'case_id': case['id'], 'runtime': runtime, 'skill_digest': digest.hexdigest(),
            'contract_digest': hashlib.sha256(CASES.read_bytes()).hexdigest(),
            'prompt': prompt, 'skill_root': str(skill_root), 'skill_directories': [str(product), str(manager)],
            'followups': [turn['prompt'] for turn in case.get('followups', [])]}

def review(case, evidence):
    """No green result from successful transport, keyword matches or missing review."""
    if evidence.get('runtime_error') or not evidence.get('completed'):
        return 'runtime-failed'
    if not evidence.get('response', '').strip() or not evidence.get('skill_digest') or not evidence.get('contract_digest'):
        return 'missing-evidence'
    checks = evidence.get('reviews', [])
    expected = len(case['expectations']) + sum(len(t['expectations']) for t in case.get('followups', []))
    if len(checks) != expected or {c.get('index') for c in checks} != set(range(expected)):
        return 'needs-review'
    if any(c.get('verdict') not in ['pass', 'partial', 'fail'] or not c.get('evidence_excerpt') or not c.get('reason') for c in checks):
        return 'needs-review'
    # An excerpt must be present in the recorded answer, rather than invented by a grader.
    if any(c['evidence_excerpt'] not in evidence['response'] for c in checks):
        return 'invalid-review-evidence'
    if any(c['verdict'] == 'fail' for c in checks):
        return 'fail'
    if any(c['verdict'] == 'partial' for c in checks):
        return 'partial'
    return 'reviewed-pass'

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--case')
    parser.add_argument('--runtime', choices=['cli', 'mcp'], default='cli')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    cases = load_cases()
    if args.case:
        selected = next(c for c in cases if c['id'] == args.case)
        result = prepare(selected, args.runtime)
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            with args.output.open('x', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        for c in cases:
            for runtime in c['runtimes']:
                prepare(c, runtime)
        print(f'Validated {len(cases)} cases / {len(cases) * 2} runtime variants. No model or business calls executed.')
