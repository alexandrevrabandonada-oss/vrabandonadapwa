"""V21 archival sourcing gates; fixtures are fictional and contain no third-party media."""
from __future__ import annotations
import hashlib
import json
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from studio.archive_intake_v21 import (
    inspect_leads, validate_record, inspect_received_copy, export_pending_catalog
)
from studio.media_registry import analyze_catalog, inspect_usage

REGISTRY = Path(__file__).resolve().parents[1] / "examples/acervo_arquivistico_v21.json"

def load():
    return json.loads(REGISTRY.read_text(encoding="utf8"))

def test_registry_has_archive_film_notation_and_no_automatic_footage_access():
    d = load()
    r = inspect_leads(d)
    assert r["source_leads"] >= 4 and r["video_leads"] >= 3
    primary = next(x for x in d["sources"] if x["id"] == "AN_FJ_FIL_0001_0003")
    assert "BR_RJANRIO_FJ_0_FIL_0001_0003" in primary["source_identification"]
    assert primary["access_state"] == "VIEWABLE_ONLINE"
    assert primary["rights_state"] == "PERMISSION_REQUIRED"
    assert r["bytes_received"] == 0
    assert not r["publication_approved"]

def test_mixed_collection_is_not_mistaken_for_a_video():
    catalog = export_pending_catalog(load())
    assert "AN_FJ_HISTORY_SOUNDS" not in [x["id"] for x in catalog["assets"]]
    assert analyze_catalog(catalog)["rights_verified_count"] == 0
    assert not inspect_usage(catalog, [{
        "asset_id": "AN_FJ_FIL_0001_0003", "editorial_role": "event_evidence",
        "event_date": "1988-11-09", "fact_checked_by": "fictional",
    }], public=True)["pass"]

@pytest.mark.parametrize("field,newval", [
    ("access_state","COPY_RECEIVED"),
    ("rights_state","CLEARED_FOR_SPECIFIC_PROJECT"),
    ("publication_approved",True),
    ("source_url","http://insecure.example/video"),
])
def test_lead_cannot_upgrade_itself(field,newval):
    d = load()
    d["sources"][0][field] = newval
    with pytest.raises(ValueError):
        inspect_leads(d)

def test_registry_rejects_duplicate_id_and_no_source_id():
    d = load()
    d["sources"].append(dict(d["sources"][0]))
    with pytest.raises(ValueError, match="duplicate"):
        inspect_leads(d)
    d = load()
    d["sources"][0]["id"] = ""
    with pytest.raises(ValueError, match="missing"):
        inspect_leads(d)

def test_received_file_can_be_verified_without_licensing_it(tmp_path):
    p=tmp_path/"received.bin"
    p.write_bytes(b"LABORATORY_DUMMY_NOT_HISTORICAL")
    manifest={
        "source_id":"lab_01", "sha256":hashlib.sha256(p.read_bytes()).hexdigest(),
        "size_bytes":p.stat().st_size,
        "origin_reference":"lab synthetic", "received_from":"lab fixtures",
        "publication_approved": False
    }
    good = inspect_received_copy(p,manifest)
    assert good["internal_inspection_possible"]
    assert not good["rights_cleared"] and not good["publication_approved"]
    p.write_bytes(b"CHANGED")
    with pytest.raises(ValueError,match="integrity"):
        inspect_received_copy(p,manifest)

def test_photograph_cannot_claim_real_moving_action():
    d=load()
    s=d["sources"][0]
    s["source_type"]="PHOTO_ONLY"
    s["editorial_role"]="CITY_ACTION"
    with pytest.raises(ValueError):
        validate_record(s)
