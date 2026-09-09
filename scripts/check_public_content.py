"""Check working files for common accidental disclosures; never print matched values."""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
UUID = r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}"
RULES = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    "service token": re.compile(
        r"\b(?:sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}|"
        r"gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}|"
        r"AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{15,}|"
        r"nox_sk_(?!test_)[A-Za-z0-9_-]{16,})"
    ),
    "JWT": re.compile(r"\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}"),
    "personal home path": re.compile(r"/(?:Users|home)/[A-Za-z0-9._-]+/|[A-Z]:\\Users\\[^\\\s]+\\"),
    "personal session ID": re.compile(
        rf"(?:session|thread)(?:[_ -]?id)?[^\n]{{0,40}}\b{UUID}\b", re.IGNORECASE
    ),
}
URL = re.compile(r"https?://[^\s<>\"'\])]+")


def private_path(path: Path) -> bool:
    parts = path.parts
    return (
        any(part in {".codex", ".agents", ".claude"} for part in parts)
        or ("evals" in parts and "workspace" in parts)
        or path.name in {"auth.json", ".netrc", "id_rsa", "id_ed25519"}
        or ((path.name == ".env" or path.name.startswith(".env.")) and path.name != ".env.example")
    )


def content_findings(path: Path, content: str) -> list[tuple[int, str]]:
    findings = [(0, "local-only file")] if private_path(path) else []
    for number, line in enumerate(content.splitlines(), 1):
        findings.extend((number, label) for label, pattern in RULES.items() if pattern.search(line))
        for match in URL.finditer(line):
            try:
                url = urlsplit(match.group())
                host = (url.hostname or "").lower()
                example = host.endswith((".example", ".test")) or host in {
                    "example.com", "example.net", "example.org"
                }
                if url.username is not None and not example:
                    findings.append((number, "credentials in URL"))
            except ValueError:
                continue  # URL validity is outside this disclosure check.
    return findings


def working_paths(root: Path) -> list[Path]:
    """Include tracked edits and unignored new files, without reading ignored local data."""
    output = subprocess.check_output(
        ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"], cwd=root,
    )
    return sorted({Path(name.decode()) for name in output.split(b"\0") if name})


def check(root: Path) -> int:
    checked = 0
    failures = []
    for path in working_paths(root):
        source = root / path
        if source.is_symlink():
            if private_path(path):
                failures.append((path, 0, "local-only file"))
            if not source.resolve().is_relative_to(root.resolve()):
                failures.append((path, 0, "symlink outside repository"))
            continue
        if not source.is_file():
            continue
        checked += 1
        try:
            content = source.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            content = ""  # File-name checks still apply to binary artifacts.
        failures.extend((path, line, label) for line, label in content_findings(path, content))
    for path, line, label in failures:
        print(f"{path.as_posix()}:{line}: {label}; review locally (value omitted)")
    print(f"Public-content check: {checked} working files, {len(failures)} findings")
    return int(bool(failures))


def self_test() -> None:
    path = Path("example.md")
    assert not content_findings(path, "Use <api_key>; contact writer@agency.example.")
    assert not content_findings(path, "https://user:secret@example.test")
    assert content_findings(path, "https://" + "user:secret@service.invalid")
    assert content_findings(path, "sk-" + "x" * 32)
    assert content_findings(path, "nox_sk_" + "x" * 32)
    assert not content_findings(path, "nox_sk_test_abc123def456")
    assert content_findings(path, "-----BEGIN " + "PRIVATE KEY-----")
    assert content_findings(path, "/" + "Users" + "/example-operator/notes")
    assert content_findings(path, "Session: " + "12345678-" + "abcd-" * 3 + "123456789abc")
    for name in (".env", ".codex/auth.json", "evals/demo/workspace/trace.json", "auth.json"):
        assert content_findings(Path(name), "")
    for name in (".env.example", ".claude-plugin/plugin.json", "skills/demo/SKILL.md"):
        assert not content_findings(Path(name), "")
    print("Public-content self-tests passed")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true", help="Run checks using constructed example values.")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    return check(ROOT)


if __name__ == "__main__":
    raise SystemExit(main())
