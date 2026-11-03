"""V20 QA: shot suggestions are repeatable, human-reviewed and not publishing permits."""
import hashlib
import json
import cv2
import numpy as np
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from studio.shot_scout_v20 import authenticate, rank_metrics, scout, contact_sheet, cut_distance


def manifest_for(path):
    data = {"id": "v20_sample", "sha1": hashlib.sha1(path.read_bytes()).hexdigest(),
            "size_bytes": path.stat().st_size, "source_url": "https://example.org/fixture",
            "author": "synthetic lab fixture", "license_review": "PENDING_MANUAL_REVIEW",
            "publication_approved": False}
    man = path.with_suffix(".json")
    man.write_text(json.dumps(data))
    return man


def make_clip(path, moving=True):
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), 15, (320, 180))
    if not writer.isOpened():
        raise RuntimeError("test video codec unavailable")
    texture = np.random.default_rng(2).integers(15, 100, (180, 320, 3), dtype=np.uint8)
    for i in range(90):
        frame = texture.copy()
        cv2.rectangle(frame, (40 + (i * 3 if moving else 0), 50),
                      (100 + (i * 3 if moving else 0), 125),
                      (20, 240, 240), thickness=-1)
        writer.write(frame)
    writer.release()


def test_still_window_not_approved_as_action():
    metrics = {"local_motion_p95": .02, "local_motion_share": 0.,
               "camera_motion_px": 12., "sharpness": 180.,
               "median_brightness": 120., "cut_like_pairs": 0, "valid_pairs": 3}
    result = rank_metrics(metrics)
    assert not result["action_candidate"]
    assert "MOVIMENTO_LOCAL_INSUFICIENTE" in result["review_flags"]


def test_cut_cannot_be_mistaken_for_subject_movement():
    metrics = {"local_motion_p95": 12., "local_motion_share": .9,
               "camera_motion_px": 0., "sharpness": 180.,
               "median_brightness": 120., "cut_like_pairs": 3, "valid_pairs": 0}
    result = rank_metrics(metrics)
    assert not result["action_candidate"]
    assert "POSSIVEL_CORTE_NO_TRECHO" in result["review_flags"]


def test_source_manifest_is_integrity_gated(tmp_path):
    p = tmp_path / "motion.mp4"
    p.write_bytes(b"sample")
    m = manifest_for(p)
    assert authenticate(p, m)["id"] == "v20_sample"
    p.write_bytes(b"corrupted")
    with pytest.raises(ValueError, match="integrity"):
        authenticate(p, m)
    p.write_bytes(b"sample")
    data = json.loads(m.read_text())
    data["publication_approved"] = True
    m.write_text(json.dumps(data))
    with pytest.raises(ValueError, match="internal"):
        authenticate(p, m)


def test_different_frames_trigger_cut_heuristic():
    a = np.zeros((120, 220, 3), np.uint8)
    b = np.full_like(a, (0, 180, 180))
    assert cut_distance(a, b) > .52


def test_local_motion_scout_creates_reviewable_contact_sheet(tmp_path):
    p = tmp_path / "motion.mp4"
    make_clip(p, moving=True)
    m = manifest_for(p)
    report = scout(p, m, window=2.8, stride=2.8, top=3)
    assert report["windows_scanned"] >= 2
    assert report["action_candidate_count"] >= 1
    assert report["selected_for_review"]
    assert not report["publication_approved"]
    assert not report["aesthetic_quality_certified"]
    out = tmp_path / "contact.jpg"
    contact_sheet(p, report["selected_for_review"], out)
    assert out.is_file() and out.stat().st_size > 1000


def test_motionless_source_does_not_claim_action(tmp_path):
    p = tmp_path / "static.mp4"
    make_clip(p, moving=False)
    report = scout(p, manifest_for(p), window=2.8, stride=2.8)
    assert report["action_candidate_count"] == 0
    assert report["selected_for_review"] == []
    assert report["rights_cleared"] is False


def test_scanning_parameters_are_rejected_before_video_access(tmp_path):
    with pytest.raises(ValueError, match="unsafe"):
        scout(tmp_path/"missing.mp4", tmp_path/"missing.json", window=.1)
