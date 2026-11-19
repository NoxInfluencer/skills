#!/usr/bin/env python3
"""Compatibility entrypoint for the WorkBuddy Expert package builder."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("sync", "check", "package"))
    parser.add_argument("--output", type=Path, help="ZIP destination inside the repository dist directory")
    args = parser.parse_args()
    if args.output and args.action != "package":
        parser.error("--output requires package mode")
    command = ["node", str(ROOT / "scripts" / "workbuddy" / "package_expert.mjs"), args.action]
    if args.output:
        command.extend(["--output", str(args.output)])
    try:
        return subprocess.run(command, cwd=ROOT, check=False).returncode
    except FileNotFoundError:
        print("Expert packaging requires Node.js and npm dependencies; run npm ci --ignore-scripts first.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
