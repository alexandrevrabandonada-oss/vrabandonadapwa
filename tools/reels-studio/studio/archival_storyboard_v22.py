"""V22 Aço Gráfico: sequence grammar gated by *observed* source footage.

This planning module does not download copyrighted footage and never approves
publication. A synopsis is not an observation and does not furnish timecodes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse

ALLOWED_FORM = {"LIVE_ACTION_DOCUMENTARY", "HISTORICAL_NEWSREEL", "ANIMATED_EDUCATIONAL_FILM"}
RIGHTS = {"PERMISSION_REQUIRED", "RESTRICTED", "UNKNOWN"}
COPY = {"NOT_RECEIVED", "ACCESS_REQUESTED"}
GRAMMAR = {"action_follow", "industrial_geometry", "evidence_read", "witness_context", "architectural_travel"}
SOURCE_ROLE = {"historic_action", "context", "document", "animated_explanation"}


def validate_catalog(catalog: dict) -> dict:
    if catalog.get("version") != "v0.22" or catalog.get("publication_approved") is not False:
        raise ValueError("v22 research-only catalog required")
    if not isinstance(catalog.get("sources"), list) or not catalog["sources"]:
        raise ValueError("empty archive sources")
    unique = set()
    for source in catalog["sources"]:
        sid = source.get("id")
        if not sid or sid in unique:
            raise ValueError("missing or repeated source ID")
        unique.add(sid)
        if not source.get("official_id") or not source.get("title"):
            raise ValueError("catalog source needs official identifying metadata")
        if urlparse(source.get("reference_url", "")).scheme != "https":
            raise ValueError("HTTPS source reference required")
        if source.get("form") not in ALLOWED_FORM:
            raise ValueError("unknown media form")
        if source.get("rights_state") not in RIGHTS or source.get("copy_state") not in COPY:
            raise ValueError("source cannot auto-upgrade research rights or possession")
        if source.get("allowed_use") != "RESEARCH_METADATA_ONLY":
            raise ValueError("reproduction rights are never inferred")
        if source.get("local_sha256") or source.get("publication_approved") is True:
            raise ValueError("a mere source reference cannot carry media clearance")
        for scene in source.get("shot_ideas", []):
            if not scene.get("event") or not scene.get("description"):
                raise ValueError("incomplete synopsis observation idea")
            if scene.get("timecode_verified") is not False or scene.get("observed_frames") is not False:
                raise ValueError("synopsis-derived ideas cannot claim verified timecodes or frames")
    leads = catalog.get("secondary_research_leads", [])
    if not isinstance(leads, list):
        raise ValueError("secondary research leads must be a list")
    for lead in leads:
        sid=lead.get("id")
        if not sid or sid in unique:
            raise ValueError("duplicate or missing research lead ID")
        unique.add(sid)
        if not lead.get("title") or not lead.get("reference_note"):
            raise ValueError("research lead lacks identification")
        if urlparse(lead.get("reference_url","")).scheme != "https":
            raise ValueError("research lead needs HTTPS citation")
        if lead.get("copy_state") != "NOT_RECEIVED" or lead.get("rights_state") != "UNKNOWN":
            raise ValueError("uncorroborated research lead cannot claim copy or rights")
        if lead.get("publication_approved") is True or lead.get("timecodes") or lead.get("shot_ideas"):
            raise ValueError("research lead cannot enter scene production")
    return {"source_count": len(catalog["sources"]), "secondary_leads_count": len(leads),
            "rights_cleared_count": 0, "copies_received_count": 0,
            "publication_approved": False, "status": "RESEARCH_ONLY_NO_REEL"}


def propose_decoupage(catalog: dict) -> dict:
    validate_catalog(catalog)
    shots = []
    for source in catalog["sources"]:
        for idea in source.get("shot_ideas", []):
            shots.append({
                "source_id": source["id"], "official_film_id": source["official_id"],
                "proposed_action": idea["description"], "suggested_role": "historic_action",
                "timecode_start": None, "timecode_end": None,
                "source_file_sha256": None, "viewer_checked_by": None,
                "clip_status": "UNOBSERVED_NOT_EXPORTABLE",
                "publication_approved": False
            })
    return {"planned_shots": shots, "rights_approved": False,
            "publication_approved": False, "is_finished_video": False,
            "note": "Source synopsis only; actual scene timing, content and licensing await screening."}


def inspect_verified_cutlist(cutlist: list[dict], catalog: dict) -> dict:
    """Inspect a manually written editorial list, not a public render permit.

    A cutlist backed by a verified file remains ineligible for release until
    rights and separate editorial approvals are documented outside this module.
    """
    validate_catalog(catalog)
    sources = {s["id"]: s for s in catalog["sources"]}
    errors = []
    roles = []
    grammars = []
    for i, shot in enumerate(cutlist):
        label = f"shot {i}"
        source = sources.get(shot.get("source_id"))
        if not source:
            errors.append(f"{label}: unknown source")
            continue
        if shot.get("grammar") not in GRAMMAR:
            errors.append(f"{label}: unknown camera grammar")
        grammars.append(shot.get("grammar"))
        role = shot.get("role")
        if role not in SOURCE_ROLE:
            errors.append(f"{label}: invalid purpose")
        roles.append(role)
        if source["form"] == "ANIMATED_EDUCATIONAL_FILM" and role == "historic_action":
            errors.append(f"{label}: animated source cannot prove physical action")
        if source["form"] != "LIVE_ACTION_DOCUMENTARY" and role == "historic_action":
            errors.append(f"{label}: verify newsreel before physical-action classification")
        if shot.get("crop") != "contain_no_crop" and role in ("historic_action", "document"):
            errors.append(f"{label}: primary historical film must not be destructively cropped")
        if shot.get("on_screen_source") != source["official_id"]:
            errors.append(f"{label}: missing/incorrect primary film credit")
        if not shot.get("reviewed_by") or shot.get("verified_frames") is not True:
            errors.append(f"{label}: timecodes require frame-level human screening")
        start, end = shot.get("start_sec"), shot.get("end_sec")
        if not isinstance(start, (float, int)) or not isinstance(end, (float, int)) or not (0 <= start < end and .45 <= end-start <= 12):
            errors.append(f"{label}: invalid cut duration/timing")
        if not isinstance(shot.get("source_sha256"), str) or len(shot["source_sha256"]) != 64 or any(c not in "0123456789abcdef" for c in shot["source_sha256"]):
            errors.append(f"{label}: exact source-byte hash required")
        if shot.get("is_simulation") and role != "animated_explanation":
            errors.append(f"{label}: simulation cannot be documentary evidence")
    if not cutlist:
        errors.append("empty cutlist")
    if len(cutlist) >= 3 and len(set(grammars)) < 3:
        errors.append("monotonous visual grammar: require three kinds of shot")
    if len(cutlist) >= 3 and "historic_action" not in roles:
        errors.append("no verified physical action in history edit")
    return {
        "valid_as_internal_editorial_cutlist": not errors,
        "errors": errors, "shots": len(cutlist),
        "distinct_grammars": len(set(grammars)),
        "rights_cleared": False, "publication_approved": False,
        "can_render_or_redistribute": False,
        "artistic_quality_certified": False,
        "note": "Even valid cuts cannot render until source rights and copy are cleared elsewhere."
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--catalog", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    opts = p.parse_args()
    data = json.loads(opts.catalog.read_text(encoding="utf8"))
    result = {"validation": validate_catalog(data), "storyboard": propose_decoupage(data)}
    opts.out.parent.mkdir(parents=True, exist_ok=True)
    opts.out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf8")
    print(json.dumps({"validation": result["validation"],
                      "proposed_beats": len(result["storyboard"]["planned_shots"])},
                      ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
