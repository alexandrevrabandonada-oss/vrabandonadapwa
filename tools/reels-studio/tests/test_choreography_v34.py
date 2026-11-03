"""Pure movement regression tests: motion must not be synonymous with color."""
import math
import pytest
from studio.choreography_v34 import (
    FPS,POSE_FPS,GESTURES,plan,validate,SOURCE_CUTS,PALETTE_ID,
)
def test_distinct_grammars():
    assert validate()["same_palette_different_motions"]
    assert len(set(GESTURES))==8
def test_same_palette_different_temporal_behaviors():
    a=plan(0,.15,"kinetic")
    b=plan(0,.15,"measured")
    assert a.layer_offsets!=b.layer_offsets
    assert a.recoil!=b.recoil
    assert PALETTE_ID=="ACO_GRAFICO_ORIGINAL"
def test_shutters_have_opposing_movements():
    a=plan(0,.04,"kinetic")
    assert a.layer_offsets[0]>0 and a.layer_offsets[1]<0 and a.layer_offsets[2]>0
def test_photographic_movement_keeps_30fps_graphics_15fps():
    a=plan(3,.101)
    b=plan(3,.116)
    assert POSE_FPS==15 and FPS==30
    assert a.graphic_pose_index==b.graphic_pose_index
    assert a.camera_zoom!=b.camera_zoom
def test_impact_has_arrival_and_rest():
    a=plan(0,.1)
    b=plan(0,.8)
    assert b.arrival>=a.arrival
    assert sum(map(abs,b.layer_offsets))<sum(map(abs,a.layer_offsets))
def test_slower_documentary_variant():
    a=plan(3,.3,"kinetic")
    b=plan(3,.3,"measured")
    assert b.arrival<a.arrival
def test_no_outside_time():
    with pytest.raises(ValueError):plan(0,2.0)
def test_no_unknown_variant():
    with pytest.raises(ValueError):plan(0,.2,"magenta")
def test_no_invalid_scene():
    with pytest.raises(ValueError):plan(8,.1)
def test_no_nan():
    with pytest.raises(ValueError):plan(0,math.nan)
def test_source_duration():
    assert SOURCE_CUTS[-1]==14.5
def test_credit_and_publication_contract():
    r=validate()
    assert not r["voice_embedded"] and not r["publication_approved"]
    assert not r["artistic_score_certified"]
