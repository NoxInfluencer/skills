#!/usr/bin/env python3
"""Synchronize and package the WorkBuddy Influencer Marketing Expert."""

from __future__ import annotations

import argparse
import json
import re
import struct
import sys
import zipfile
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
SOURCE_SKILL = ROOT / "skills" / "influencer-marketing-manager"
EXPERT = ROOT / "experts" / "influencer-marketing-manager"
SNAPSHOT_SKILL = EXPERT / "skills" / "influencer-marketing-manager"
DEFAULT_PACKAGE = ROOT / "dist" / "influencer-marketing-manager-expert-0.1.0.zip"
CONNECTOR_ID = "oc_e701b8b6011f3b3e"
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$")
SECRET_RE = re.compile(
    rb"(?:api[_-]?key|access[_-]?token|device[_-]?code)\s*[:=]\s*['\"](?!<)[^'\"\s]+",
    re.IGNORECASE,
)


class ValidationError(Exception):
    """Raised when the Expert is not safe to distribute."""


def iter_files(directory: Path) -> Iterable[Path]:
    if not directory.exists():
        return ()
    return (path for path in directory.rglob("*") if path.is_file())


def expected_snapshot() -> dict[Path, bytes]:
    if not SOURCE_SKILL.is_dir():
        raise ValidationError(f"source Skill directory is missing: {SOURCE_SKILL}")
    return {
        path.relative_to(SOURCE_SKILL): path.read_bytes()
        for path in iter_files(SOURCE_SKILL)
        if not any(part.startswith(".") for part in path.relative_to(SOURCE_SKILL).parts)
    }


def sync_snapshot() -> int:
    expected = expected_snapshot()
    SNAPSHOT_SKILL.mkdir(parents=True, exist_ok=True)
    for relative, content in expected.items():
        target = SNAPSHOT_SKILL / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.read_bytes() != content:
            target.write_bytes(content)
            target.chmod((SOURCE_SKILL / relative).stat().st_mode & 0o777)

    expected_paths = {SNAPSHOT_SKILL / relative for relative in expected}
    for path in sorted(iter_files(SNAPSHOT_SKILL), reverse=True):
        if path not in expected_paths:
            path.unlink()
    for directory in sorted(
        (path for path in SNAPSHOT_SKILL.rglob("*") if path.is_dir()),
        key=lambda item: len(item.parts),
        reverse=True,
    ):
        try:
            directory.rmdir()
        except OSError:
            pass
    return len(expected)


def load_manifest() -> dict:
    path = EXPERT / ".codebuddy-plugin" / "plugin.json"
    if not path.is_file():
        raise ValidationError(".codebuddy-plugin/plugin.json is missing")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValidationError(f"invalid plugin.json: {exc}") from exc
    if not isinstance(value, dict):
        raise ValidationError("plugin.json must contain an object")
    return value


def require_string(mapping: dict, key: str) -> str:
    value = mapping.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"plugin.json requires a non-empty string: {key}")
    return value


def validate_png(path: Path) -> None:
    data = path.read_bytes()
    if not data.startswith(b"\x89PNG\r\n\x1a\n") or len(data) < 24:
        raise ValidationError("avatar must be a PNG")
    width, height = struct.unpack(">II", data[16:24])
    if (width, height) != (512, 512):
        raise ValidationError(f"avatar must be 512x512, got {width}x{height}")
    if path.stat().st_size > 500 * 1024:
        raise ValidationError("avatar must be no larger than 500KB")


def validate_manifest() -> None:
    manifest = load_manifest()
    for key in ("name", "version", "description", "expertType", "agentName", "plugin", "avatar", "categoryId"):
        require_string(manifest, key)
    if manifest["name"] != "influencer-marketing-manager" or manifest["plugin"] != manifest["name"]:
        raise ValidationError("name and plugin must be influencer-marketing-manager")
    if not SEMVER_RE.fullmatch(manifest["version"]):
        raise ValidationError("version must be semantic versioning")
    if manifest["expertType"] != "agent" or manifest["agentName"] != manifest["name"]:
        raise ValidationError("expertType/agentName do not describe the bundled Agent")

    for key in ("agents", "skills"):
        values = manifest.get(key)
        if not isinstance(values, list) or not values or not all(isinstance(item, str) for item in values):
            raise ValidationError(f"{key} must be a non-empty string list")
        for item in values:
            if not item.startswith("./") or not (EXPERT / item[2:]).exists():
                raise ValidationError(f"manifest path does not exist: {item}")

    dependencies = manifest.get("dependencies")
    connectors = dependencies.get("connectors") if isinstance(dependencies, dict) else None
    if connectors != [CONNECTOR_ID]:
        raise ValidationError(f"dependencies.connectors must contain {CONNECTOR_ID}")

    display_name = manifest.get("displayName")
    profession = manifest.get("profession")
    description = manifest.get("displayDescription")
    if not all(isinstance(value, dict) and isinstance(value.get("zh"), str) and isinstance(value.get("en"), str)
               for value in (display_name, profession, description)):
        raise ValidationError("displayName, profession, and displayDescription need zh/en strings")
    if not 40 <= len(description["zh"]) <= 50:
        raise ValidationError("displayDescription.zh must be 40-50 characters")

    prompts = manifest.get("quickPrompts")
    default_prompt = manifest.get("defaultInitPrompt")
    if not isinstance(prompts, list) or len(prompts) != 3 or not isinstance(default_prompt, dict):
        raise ValidationError("quickPrompts and defaultInitPrompt must contain three localized prompts")
    if any(not isinstance(item, dict) or not isinstance(item.get("zh"), str) or not isinstance(item.get("en"), str)
           for item in prompts):
        raise ValidationError("quickPrompts must contain zh/en strings")
    if prompts[0] != default_prompt:
        raise ValidationError("defaultInitPrompt must equal the first quickPrompt")

    tags = manifest.get("tags")
    if not isinstance(tags, list) or len(tags) != 3 or any(
        not isinstance(item, dict) or not isinstance(item.get("zh"), str) or not isinstance(item.get("en"), str)
        for item in tags
    ):
        raise ValidationError("tags must contain exactly three localized entries")

    avatar = EXPERT / manifest["avatar"]
    if not avatar.is_file():
        raise ValidationError(f"avatar is missing: {manifest['avatar']}")
    validate_png(avatar)


def validate_snapshot() -> None:
    expected = expected_snapshot()
    actual = {
        path.relative_to(SNAPSHOT_SKILL): path.read_bytes()
        for path in iter_files(SNAPSHOT_SKILL)
    }
    if expected.keys() != actual.keys():
        raise ValidationError("bundled Skill snapshot is missing or has extra files")
    for relative, content in expected.items():
        if actual[relative] != content:
            raise ValidationError(f"bundled Skill snapshot drift: {relative}")


def validate_scope() -> None:
    for path in iter_files(EXPERT):
        relative = path.relative_to(EXPERT)
        if any(part.startswith(".") and part != ".codebuddy-plugin" for part in relative.parts):
            raise ValidationError(f"hidden metadata in Expert package: {relative}")
        if SECRET_RE.search(path.read_bytes()):
            raise ValidationError(f"possible hard-coded credential: {relative}")


def validate() -> None:
    validate_manifest()
    validate_snapshot()
    validate_scope()


def package(output: Path) -> None:
    validate()
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(iter_files(EXPERT)):
            relative = path.relative_to(EXPERT).as_posix()
            info = zipfile.ZipInfo(relative, date_time=(2020, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (path.stat().st_mode & 0o777) << 16
            archive.writestr(info, path.read_bytes())
    print(f"packaged {output}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("sync", "check", "package"))
    parser.add_argument("--output", type=Path, default=DEFAULT_PACKAGE)
    args = parser.parse_args()
    try:
        if args.action == "sync":
            count = sync_snapshot()
            validate()
            print(f"synchronized {count} Skill files")
        elif args.action == "check":
            validate()
            print("Expert checks passed")
        else:
            package(args.output)
    except ValidationError as exc:
        print(f"Expert validation failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
