"""Local contract tests; no model calls, real login, or live marketing systems."""

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import prepare_promptfoo_fixtures as fixtures
from promptfoo_cases import SOURCE_READ_ASSERTIONS, _run_javascript, create_tests
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


class ClientBatchTests(unittest.TestCase):
    def test_batch_and_shortfall_share_request_but_not_evidence(self):
        tests = create_tests({"case_ids": [22, 23]})
        self.assertEqual(tests[0]["vars"]["request"].split("Supplied read-only files:")[0],
                         tests[1]["vars"]["request"].split("Supplied read-only files:")[0])
        self.assertNotEqual(tests[0]["metadata"]["files"], tests[1]["metadata"]["files"])
        for test in tests:
            self.assertEqual(test["metadata"]["outcome_review"], "manual")
            self.assertNotIn("task-outcome", [item["metric"] for item in test["assert"]])
            self.assertNotIn(test["metadata"]["expected_output"], test["vars"]["request"])

    def test_batch_source_check_requires_every_supplied_record(self):
        source = json.loads((Path(__file__).parent / "fixtures/inputs/case22-client-batch.json").read_text())
        ids = [source["record_id"]]
        for creator in source["creators"]:
            ids.append(creator["record_id"])
            ids.extend(message["record_id"] for message in creator["messages"])
        self.assertEqual(len(ids), len(set(ids)))

        def grade(record_ids):
            item = {"type": "command_execution", "exit_code": 0, "aggregated_output": " ".join(record_ids)}
            return _run_javascript(SOURCE_READ_ASSERTIONS[22], "", {"providerResponse": {"raw": {"items": [item]}}})["pass"]

        self.assertTrue(grade(ids))
        for missing in ids:
            with self.subTest(missing=missing):
                self.assertFalse(grade([record_id for record_id in ids if record_id != missing]))
        self.assertEqual(SOURCE_READ_ASSERTIONS[23], SOURCE_READ_ASSERTIONS[21])


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

    def test_manual_case_evidence_is_not_a_task_pass(self):
        row = {"testCase": {"metadata": {"case_id": 21, "outcome_review": "manual"}}, "response": {"output": "Review me"}, "gradingResult": {"componentResults": [
            {"assertion": {"metric": "response-evidence"}, "pass": True},
            {"assertion": {"metric": "routing-evidence"}, "pass": True},
            {"assertion": {"metric": "fixture-evidence"}, "pass": True},
        ]}}
        with patch("review_results._run_javascript_assertion") as grader:
            result = inspect_result(row, regrade=True)
            grader.assert_not_called()
        self.assertTrue(result["manual_review_required"])
        self.assertNotIn("task-outcome", result["metrics"])

    def test_manual_case_timeout_has_no_successful_evidence(self):
        result = inspect_result({"testCase": {"metadata": {"case_id": 21, "outcome_review": "manual"}}, "failureReason": 2, "error": "timeout"})
        self.assertTrue(result["runtime_error"])
        self.assertEqual(result["metrics"], {})

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
