"""Contract tests for the read-only renderer; business/source quality stays separate."""

import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parent / "tools/render_shortlist.py"
# Keep the standalone prototype import-free and avoid bytecode in future Skill trials.
namespace = {"__name__": "shortlist_renderer_test"}
exec(compile(SCRIPT.read_text(), str(SCRIPT), "exec"), namespace)
render = namespace["render"]


def request():
    records = []
    for creator_id, amount in (("alpha", "1400"), ("beta", "800"), ("gamma", "100")):
        records.append({
            "id": creator_id, "name": creator_id.title(), "eligible": True,
            "reply_type": "human", "quote": {"amount": amount, "currency": "USD", "terms": "one integration; not agreed"},
            "cells": {"judgment": "Relevant scene", "evidence": "Dated source", "timing": "October proposed"},
        })
    return {
        "target_count": 2, "require_human_reply": True,
        "columns": [["creator", "Creator"], ["judgment", "Judgment"], ["evidence", "Evidence"], ["quote", "Quoted fee and scope"], ["timing", "Timing"]],
        "records": records, "selected_ids": ["beta", "alpha"],
    }


class RendererTests(unittest.TestCase):
    def test_single_selection_controls_count_and_row_order(self):
        result = render(request())
        self.assertEqual(result["selected_ids"], ["beta", "alpha"])
        self.assertEqual(result["selected_count"], 2)
        self.assertEqual(result["shortfall"], 0)
        self.assertEqual(len(result["markdown"].splitlines()), 4)
        self.assertNotIn("Gamma", result["markdown"])
        self.assertLess(result["markdown"].index("Beta"), result["markdown"].index("Alpha"))

    def test_shortfall_does_not_pad_or_drop_available_admissible_rows(self):
        data = request()
        data["target_count"] = 5
        data["records"][2]["eligible"] = False
        self.assertEqual(render(data)["shortfall"], 3)
        data["selected_ids"] = ["alpha"]
        with self.assertRaisesRegex(ValueError, "selection count"):
            render(data)

    def test_no_universal_batch_size_when_target_is_unspecified(self):
        data = request()
        data["target_count"] = None
        data["selected_ids"] = ["alpha"]
        self.assertIsNone(render(data)["shortfall"])

    def test_human_rule_rejects_auto_pending_and_unknown_only_when_required(self):
        for reply in ("automatic", "none", "unknown"):
            with self.subTest(reply=reply):
                data = request()
                data["records"][0]["reply_type"] = reply
                with self.assertRaisesRegex(ValueError, "reply rules"):
                    render(data)
                data["require_human_reply"] = False
                self.assertEqual(render(data)["selected_count"], 2)

    def test_rejects_unqualified_selected_record(self):
        data = request()
        data["records"][0]["eligible"] = False
        with self.assertRaisesRegex(ValueError, "eligibility"):
            render(data)

    def test_rejects_unknown_or_duplicate_selected_ids_and_duplicate_records(self):
        for selected in (["alpha", "missing"], ["alpha", "alpha"]):
            data = request()
            data["selected_ids"] = selected
            with self.assertRaises(ValueError):
                render(data)
        data = request()
        data["records"].append(copy.deepcopy(data["records"][0]))
        with self.assertRaisesRegex(ValueError, "duplicate record"):
            render(data)

    def test_rejects_wrong_batch_counts_and_implicit_flags(self):
        for selected in (["alpha"], ["alpha", "beta", "gamma"]):
            data = request()
            data["selected_ids"] = selected
            with self.assertRaisesRegex(ValueError, "selection count"):
                render(data)
        for target in (True, 0, -1, "5"):
            data = request()
            data["target_count"] = target
            with self.assertRaises(ValueError):
                render(data)
        for field in ("require_human_reply",):
            data = request()
            del data[field]
            with self.assertRaises(ValueError):
                render(data)

    def test_price_minimum_uses_selected_ids_not_the_whole_pool(self):
        result = render(request())
        self.assertEqual(result["known_quoted_minima_by_currency"], {"USD": {"amount": "800", "ids": ["beta"]}})

    def test_ties_currencies_unknowns_and_zero_are_distinct(self):
        data = request()
        data["records"][0]["quote"]["amount"] = "800"
        self.assertEqual(render(data)["known_quoted_minima_by_currency"]["USD"]["ids"], ["beta", "alpha"])
        data["records"][0]["quote"]["currency"] = "EUR"
        self.assertEqual(set(render(data)["known_quoted_minima_by_currency"]), {"USD", "EUR"})
        data["records"][0]["quote"] = None
        self.assertEqual(render(data)["unknown_quote_ids"], ["alpha"])
        data["records"][1]["quote"]["amount"] = "0"
        self.assertEqual(render(data)["known_quoted_minima_by_currency"]["USD"]["amount"], "0")

    def test_money_is_exact_and_rejects_ambiguous_values(self):
        data = request()
        data["records"][0]["quote"]["amount"] = "1400.005"
        self.assertIn("USD 1,400.005", render(data)["markdown"])
        for bad in (800, True, "-1", "NaN", "Infinity", "1,400", "1e3", ""):
            with self.subTest(amount=bad):
                data["records"][0]["quote"]["amount"] = bad
                with self.assertRaises(ValueError):
                    render(data)

    def test_missing_cells_or_hidden_known_quote_fail(self):
        data = request()
        del data["records"][0]["cells"]["timing"]
        with self.assertRaisesRegex(ValueError, "cells.timing"):
            render(data)
        data = request()
        data["columns"] = [column for column in data["columns"] if column[0] != "quote"]
        with self.assertRaisesRegex(ValueError, "known quotes"):
            render(data)

    def test_escapes_cell_structure_and_rejects_unsafe_source_links(self):
        data = request()
        data["records"][0]["cells"]["evidence"] = "a|b\n<script>[link](x)</script>"
        rendered = render(data)["markdown"]
        self.assertIn(r"a\|b<br>&lt;script&gt;\[link\](x)&lt;/script&gt;", rendered)
        for url in ("javascript:alert(1)", "https://user:secret@example.test", "https://example.test/a b",
                    "https://example.test/a|b", "https://example.test/a\\"):
            data["records"][0]["url"] = url
            with self.assertRaisesRegex(ValueError, "unsafe source URL"):
                render(data)
        data["records"][0]["url"] = "https://creators.example/alpha"
        self.assertIn("[Alpha](https://creators.example/alpha)", render(data)["markdown"])

    def test_render_does_not_mutate_input_or_claim_source_verification(self):
        data = request()
        before = copy.deepcopy(data)
        result = render(data)
        self.assertEqual(data, before)
        self.assertIn("not source truth or business approval", result["validation_scope"])
        # Free text cannot repair a caller's wrong eligibility declaration.
        data["records"][0]["cells"]["evidence"] = "The supplied long-form evidence fails this project's admission rule."
        self.assertIn("alpha", render(data)["selected_ids"])
        data["records"][0]["eligible"] = False
        with self.assertRaisesRegex(ValueError, "eligibility"):
            render(data)

    def test_cli_stdin_stdout_and_errors_without_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            good = subprocess.run([sys.executable, str(SCRIPT)], input=json.dumps(request()), text=True, capture_output=True, cwd=directory)
            self.assertEqual(good.returncode, 0, good.stderr)
            self.assertEqual(json.loads(good.stdout)["selected_count"], 2)
            bad = subprocess.run([sys.executable, str(SCRIPT)], input="{", text=True, capture_output=True, cwd=directory)
            self.assertEqual(bad.returncode, 2)
            self.assertEqual(bad.stdout, "")
            self.assertEqual(list(Path(directory).iterdir()), [])


if __name__ == "__main__":
    unittest.main()
