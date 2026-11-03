"""V21 archival footage acquisition register: separate discovery from usable video.

A publicly watchable file or an archive reference NEVER clears copyright.
This module intentionally cannot approve publication.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse

SOURCE_TYPES = {
    "PRIMARY_FOOTAGE", "BROADCAST_EXCERPT", "DOCUMENTARY_WITH_ARCHIVES", "PHOTO_ONLY", "MIXED_COLLECTION_REFERENCE"
}
ACCESS_STATES = {
    "REFERENCE_FOUND", "VIEWABLE_ONLINE", "ACCESS_REQUESTED", "COPY_RECEIVED"
}
RIGHTS_STATES = {
    "UNKNOWN", "RESTRICTED", "PERMISSION_REQUIRED", "LICENSE_REVIEW_PENDING",
    "CLEARED_FOR_SPECIFIC_PROJECT"
}
ROLES = {"EVENT_EVIDENCE", "HISTORICAL_CONTEXT", "CITY_ACTION", "NON_ACTION_CONTEXT"}

def validate_record(a: dict) -> None:
    required = ("id", "title", "source_url", "custodian", "source_type",
                "access_state", "rights_state", "editorial_role", "rights_note",
                "date_or_period", "location", "source_identification")
    for key in required:
        if not isinstance(a.get(key), str) or not a[key].strip():
            raise ValueError(f"missing or empty field: {key}")
    if not a["id"].replace("_", "").replace("-", "").isalnum():
        raise ValueError("unsafe source id")
    if urlparse(a["source_url"]).scheme not in ("https",):
        raise ValueError("source URL must be HTTPS")
    for key, allowed in (("source_type", SOURCE_TYPES),
                         ("access_state", ACCESS_STATES),
                         ("rights_state", RIGHTS_STATES),
                         ("editorial_role", ROLES)):
        if a[key] not in allowed:
            raise ValueError(f"invalid {key}")
    if a.get("publication_approved") is not False:
        raise ValueError("archive leads must always be blocked for publication")
    if a.get("licensed_copy_path") or a.get("rights_cleared"):
        raise ValueError("research lead cannot claim licensed copy or rights cleared")
    if a["rights_state"] == "CLEARED_FOR_SPECIFIC_PROJECT":
        raise ValueError("rights clearance belongs in separate approval workflow")
    if a["access_state"] == "COPY_RECEIVED":
        raise ValueError("COPY_RECEIVED must be registered with validated local bytes, not as a lead")
    if a["source_type"] in ("PHOTO_ONLY", "MIXED_COLLECTION_REFERENCE") and a["editorial_role"] == "CITY_ACTION":
        raise ValueError("photos cannot be marked recorded local action")

def inspect_leads(leads: dict) -> dict:
    if leads.get("version") != "v0.21":
        raise ValueError("wrong lead registry version")
    entries = leads.get("sources")
    if not isinstance(entries, list) or not entries:
        raise ValueError("empty source register")
    seen = set()
    for a in entries:
        validate_record(a)
        if a["id"] in seen:
            raise ValueError(f"duplicate source id {a['id']}")
        seen.add(a["id"])
    return {
        "source_leads": len(entries),
        "video_leads": sum(s["source_type"] in ("PRIMARY_FOOTAGE", "BROADCAST_EXCERPT", "DOCUMENTARY_WITH_ARCHIVES") for s in entries),
        "bytes_received": 0,
        "rights_cleared_count": 0,
        "footage_reviewed_count": 0,
        "publication_approved": False,
        "status": "LEADS_ONLY_NOT_MEDIA",
    }

def inspect_received_copy(path: Path, manifest: dict) -> dict:
    # A separately obtained, local copy is required; never download from a news URL.
    if not path.is_file():
        raise FileNotFoundError(path)
    if not isinstance(manifest.get("source_id"), str) or not manifest.get("source_id"):
        raise ValueError("missing source id")
    sha = str(manifest.get("sha256", "")).lower()
    if len(sha) != 64 or any(c not in "0123456789abcdef" for c in sha):
        raise ValueError("missing SHA-256")
    if not manifest.get("origin_reference") or not manifest.get("received_from"):
        raise ValueError("missing chain of custody")
    if manifest.get("publication_approved") is not False:
        raise ValueError("cannot certify an approved source")
    digest = hashlib.sha256()
    with path.open("rb") as f:
        while chunk := f.read(1024 * 1024):
            digest.update(chunk)
    size = path.stat().st_size
    if digest.hexdigest() != sha or size != manifest.get("size_bytes"):
        raise ValueError("file integrity mismatch")
    return {
        "source_id": manifest["source_id"], "original_sha256": sha,
        "verified_bytes": size, "internal_inspection_possible": True,
        "rights_cleared": False, "publication_approved": False,
        "note": "A verified copy does not grant modification, exhibition or distribution rights."
    }

def export_pending_catalog(leads: dict) -> dict:
    inspect_leads(leads)
    # Existing media_registry automatically treats pending licenses as not approved.
    return {
        "assets": [{
            "id": s["id"],
            "type": "photo" if s["source_type"] == "PHOTO_ONLY" else "video",
            "source_url": s["source_url"],
            "source_description": s["source_identification"],
            "license_gate": "pending",
            "license_review_pending": True,
            "capture_date": None,  # period descriptors are not verified timestamps
            "event_verified": False,
        } for s in leads["sources"] if s["source_type"] != "MIXED_COLLECTION_REFERENCE"]
    }

def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--registry", type=Path, required=True)
    p.add_argument("--out", type=Path, required=False)
    a = p.parse_args()
    registry = json.loads(a.registry.read_text(encoding="utf8"))
    result = inspect_leads(registry)
    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(json.dumps({
            "audit": result, "catalog": export_pending_catalog(registry)
        }, ensure_ascii=False, indent=2), encoding="utf8")
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
