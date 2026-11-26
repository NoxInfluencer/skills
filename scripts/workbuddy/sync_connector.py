#!/usr/bin/env python3
"""Synchronize and package the WorkBuddy NoxInfluencer CLI Connector.

Use the generated V2 CLI Skill and adapt it to the CLI installation and
device authorization managed by WorkBuddy.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[2]
SKILL_NAME = "noxinfluencer-cli"
SOURCE_SKILL = ROOT / "skills" / SKILL_NAME
CONNECTOR = ROOT / "connectors" / SKILL_NAME
SNAPSHOT_SKILL = CONNECTOR / "skills" / SKILL_NAME
REFERENCE_TOKEN = b"{baseDir}/references/"
WORKBUDDY_REFERENCE_TOKEN = b"@references/"
STANDALONE_COMMAND = b'node "{baseDir}/scripts/nox-cli.mjs"'
WORKBUDDY_REFERENCE_RE = re.compile(rb"@references/([a-z0-9_./-]+\.md)")
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$")
PACKAGE_VERSION_RE = re.compile(
    rb"@noxinfluencer/cli@([0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?)"
)
SECRET_RE = re.compile(
    rb"(?:api[_-]?key|access[_-]?token|device[_-]?code)\s*[:=]\s*['\"](?!<)[^'\"\s]+",
    re.IGNORECASE,
)
PLATFORMS = ("darwin", "linux", "win32")
WORKBUDDY_AUTH = b"""# WorkBuddy CLI Installation And Authorization

WorkBuddy prepares the pinned NoxInfluencer CLI when the user connects this connector. Run `noxinfluencer` in the WorkBuddy CLI environment. On Windows, use `noxinfluencer.cmd` when the shell requires it.

Check the installed CLI with `noxinfluencer --version` and the current connection with `noxinfluencer auth status`. Check the required operation with `noxinfluencer schema <cmd>` before setting arguments. If the command or schema is unavailable, report the installation or version issue and ask the user to reconnect through WorkBuddy.

When authorization is required, direct the user to the WorkBuddy connector's Connect control. The user completes the device login shown by WorkBuddy. Resume business operations once `noxinfluencer auth status` reports authentication. Use the connector's Disconnect control for sign-out.

Use the CLI credentials maintained by this connection. Keep credentials out of chat, files, command arguments and logs. Opening a business page or calling a business command does not perform device authorization.
"""


class ValidationError(Exception):
    """Raised when the Connector cannot be safely distributed."""


def iter_files(directory: Path) -> Iterable[Path]:
    if not directory.exists():
        return ()
    return (path for path in directory.rglob("*") if path.is_file())


def transformed_source_bytes(path: Path) -> bytes:
    relative = path.relative_to(SOURCE_SKILL).as_posix()
    if relative == "references/auth.md":
        return WORKBUDDY_AUTH
    content = path.read_bytes()
    if path.suffix.lower() != ".md":
        return content
    return (
        content.replace(STANDALONE_COMMAND, b"noxinfluencer")
        .replace(REFERENCE_TOKEN, WORKBUDDY_REFERENCE_TOKEN)
        .replace(b"the isolated NoxInfluencer", b"the WorkBuddy-managed NoxInfluencer")
        .replace(b"{baseDir}/SKILL.md", b"Skill entrypoint provided by WorkBuddy")
        .replace(b"This generated standalone Skill uses only the NoxInfluencer CLI", b"This connector uses the WorkBuddy-managed NoxInfluencer CLI")
        .replace(b"use the device-login start/wait flow", b"use the WorkBuddy connector device-login flow")
    )


def expected_snapshot() -> dict[Path, bytes]:
    entrypoint = SOURCE_SKILL / "SKILL.md"
    require_file(entrypoint)
    if not re.match(rb"\A---\r?\nname: noxinfluencer-cli\r?\n", entrypoint.read_bytes()):
        raise ValidationError("source Skill name must be noxinfluencer-cli")
    require_file(SOURCE_SKILL / "references" / "auth.md")
    # WorkBuddy owns installation and login. Bundle the business and command guidance.
    return {
        path.relative_to(SOURCE_SKILL): transformed_source_bytes(path)
        for path in (entrypoint, *iter_files(SOURCE_SKILL / "references"))
    }


def sync_snapshot() -> int:
    expected = expected_snapshot()
    SNAPSHOT_SKILL.mkdir(parents=True, exist_ok=True)

    for relative, content in expected.items():
        target = SNAPSHOT_SKILL / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.read_bytes() != content:
            target.write_bytes(content)
            source_mode = (SOURCE_SKILL / relative).stat().st_mode
            target.chmod(source_mode & 0o777)

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


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValidationError(f"invalid JSON in {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise ValidationError(f"expected an object in {path}")
    return value


def require_file(path: Path) -> None:
    if not path.is_file():
        raise ValidationError(f"required Connector file is missing: {path.relative_to(ROOT)}")


def require_string(mapping: dict, key: str, path: Path) -> str:
    value = mapping.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{path.name} requires a non-empty string field: {key}")
    return value


def validate_metadata() -> dict:
    path = CONNECTOR / "connector-meta.json"
    require_file(path)
    metadata = load_json(path)
    for key in ("name", "name_en", "description", "description_zh", "description_en", "source", "type", "version"):
        require_string(metadata, key, path)
    if metadata["source"] != SKILL_NAME:
        raise ValidationError("connector-meta.json source must be noxinfluencer-cli")
    if metadata["type"] != "cli":
        raise ValidationError("connector-meta.json type must be cli")
    if not SEMVER_RE.fullmatch(metadata["version"]):
        raise ValidationError("connector-meta.json version must be semantic versioning")
    for key in ("examples_zh", "examples_en"):
        examples = metadata.get(key)
        if not isinstance(examples, list) or not 2 <= len(examples) <= 5 or not all(isinstance(item, str) and item.strip() for item in examples):
            raise ValidationError(f"{path.name} requires 2-5 non-empty {key}")
    if metadata.get("minWorkbuddyVersion") != "5.0.0":
        raise ValidationError("connector-meta.json minWorkbuddyVersion must be 5.0.0")
    return metadata


def platform_commands(value: object, field: str) -> dict[str, str]:
    if not isinstance(value, dict):
        raise ValidationError(f"cli.json requires platform commands for {field}")
    result: dict[str, str] = {}
    for platform in PLATFORMS:
        command = value.get(platform)
        if not isinstance(command, str) or not command.strip():
            raise ValidationError(f"cli.json {field}.{platform} must be a non-empty command")
        result[platform] = command
    return result


def validate_cli_config() -> dict:
    path = CONNECTOR / "cli.json"
    require_file(path)
    config = load_json(path)
    runtime = config.get("runtime")
    if not isinstance(runtime, dict) or runtime.get("type") != "node" or runtime.get("version") != "20":
        raise ValidationError("cli.json runtime must declare Node.js 20")

    init = platform_commands(config.get("init"), "init")
    auth = platform_commands(config.get("auth"), "auth")
    unauth = platform_commands(config.get("unAuth"), "unAuth")
    status = platform_commands(config.get("status"), "status")

    package_versions = set()
    for command in init.values():
        match = PACKAGE_VERSION_RE.search(command.encode())
        if not match:
            raise ValidationError("each init command must pin @noxinfluencer/cli to a version")
        package_versions.add(match.group(1).decode())
    cli_package = load_json(SOURCE_SKILL / "cli-package.json")
    source_version = require_string(cli_package, "version", SOURCE_SKILL / "cli-package.json")
    if cli_package.get("name") != "@noxinfluencer/cli" or package_versions != {source_version}:
        raise ValidationError("all init commands must match the generated Skill's CLI package and version")

    version_check = config.get("versionCheck")
    if not isinstance(version_check, dict) or version_check.get("minVersion") != source_version:
        raise ValidationError("versionCheck.minVersion must match the pinned CLI version")
    platform_commands(version_check.get("command"), "versionCheck.command")
    if version_check.get("versionPattern") != r"(\d+\.\d+\.\d+)":
        raise ValidationError("versionCheck.versionPattern must capture a semantic CLI version")

    for platform, command in auth.items():
        if "login" not in command or "--no-browser" not in command:
            raise ValidationError(f"auth.{platform} must use the non-browser device login flow")
    for platform, command in unauth.items():
        if "auth logout" not in command:
            raise ValidationError(f"unAuth.{platform} must call auth logout")
    for platform, command in status.items():
        if "auth status" not in command:
            raise ValidationError(f"status.{platform} must call auth status")

    if config.get("authWaitForExit") is not True or config.get("authSuppressBrowser") is not True:
        raise ValidationError("CLI device auth must wait for the process and suppress automatic browser launch")
    if not isinstance(config.get("authUrlDomain"), str) or config["authUrlDomain"] != "noxinfluencer.com":
        raise ValidationError("authUrlDomain must be noxinfluencer.com")
    if config.get("statusMatchJson") != {"authenticated": "true"}:
        raise ValidationError("statusMatchJson must match the auth status contract")
    device_flow = config.get("authDeviceFlow")
    if not isinstance(device_flow, dict):
        raise ValidationError("authDeviceFlow is required for device login")
    for key in ("uriPattern", "codePattern"):
        if not isinstance(device_flow.get(key), str) or not device_flow[key].strip():
            raise ValidationError(f"authDeviceFlow.{key} must be a non-empty pattern")
    if device_flow.get("defaultExpiresInSeconds") != 600 or device_flow.get("codeEmbeddedInUri") is not True:
        raise ValidationError("authDeviceFlow must describe the 10-minute embedded-code flow")
    return config


def validate_snapshot() -> None:
    expected = expected_snapshot()
    actual = {path.relative_to(SNAPSHOT_SKILL): path.read_bytes() for path in iter_files(SNAPSHOT_SKILL)}
    if expected.keys() != actual.keys():
        missing = sorted(str(item) for item in expected.keys() - actual.keys())
        extra = sorted(str(item) for item in actual.keys() - expected.keys())
        raise ValidationError(f"Skill snapshot drift (missing={missing}, extra={extra})")
    for relative, expected_bytes in expected.items():
        if actual[relative] != expected_bytes:
            raise ValidationError(f"Skill snapshot drift: {relative}")
        if relative.suffix.lower() != ".md":
            continue
        content = actual[relative]
        if b"{baseDir}" in content or b"nox-cli.mjs" in content:
            raise ValidationError(f"Standalone Skill path in WorkBuddy Skill: {relative}")
        for name in WORKBUDDY_REFERENCE_RE.findall(content):
            reference = Path("references") / name.decode()
            if reference not in actual:
                raise ValidationError(f"Missing WorkBuddy Skill reference: {relative} -> {reference}")


def validate_package_scope() -> None:
    require_file(CONNECTOR / "icon.svg")
    if {path.name for path in CONNECTOR.iterdir()} != {"connector-meta.json", "cli.json", "icon.svg", "skills"}:
        raise ValidationError("Connector root must contain connector-meta.json, cli.json, icon.svg and skills/")
    if {path.name for path in (CONNECTOR / "skills").iterdir()} != {SKILL_NAME}:
        raise ValidationError("Connector must bundle only the noxinfluencer-cli product Skill")
    for path in iter_files(CONNECTOR):
        relative = path.relative_to(CONNECTOR)
        if any(part == "__MACOSX" or part.startswith(".") for part in relative.parts):
            raise ValidationError(f"Connector contains metadata or hidden file: {relative}")
        content = path.read_bytes()
        if SECRET_RE.search(content):
            raise ValidationError(f"possible hard-coded credential in Connector file: {relative}")


def validate() -> None:
    validate_metadata()
    validate_cli_config()
    validate_snapshot()
    validate_package_scope()


def package(output: Path) -> None:
    validate()
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(iter_files(CONNECTOR)):
            relative = path.relative_to(CONNECTOR).as_posix()
            info = zipfile.ZipInfo(relative, date_time=(2020, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (path.stat().st_mode & 0o777) << 16
            archive.writestr(info, path.read_bytes())
    print(f"packaged {output}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("sync", "check", "package"))
    parser.add_argument("--output", type=Path, help="package output path (default: dist/noxinfluencer-cli-<Connector version>.zip)")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.action == "sync":
            validate_metadata()
            validate_cli_config()
            count = sync_snapshot()
            validate()
            print(f"synchronized {count} Skill files")
        elif args.action == "check":
            validate()
            print("Connector checks passed")
        else:
            output = args.output or ROOT / "dist" / f"noxinfluencer-cli-{validate_metadata()['version']}.zip"
            package(output)
    except ValidationError as exc:
        print(f"Connector validation failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
