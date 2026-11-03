"""v22: archival image is preserved even when the surrounding design moves."""
import json
import sys
from pathlib import Path
import cv2
import numpy as np
import pytest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.archival_storyboard_v22 import validate_catalog, propose_decoupage, inspect_verified_cutlist
from studio.archival_stage_v22 import archive_frame, lab_frame, contain_bounds

CAT=Path(__file__).resolve().parents[1]/"examples/fontes_industriais_v22.json"

def catalog():
    return json.loads(CAT.read_text(encoding="utf8"))

def test_1953_documentary_is_identified_as_actual_moving_source_not_animation():
    c=catalog()
    assert validate_catalog(c)["source_count"] == 4
    film=next(a for a in c["sources"] if a["official_id"]=="013614")
    assert film["year"]==1953 and film["form"]=="LIVE_ACTION_DOCUMENTARY"
    assert len(film["shot_ideas"])==4
    assert film["copy_state"]=="NOT_RECEIVED"
    assert next(a for a in c["sources"] if a["official_id"]=="028619")["form"]=="ANIMATED_EDUCATIONAL_FILM"

def test_synopsis_cannot_be_assigned_fake_timecodes():
    c=catalog()
    p=propose_decoupage(c)
    assert len(p["planned_shots"])==4
    assert all(s["timecode_start"] is None and s["clip_status"]=="UNOBSERVED_NOT_EXPORTABLE"
               for s in p["planned_shots"])
    assert p["publication_approved"] is False
    c["sources"][0]["shot_ideas"][0]["observed_frames"]=True
    with pytest.raises(ValueError, match="synopsis"):
        validate_catalog(c)

def test_animated_source_must_not_be_presented_as_historic_physical_action():
    c=catalog()
    shot={"source_id":"cinemateca_1968_animation","grammar":"action_follow",
          "role":"historic_action","crop":"contain_no_crop","on_screen_source":"028619",
          "reviewed_by":"lab","verified_frames":True,"start_sec":1,"end_sec":3,
          "source_sha256":"a"*64}
    r=inspect_verified_cutlist([shot],c)
    assert any("animated source" in e for e in r["errors"])
    assert not r["can_render_or_redistribute"]

def test_frame_preserved_while_background_is_animated():
    src=lab_frame(1)
    a,ra=archive_frame(src,0,annotate_simulation=True)
    b,rb=archive_frame(src,1,annotate_simulation=True)
    assert a.shape==(960,540,3) and b.shape==a.shape
    x,y,w,h=ra["source_rect_xywh"]
    expected=cv2.resize(src,(w,h),interpolation=cv2.INTER_AREA)
    assert np.array_equal(a[y:y+h,x:x+w],expected)
    assert np.array_equal(a[y:y+h,x:x+w],b[y:y+h,x:x+w])
    assert not np.array_equal(a[:,:15],b[:,:15])
    assert ra["publication_approved"] is False

def test_4_3_is_contained_without_9_16_subject_crop():
    x,y,w,h=contain_bounds((480,640,3))
    assert (w,h)==(496,372)
    assert 0<=x and y>=310 and y+h<=750
    with pytest.raises(ValueError):
        contain_bounds((1,1,3))

def test_synthetic_three_shots_can_be_valid_editorial_notes_but_not_released():
    c=catalog()
    cuts=[]
    for g,start in (("action_follow",0),("industrial_geometry",3),("architectural_travel",6)):
        cuts.append({"source_id":"cinemateca_csn_minerio_1953","grammar":g,
                     "role":"historic_action","crop":"contain_no_crop",
                     "on_screen_source":"013614","reviewed_by":"synthetic lab","verified_frames":True,
                     "start_sec":start,"end_sec":start+2,"source_sha256":"a"*64})
    r=inspect_verified_cutlist(cuts,c)
    assert r["valid_as_internal_editorial_cutlist"] is True
    assert r["can_render_or_redistribute"] is False
    cuts[1]["crop"]="crop_to_vertical"
    assert not inspect_verified_cutlist(cuts,c)["valid_as_internal_editorial_cutlist"]

def test_unsafe_research_upgrade_fails():
    c=catalog()
    c["sources"][0]["rights_state"]="CLEARED"
    with pytest.raises(ValueError,match="rights"):
        validate_catalog(c)

def test_secondary_1954_films_remain_unverified_leads_not_action_sources():
    c=catalog()
    r=validate_catalog(c)
    assert r["secondary_leads_count"]==4
    assert all(s["copy_state"]=="NOT_RECEIVED" and s["rights_state"]=="UNKNOWN"
               for s in c["secondary_research_leads"])
    assert len(propose_decoupage(c)["planned_shots"])==4
    c["secondary_research_leads"][0]["rights_state"]="CLEARED"
    with pytest.raises(ValueError,match="rights"):
        validate_catalog(c)
