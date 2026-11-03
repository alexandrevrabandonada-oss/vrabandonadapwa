"""V20 editorial review is required; excellent motion scores never certify action."""
import copy
import json
from pathlib import Path
import pytest
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from studio.editorial_curation_v20 import curate


def fixture():
    triage = {"source_id": "example", "source_sha1": "a"*40, "duration_sec": 10.,
              "publication_approved": False,
              "selected_for_review": [
                {"start_sec": 0., "end_sec": 2.8, "priority_score_heuristic": 100},
                {"start_sec": 3., "end_sec": 5.8, "priority_score_heuristic": 98},
                {"start_sec": 6., "end_sec": 8.8, "priority_score_heuristic": 80}]}
    review = {"source_id": "example", "source_sha1": "a"*40,
              "review_basis": "synthetic review fixture", "reviewed_by": "synthetic test",
              "intervals": [
                {"start_sec": 0, "end_sec": 3, "label": "GRAPHIC_MONTAGE",
                 "decision": "REJECT_FOR_ACTION", "reason": "fake broadcast introduction"},
                {"start_sec": 3, "end_sec": 6, "label": "TALKING_HEAD",
                 "decision": "REJECT_FOR_ACTION", "reason": "static presentation"},
                {"start_sec": 6, "end_sec": 10, "label": "LOCAL_ACTION",
                 "decision": "ACTION_PRESELECTED", "reason": "demonstration of review gate"}]}
    return triage, review


def test_high_score_montage_rejected_and_only_manual_action_preselected():
    triage, review = fixture()
    result = curate(triage, review)
    assert result["machine_candidate_count"] == 3
    assert result["action_preselected_count"] == 1
    assert result["action_candidates_after_editorial_review"][0]["start_sec"] == 6
    assert result["reviewed_candidates"][0]["editorial_status"] == "REJECTED_OR_REVIEW_PENDING"
    assert result["rights_cleared"] is False and result["publication_approved"] is False


def test_boundary_crossing_reviewed_segments_fail_closed():
    triage, review = fixture()
    triage["selected_for_review"] = [{"start_sec": 5.5, "end_sec": 7.,
                                      "priority_score_heuristic": 100}]
    result = curate(triage, review)
    assert result["action_preselected_count"] == 0


def test_wrong_source_or_unreviewed_intervals_rejected():
    triage, review = fixture()
    review["source_sha1"] = "b"*40
    with pytest.raises(ValueError, match="digest"):
        curate(triage, review)
    review["source_sha1"] = "a"*40
    review["intervals"][1]["start_sec"] = 3.5
    with pytest.raises(ValueError, match="gap"):
        curate(triage, review)


def test_review_gate_never_certifies_publication():
    triage, review = fixture()
    triage["publication_approved"] = True
    with pytest.raises(ValueError, match="publication"):
        curate(triage, review)


def test_actual_rodovia_review_labels_remove_all_action_claims():
    root = Path(__file__).resolve().parents[1]
    review = json.loads((root/"examples/rodovia_curadoria_v20.json").read_text())
    triage = {"source_id": "rodovia_2017", "source_sha1": review["source_sha1"],
              "duration_sec": 168.535, "publication_approved": False,
              "selected_for_review": [
                  {"start_sec": a, "end_sec": a+2.8, "priority_score_heuristic": 100}
                  for a in (0, 2.8, 25.2, 42., 114.8, 154., 156.8, 162.4)]}
    result = curate(triage, review)
    assert result["action_preselected_count"] == 0
    assert not result["use_for_action_reel"]
    assert result["source_fitness"] == "NO_ACTION_SHOTS_PRESELECTED"
