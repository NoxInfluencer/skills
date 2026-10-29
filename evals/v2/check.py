"""Validate synthetic contracts and prepare bounded probes; never calls a model or marketing service."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def validate_cases(path):
    """检查完整场景身份与断言；结构通过不代表模型语义通过。"""
    data = json.loads(path.read_text(encoding='utf-8'))
    seen = set()
    for case in data['evals']:
        if case['id'] in seen or not case['prompt'] or not case['expectations']:
            raise ValueError('Invalid or duplicate evaluation case')
        seen.add(case['id'])
    return len(seen)

if __name__ == '__main__':
    for name in ['noxinfluencer', 'campaign-runtime']:
        path = ROOT / name / 'evals.json'
        print(name, validate_cases(path), 'structurally valid synthetic cases')
    script = ROOT / 'campaign-runtime/harness.py'
    spec = importlib.util.spec_from_file_location('campaign_harness', script)
    harness = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(harness)
    for case in harness.load_cases():
        for runtime in ['cli','mcp']:
            prepared = harness.prepare(case,runtime)
            for directory in prepared['skill_directories']:
                if not (Path(directory)/'SKILL.md').is_file():
                    raise ValueError('Missing installed Skill input')
    print('Offline preparation passed. Model behavior, OAuth and live execution require separate evidence.')
