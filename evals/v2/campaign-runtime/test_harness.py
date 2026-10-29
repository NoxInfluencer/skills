import copy
import unittest
from harness import load_cases, prepare, review

class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.case = {'expectations': ['preserve scope', 'read back'], 'followups': []}
        self.result = {'completed': True, 'response': 'Scope retained. Readback unavailable.',
                       'skill_digest': 'sha', 'contract_digest': 'contract'}

    def test_successful_response_is_not_business_pass(self):
        self.assertEqual(review(self.case, self.result), 'needs-review')

    def test_runtime_error_never_becomes_pass(self):
        self.result['runtime_error'] = 'timeout'
        self.assertEqual(review(self.case, self.result), 'runtime-failed')

    def test_missing_answer_or_fingerprint_is_not_evidence(self):
        for key in ['response', 'skill_digest', 'contract_digest']:
            value = dict(self.result); value.pop(key)
            self.assertEqual(review(self.case, value), 'missing-evidence')

    def checks(self):
        return [{'index': 0, 'verdict': 'pass', 'evidence_excerpt': 'Scope retained.', 'reason': 'Target preserved'},
                {'index': 1, 'verdict': 'partial', 'evidence_excerpt': 'Readback unavailable.', 'reason': 'Cannot verify write'}]

    def test_partial_and_failure_not_hidden_by_average(self):
        self.result['reviews'] = self.checks()
        self.assertEqual(review(self.case, self.result), 'partial')
        self.result['reviews'][1]['verdict'] = 'fail'
        self.assertEqual(review(self.case, self.result), 'fail')

    def test_fabricated_excerpt_rejected(self):
        self.result['reviews'] = self.checks()
        self.result['reviews'][0]['evidence_excerpt'] = 'All creators emailed'
        self.assertEqual(review(self.case, self.result), 'invalid-review-evidence')

    def test_duplicate_review_indices_cannot_cover_missing_assertion(self):
        self.result['reviews'] = [self.checks()[0], self.checks()[0]]
        self.assertEqual(review(self.case, self.result), 'needs-review')

    def test_later_input_and_rubric_do_not_leak_into_first_turn(self):
        case = next(c for c in load_cases() if c.get('followups'))
        prepared = prepare(case, 'mcp')
        self.assertNotIn(case['followups'][0]['prompt'], prepared['prompt'])
        for expectation in case['expectations']:
            self.assertNotIn(expectation, prepared['prompt'])
        self.assertIn('plugins', prepared['skill_root'])

    def test_runtime_selection_and_fingerprints(self):
        case = load_cases()[0]
        cli, mcp = prepare(case, 'cli'), prepare(case, 'mcp')
        self.assertNotEqual(cli['skill_digest'], mcp['skill_digest'])
        self.assertEqual(cli['contract_digest'], mcp['contract_digest'])
        with self.assertRaises(ValueError): prepare(case, 'browser')

if __name__ == '__main__': unittest.main()
