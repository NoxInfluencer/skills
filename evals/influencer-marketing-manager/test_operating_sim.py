"""Offline checks for the local operating exercise, not model outcome grades."""

import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


FIXTURES = Path(__file__).parent / "fixtures" / "inputs"
ADAPTER = FIXTURES / "operating-sim.py"


class OperatingSimulationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.state_path = self.root / "state.json"

    def load(self, name):
        self.state_path.write_bytes((FIXTURES / name).read_bytes())
        return self.state()

    def state(self):
        return json.loads(self.state_path.read_text())

    def command(self, *args, success=True, cwd=None, state_path=None):
        result = subprocess.run([sys.executable, str(ADAPTER), "--state",
                                 str(state_path or self.state_path), *args],
                                cwd=cwd or self.root, text=True, capture_output=True)
        if success:
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads(result.stdout)
        self.assertNotEqual(result.returncode, 0)
        return result

    def test_migration_preserves_business_state_and_replays_once(self):
        before = self.load("case60-existing-job.json")
        request = ["--job-id", "job-followups", "--route", "cli", "--on-gap", "pause-dependent"]
        preview = self.command("preview-route", *request)
        self.assertEqual(self.state(), before)
        self.command("apply-route", *request, "--preview-token", preview["preview_token"],
                     "--idempotency-key", "migration-1")
        expected = copy.deepcopy(before)
        expected["jobs"][0]["execution"] = {"route": "cli", "on_gap": "pause-dependent"}
        expected["jobs"][0]["revision"] += 1
        actual = self.state()
        expected["applied_requests"] = actual["applied_requests"]
        self.assertEqual(actual, expected)
        replay = self.command("apply-route", *request, "--preview-token", preview["preview_token"],
                              "--idempotency-key", "migration-1")
        self.assertTrue(replay["idempotent_replay"])
        self.assertEqual(self.state(), actual)

    def test_stale_preview_rejects_without_mutation(self):
        state = self.load("case60-existing-job.json")
        request = ["--job-id", "job-followups", "--route", "cli", "--on-gap", "pause-dependent"]
        preview = self.command("preview-route", *request)
        state["jobs"][0]["revision"] += 1
        self.state_path.write_text(json.dumps(state))
        self.command("apply-route", *request, "--preview-token", preview["preview_token"],
                     "--idempotency-key", "migration-2", success=False)
        self.assertEqual(self.state(), state)

    def test_run_completion_queues_only_eligible_work_and_does_not_duplicate(self):
        self.load("case61-ready-job.json")
        run = self.command("run", "--job-id", "job-followups", "--idempotency-key", "cycle-01")
        self.assertEqual(run["status"], "accepted")
        self.assertEqual(self.state()["outbound_queue"], [])
        args = ["result", "--job-id", "job-followups", "--run-id", run["run_id"]]
        self.assertEqual(self.command(*args)["status"], "running")
        result = self.command(*args)
        self.assertEqual(result["status"], "completed")
        self.assertEqual([a["creator_id"] for a in result["actions"]], ["synthetic-stone"])
        self.assertEqual(result["actions"][0]["state"], "queued")
        self.assertEqual(result["daily_reservations_used"], 7)
        self.assertEqual(result["confirmed_partnerships"], 1)
        self.assertEqual(result["confirmed_target"], 2)
        completed = self.state()
        self.command(*args)
        self.command("run", "--job-id", "job-followups", "--idempotency-key", "cycle-01")
        self.assertEqual(self.state(), completed)
        self.assertEqual(len(completed["runs"]), 1)
        self.assertEqual(len(completed["outbound_queue"]), 1)

    def test_state_cannot_escape_or_run_in_a_checkout(self):
        self.load("case61-ready-job.json")
        nested = self.root / "nested"
        nested.mkdir()
        self.command("show", cwd=nested, success=False)
        (self.root / ".git").mkdir()
        self.command("show", success=False)

    def test_opaque_run_identity_is_returned_and_recovered_without_duplicate_work(self):
        self.load("case65-opaque-run.json")
        run = self.command("run", "--job-id", "job-followups", "--idempotency-key", "opaque-cycle")
        self.assertRegex(run["run_id"], r"^local-run-[0-9a-f]{32}$")
        accepted = self.state()
        self.command("result", "--job-id", "job-followups", "--run-id", "local-run-1", success=False)
        self.assertEqual(self.state(), accepted)
        recovered = self.command("run", "--job-id", "job-followups", "--idempotency-key", "opaque-cycle")
        self.assertEqual(recovered["run_id"], run["run_id"])
        self.assertEqual(self.state(), accepted)
        args = ["result", "--job-id", "job-followups", "--run-id", recovered["run_id"]]
        self.command(*args)
        self.assertEqual(self.command(*args)["status"], "completed")
        completed = self.state()
        self.command("run", "--job-id", "job-followups", "--idempotency-key", "opaque-cycle")
        self.command(*args)
        self.assertEqual(self.state(), completed)
        self.assertEqual(len(completed["runs"]), 1)
        self.assertEqual(len(completed["outbound_queue"]), 1)

    def test_duplicate_or_missing_identities_reject_before_mutation(self):
        for collection, field in (("jobs", "id"), ("relationships", "creator_id")):
            for missing in (False, True):
                with self.subTest(collection=collection, missing=missing):
                    state = self.load("case61-ready-job.json")
                    if missing:
                        state[collection][0][field] = ""
                    else:
                        state[collection].append(copy.deepcopy(state[collection][0]))
                    self.state_path.write_text(json.dumps(state))
                    self.command("run", "--job-id", "job-followups", "--idempotency-key", "bad-identity", success=False)
                    self.assertEqual(self.state(), state)

    def test_non_exercise_state_is_rejected(self):
        state = self.load("case61-ready-job.json")
        state["fixture_kind"] = "real-account-data"
        self.state_path.write_text(json.dumps(state))
        self.command("show", success=False)
        self.assertEqual(self.state(), state)


if __name__ == "__main__":
    unittest.main()
