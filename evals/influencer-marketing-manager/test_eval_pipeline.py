"""Local contract tests; no model calls, real login, or live marketing systems."""

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import prepare_promptfoo_fixtures as fixtures
from review_results import inspect_result


class FixtureTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        paths = {
            "EVAL_DIR": self.root / "eval",
            "FIXTURE_ROOT": self.root / "eval" / "fixtures",
            "SKILLS_DIR": self.root / "skills",
            "WORKSPACE_DIR": self.root / "workspace",
            "FIXTURES_DIR": self.root / "workspace" / "fixtures",
            "CODEX_HOME_DIR": self.root / "workspace" / "codex-home",
            "MANIFEST_PATH": self.root / "workspace" / "fixture-manifest.json",
        }
        for name, value in paths.items():
            handle = patch.object(fixtures, name, value)
            handle.start()
            self.addCleanup(handle.stop)
        self.source = fixtures.FIXTURE_ROOT / "inputs" / "source.json"
        self.source.parent.mkdir(parents=True)
        self.source.write_text('{"source":"synthetic"}')
        document = {"skill_name": fixtures.MANAGER_SKILL, "evals": [{
            "id": 13, "category": "workspace-conflict", "trigger": "boundary",
            "prompt": "Read the supplied snapshot.", "expected_output": "Reconcile sources.",
            "expectations": ["Uses source evidence"], "files": ["inputs/source.json"],
        }]}
        (fixtures.EVAL_DIR / "evals.json").write_text(json.dumps(document))
        for name in ("promptfoo_cases.py", "promptfooconfig.yaml"):
            (fixtures.EVAL_DIR / name).write_text("test contract")
        for name in (fixtures.MANAGER_SKILL, "neighbor"):
            folder = fixtures.SKILLS_DIR / name
            folder.mkdir(parents=True)
            (folder / "SKILL.md").write_text(name)

        def export(_ref, _name, destination):
            destination.mkdir(parents=True)
            (destination / "SKILL.md").write_text("old manager")

        for name, replacement in (("_resolve_commit", lambda ref: "fixed-commit"), ("_export_skill", export)):
            handle = patch.object(fixtures, name, replacement)
            handle.start()
            self.addCleanup(handle.stop)
        # validate_document's default root is production-scoped; keep the test fully isolated.
        validate = fixtures.validate_document
        handle = patch.object(fixtures, "validate_document", lambda doc: validate(doc, fixtures.FIXTURE_ROOT))
        handle.start()
        self.addCleanup(handle.stop)

    def test_identical_inputs_and_no_rubric_leakage(self):
        manifest = fixtures.prepare("old", None)
        fixtures.check_prepared()
        self.assertTrue(manifest["only_manager_varies"])
        for variant in ("baseline", "candidate"):
            root = fixtures.FIXTURES_DIR / variant
            self.assertEqual((root / "inputs/source.json").read_bytes(), self.source.read_bytes())
            self.assertFalse((root / "evals.json").exists())

    def test_stale_worktree_fails_before_run(self):
        fixtures.prepare("old", None)
        (fixtures.SKILLS_DIR / fixtures.MANAGER_SKILL / "SKILL.md").write_text("changed")
        with self.assertRaisesRegex(ValueError, "Worktree Manager changed"):
            fixtures.check_prepared()

    def test_changed_case_contract_fails(self):
        fixtures.prepare("old", None)
        self.source.write_text("changed input")
        with self.assertRaisesRegex(ValueError, "Eval contract changed"):
            fixtures.check_prepared()

    def test_modified_copied_input_fails(self):
        fixtures.prepare("old", None)
        (fixtures.FIXTURES_DIR / "candidate/inputs/source.json").write_text("changed copy")
        with self.assertRaisesRegex(ValueError, "case fixture differs"):
            fixtures.check_prepared()

    def test_changed_neighbor_fails(self):
        fixtures.prepare("old", None)
        (fixtures.SKILLS_DIR / "neighbor/SKILL.md").write_text("changed neighbor")
        with self.assertRaisesRegex(ValueError, "Shared Skill neighbor changed"):
            fixtures.check_prepared()

    def test_missing_manifest_fails(self):
        with self.assertRaisesRegex(ValueError, "not prepared"):
            fixtures.check_prepared()

    def test_committed_candidate_is_not_invalidated_by_worktree(self):
        fixtures.prepare("old", "candidate-commit")
        (fixtures.SKILLS_DIR / fixtures.MANAGER_SKILL / "SKILL.md").write_text("unrelated local revision")
        fixtures.check_prepared()


class ReportTests(unittest.TestCase):
    def test_failed_assertion_is_not_runtime_error(self):
        row = {"failureReason": 1, "error": "assertion failed", "gradingResult": {"componentResults": [
            {"assertion": {"metric": "task-outcome"}, "pass": True},
            {"assertion": {"metric": "routing-evidence"}, "pass": False},
        ]}}
        result = inspect_result(row)
        self.assertFalse(result["runtime_error"])
        self.assertTrue(result["metrics"]["task-outcome"]["pass"])
        self.assertFalse(result["metrics"]["routing-evidence"]["pass"])

    def test_timeout_is_not_skill_failure(self):
        result = inspect_result({"failureReason": 2, "error": "timeout"}, regrade=True)
        self.assertTrue(result["runtime_error"])
        self.assertEqual(result["metrics"], {})

    def test_natural_routing_stays_separate(self):
        row = {"testCase": {"metadata": {"case_id": 19, "evaluation_mode": "natural-routing"}}}
        self.assertEqual(inspect_result(row)["mode"], "natural-routing")

    def test_missing_grades_are_not_passes(self):
        self.assertEqual(inspect_result({"response": {"output": "ungraded"}})["metrics"], {})

    def test_replay_changes_only_outcome_without_overwriting_saved_grade(self):
        row = {"testCase": {"metadata": {"case_id": 12}}, "response": {"output": "saved output"}, "gradingResult": {"componentResults": [
            {"assertion": {"metric": "task-outcome"}, "pass": True},
            {"assertion": {"metric": "routing-evidence"}, "pass": False},
        ]}}
        with patch("review_results._run_javascript_assertion", return_value={"pass": False, "reason": "new check"}) as grader:
            result = inspect_result(row, regrade=True)
            grader.assert_called_once_with(12, "saved output")
        self.assertFalse(result["metrics"]["task-outcome"]["pass"])
        self.assertFalse(result["metrics"]["routing-evidence"]["pass"])
        self.assertTrue(row["gradingResult"]["componentResults"][0]["pass"])


if __name__ == "__main__":
    unittest.main()
