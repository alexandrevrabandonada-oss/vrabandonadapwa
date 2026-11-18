"""V20 human-review gate: machine scores never overrule documented editorial exclusion.

Annotations are editorial judgments on inspected source samples, NOT evidence of
copyright clearance, factual event authentication, full-frame inspection or
publication approval.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

LABELS = {"GRAPHIC_MONTAGE", "STUDIO_PRESENTER", "TALKING_HEAD", "LOCAL_ACTION",
          "CONTEXTUAL_BROLL", "UNKNOWN"}
DECISIONS = {"REJECT_FOR_ACTION", "REVIEW_ONLY", "ACTION_PRESELECTED"}


def _validate_interval(row):
    for key in ("start_sec", "end_sec", "label", "decision", "reason"):
        if key not in row:
            raise ValueError(f"missing interval {key}")
    if row["label"] not in LABELS or row["decision"] not in DECISIONS:
        raise ValueError("unrecognized review classification")
    if not row["reason"].strip():
        raise ValueError("empty review justification")
    if not 0 <= float(row["start_sec"]) < float(row["end_sec"]):
        raise ValueError("bad time interval")
    if row["decision"] == "ACTION_PRESELECTED" and row["label"] not in ("LOCAL_ACTION", "CONTEXTUAL_BROLL"):
        raise ValueError("non-action labels cannot be preselected for action")


def curate(triage: dict, annotations: dict) -> dict:
    if triage.get("source_id") != annotations.get("source_id"):
        raise ValueError("source ID mismatch")
    if triage.get("source_sha1") != annotations.get("source_sha1"):
        raise ValueError("source digest mismatch")
    if not annotations.get("review_basis") or not annotations.get("reviewed_by"):
        raise ValueError("review must disclose who and how")
    if triage.get("publication_approved") is not False:
        raise ValueError("cannot curate an approved-for-publication source")
    end = float(triage["duration_sec"])
    ranges = annotations.get("intervals", [])
    if not ranges:
        raise ValueError("review intervals are missing")
    for row in ranges:
        _validate_interval(row)
    ordered = sorted(ranges, key=lambda r: float(r["start_sec"]))
    if float(ordered[0]["start_sec"]) > .05 or float(ordered[-1]["end_sec"]) < end - .05:
        raise ValueError("review coverage incomplete")
    for prev, nxt in zip(ordered, ordered[1:]):
        if abs(float(prev["end_sec"]) - float(nxt["start_sec"])) > .05:
            raise ValueError("review has overlap or uncovered gap")
    reviewed = []
    preselected = []
    for shot in triage.get("selected_for_review", []):
        a = float(shot["start_sec"])
        b = float(shot["end_sec"])
        overlaps = [r for r in ordered
                    if a < float(r["end_sec"]) and b > float(r["start_sec"])]
        # Intervals at editorial boundaries are refused by default; never mix
        # a rejected TV montage with an approved action segment.
        safe = (len(overlaps) == 1 and overlaps[0]["decision"] == "ACTION_PRESELECTED"
                and a >= float(overlaps[0]["start_sec"])
                and b <= float(overlaps[0]["end_sec"]))
        item = {
            "start_sec": a, "end_sec": b,
            "machine_priority": shot.get("priority_score_heuristic"),
            "editorial_classifications": sorted({r["label"] for r in overlaps}),
            "editorial_status": "PRESELECTED_NOT_APPROVED" if safe else "REJECTED_OR_REVIEW_PENDING",
            "explanations": [r["reason"] for r in overlaps],
            "publication_approved": False
        }
        reviewed.append(item)
        if safe:
            preselected.append(item)
    return {
        "source_id": triage["source_id"],
        "source_sha1": triage["source_sha1"],
        "review_basis": annotations["review_basis"],
        "reviewed_by": annotations["reviewed_by"],
        "machine_candidate_count": len(triage.get("selected_for_review", [])),
        "action_preselected_count": len(preselected),
        "action_candidates_after_editorial_review": preselected,
        "reviewed_candidates": reviewed,
        "publication_approved": False,
        "rights_cleared": False,
        "artistic_quality_certified": False,
        "use_for_action_reel": bool(preselected),
        "source_fitness": "NO_ACTION_SHOTS_PRESELECTED" if not preselected else "PRESELECTED_PENDING_REVIEW",
        "note": "Sample-based review. Scene classification is fallible, not legal clearance or permission to publish."
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--triage", required=True, type=Path)
    p.add_argument("--review", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    args = p.parse_args()
    result = curate(
        json.loads(args.triage.read_text(encoding="utf8")),
        json.loads(args.review.read_text(encoding="utf8")))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf8")
    print(json.dumps({k: v for k, v in result.items()
                      if k not in ("reviewed_candidates", "action_candidates_after_editorial_review")},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
