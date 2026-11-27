import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[2]
SKILL = Path("skills/noxinfluencer-cli")
CONNECTOR = Path("connectors/noxinfluencer-cli")
SCRIPT = Path("scripts/workbuddy/sync_connector.py")
CONNECTOR_FILES = ("cli.json", "connector-meta.json")
ICON_SOURCE = Path("plugins/noxinfluencer/assets/icon.png")
ROOT_FILES = (*CONNECTOR_FILES, "icon.png")


class CliConnectorPackagingTest(unittest.TestCase):
    def test_packaging_reads_current_skill_without_a_snapshot(self):
        with tempfile.TemporaryDirectory(prefix="nox-cli-connector-test-") as directory:
            root = Path(directory)
            for path in (SCRIPT, ICON_SOURCE, *(CONNECTOR / name for name in CONNECTOR_FILES)):
                (root / path).parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(ROOT / path, root / path)
            shutil.copytree(ROOT / SKILL, root / SKILL)

            def run(action, *args):
                return subprocess.run(
                    [sys.executable, str(root / SCRIPT), action, *map(str, args)],
                    cwd=root, check=True, capture_output=True,
                )

            for action in ("check", "sync"):
                run(action)
            self.assertFalse((root / CONNECTOR / "skills").exists())

            output = root / "dist/connector.zip"
            run("package", "--output", output)
            skill_path = "skills/noxinfluencer-cli/SKILL.md"
            reference = SKILL / "references/creator.md"
            with ZipFile(output) as archive:
                self.assertIsNone(archive.testzip())
                self.assertEqual({name for name in archive.namelist() if "/" not in name}, set(ROOT_FILES))
                self.assertEqual(archive.read("icon.png"), (ROOT / ICON_SOURCE).read_bytes())
                self.assertIn(b"\nname: noxinfluencer-cli\n", archive.read(skill_path))
                previous = archive.read(reference.as_posix())

            marker = b"\nUse task-local creator evidence for the final qualification.\n"
            with (root / reference).open("ab") as source:
                source.write(marker)
            run("package", "--output", output)
            with ZipFile(output) as archive:
                self.assertEqual(archive.read(reference.as_posix()), previous + marker)
            self.assertFalse((root / CONNECTOR / "skills").exists())


if __name__ == "__main__":
    unittest.main()
