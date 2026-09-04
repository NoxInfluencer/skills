"""Prepare isolated old/new Skill fixtures for the Promptfoo comparison."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
from pathlib import Path

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python 3.10 fallback
    tomllib = None

MANAGER_SKILL = "influencer-marketing-manager"
EVAL_DIR = Path(__file__).resolve().parent
REPO_ROOT = EVAL_DIR.parents[1]
SKILLS_DIR = REPO_ROOT / "skills"
WORKSPACE_DIR = EVAL_DIR / "workspace" / "promptfoo"
FIXTURES_DIR = WORKSPACE_DIR / "fixtures"
CODEX_HOME_DIR = WORKSPACE_DIR / "codex-home"


def _git(*args: str, text: bool = True) -> str | bytes:
    result = subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=text,
    )
    return result.stdout


def _resolve_commit(ref: str) -> str:
    return str(_git("rev-parse", "--verify", f"{ref}^{{commit}}")).strip()


def _export_skill(ref: str, skill_name: str, destination: Path) -> None:
    prefix = f"skills/{skill_name}/"
    raw_paths = _git("ls-tree", "-r", "-z", "--name-only", ref, "--", prefix, text=False)
    paths = [path.decode("utf-8") for path in bytes(raw_paths).split(b"\0") if path]
    if not paths:
        raise ValueError(f"{prefix} does not exist at {ref}")

    for repo_path in paths:
        relative_path = Path(repo_path).relative_to(prefix)
        output_path = destination / relative_path
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(bytes(_git("show", f"{ref}:{repo_path}", text=False)))


def _copy_worktree_skill(skill_name: str, destination: Path) -> None:
    source = SKILLS_DIR / skill_name
    if not source.is_dir():
        raise ValueError(f"missing worktree skill: {source}")
    shutil.copytree(source, destination)


def _directory_digest(path: Path) -> str:
    digest = hashlib.sha256()
    for file_path in sorted(item for item in path.rglob("*") if item.is_file()):
        digest.update(file_path.relative_to(path).as_posix().encode("utf-8"))
        digest.update(b"\0")
        digest.update(file_path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def _prepare_codex_home(reuse_codex_login: bool) -> str:
    if CODEX_HOME_DIR.exists():
        shutil.rmtree(CODEX_HOME_DIR)
    CODEX_HOME_DIR.mkdir(parents=True)

    if not reuse_codex_login:
        return "api-key-required"

    source_home = Path(os.environ.get("CODEX_HOME", Path.home() / ".codex"))
    source_auth = source_home / "auth.json"
    if not source_auth.is_file():
        raise ValueError(f"Codex login state not found at {source_auth}")
    (CODEX_HOME_DIR / "auth.json").symlink_to(source_auth.resolve())

    source_config = source_home / "config.toml"
    if source_config.is_file():
        if tomllib is None:
            raise RuntimeError("Python 3.11+ is required to isolate Codex connection settings")
        with source_config.open("rb") as handle:
            parsed = tomllib.load(handle)
        provider_name = parsed.get("model_provider")
        providers = parsed.get("model_providers", {})
        provider = providers.get(provider_name) if isinstance(providers, dict) else None
        if isinstance(provider_name, str) and isinstance(provider, dict):
            safe_provider = {
                key: provider[key]
                for key in ("name", "base_url", "wire_api", "requires_openai_auth", "supports_websockets")
                if key in provider
            }
            if "base_url" in safe_provider:
                lines = [f'model_provider = {json.dumps(provider_name)}', ""]
                lines.append(f"[model_providers.{provider_name}]")
                for key, value in safe_provider.items():
                    lines.append(f"{key} = {json.dumps(value)}")
                (CODEX_HOME_DIR / "config.toml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return "linked-host-login"


def prepare(
    baseline_ref: str,
    candidate_ref: str | None,
    reuse_codex_login: bool = False,
) -> dict[str, object]:
    baseline_commit = _resolve_commit(baseline_ref)
    candidate_commit = _resolve_commit(candidate_ref) if candidate_ref else None

    if FIXTURES_DIR.exists():
        shutil.rmtree(FIXTURES_DIR)
    auth_mode = _prepare_codex_home(reuse_codex_login)

    baseline_skills = FIXTURES_DIR / "baseline" / ".agents" / "skills"
    candidate_skills = FIXTURES_DIR / "candidate" / ".agents" / "skills"
    baseline_skills.mkdir(parents=True)
    candidate_skills.mkdir(parents=True)

    shared_skills: list[str] = []
    for source in sorted(item for item in SKILLS_DIR.iterdir() if item.is_dir()):
        if source.name == MANAGER_SKILL:
            continue
        shared_skills.append(source.name)
        _copy_worktree_skill(source.name, baseline_skills / source.name)
        _copy_worktree_skill(source.name, candidate_skills / source.name)

    _export_skill(baseline_commit, MANAGER_SKILL, baseline_skills / MANAGER_SKILL)
    if candidate_commit:
        _export_skill(candidate_commit, MANAGER_SKILL, candidate_skills / MANAGER_SKILL)
    else:
        _copy_worktree_skill(MANAGER_SKILL, candidate_skills / MANAGER_SKILL)

    shared_digests = {
        skill_name: {
            "baseline": _directory_digest(baseline_skills / skill_name),
            "candidate": _directory_digest(candidate_skills / skill_name),
        }
        for skill_name in shared_skills
    }
    mismatches = [name for name, values in shared_digests.items() if values["baseline"] != values["candidate"]]
    if mismatches:
        raise RuntimeError(f"shared Skill fixtures differ: {', '.join(mismatches)}")

    manifest: dict[str, object] = {
        "baseline": {
            "manager_source": "git",
            "requested_ref": baseline_ref,
            "commit": baseline_commit,
            "digest": _directory_digest(baseline_skills / MANAGER_SKILL),
        },
        "candidate": {
            "manager_source": "git" if candidate_commit else "worktree",
            "requested_ref": candidate_ref,
            "commit": candidate_commit,
            "digest": _directory_digest(candidate_skills / MANAGER_SKILL),
        },
        "shared_skills": shared_skills,
        "only_manager_varies": not mismatches,
        "codex_home": {
            "isolated": True,
            "auth_mode": auth_mode,
        },
    }
    WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)
    (WORKSPACE_DIR / "fixture-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build ignored Promptfoo fixtures while changing only the Manager Skill.",
    )
    parser.add_argument(
        "--baseline-ref",
        required=True,
        help="Git ref containing the old Manager Skill.",
    )
    parser.add_argument(
        "--candidate-ref",
        help="Optional Git ref for the candidate; defaults to the current worktree.",
    )
    parser.add_argument(
        "--reuse-codex-login",
        action="store_true",
        help="Link only the host auth.json into the ignored isolated Codex home.",
    )
    args = parser.parse_args()

    manifest = prepare(args.baseline_ref, args.candidate_ref, args.reuse_codex_login)
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
