"""V33: motion is animation + camera + independent layers, not a color theme."""
import numpy as np
import pytest
from studio import visual_director_v33 as V

def test_eight_kinetic_grammars():
    report=V.inspect_motion_language_v33()
    assert report['distinct_grammars']==8
    assert len(set(report['patterns']))==8

def test_footage_fps_not_stepped_with_graphics():
    a=V.kinetic_state_v33(0,.201)
    b=V.kinetic_state_v33(0,.224)
    assert a['graphic_phase']==b['graphic_phase']
    assert a['image_phase']!=b['image_phase']
    assert a['camera_offset']!=b['camera_offset']

def test_image_strips_and_graphics_move_independently():
    a=V.kinetic_state_v33(1,.02)
    b=V.kinetic_state_v33(1,.27)
    assert a['layer_offset']!=b['layer_offset']
    assert a['ink_offset']!=b['ink_offset']
    assert a['camera_offset']!=b['camera_offset']

def test_actual_photographic_motion_not_palette_swap():
    # vertical line gradients make spatial motion observable as pixel positions
    w,h=V.base.W,V.base.H
    frame=np.zeros((h,w,3),np.uint8)
    yy,xx=np.indices((V.base.BOTTOM-V.base.START,w))
    frame[V.base.START:V.base.BOTTOM,:,0]=(xx//4)%256
    frame[V.base.START:V.base.BOTTOM,:,1]=(yy//5)%256
    shot=V.SCENES[0]
    a=V.kinetic_motion_v33(frame.copy(),shot,.01,0,'graphic')
    b=V.kinetic_motion_v33(frame.copy(),shot,.40,0,'graphic')
    pixels=np.any(a[V.base.START:V.base.BOTTOM]!=b[V.base.START:V.base.BOTTOM],axis=2)
    assert pixels.mean()>.02
    assert not np.array_equal(a,b)

def test_input_evidence_pixels_not_mutated_in_place():
    a=np.full((V.base.H,V.base.W,3),91,np.uint8)
    before=a.copy()
    out=V.kinetic_motion_v33(a.copy(),V.SCENES[1],.12,1,'cinema')
    assert np.array_equal(a,before)
    assert out.shape==a.shape

def test_accent_marks_not_entire_movie_changed_to_still_frame():
    a=np.full((V.base.H,V.base.W,3),78,np.uint8)
    out=V.kinetic_motion_v33(a.copy(),V.SCENES[4],.54,4,'graphic')
    assert np.array_equal(out[V.base.START+400:V.base.BOTTOM-100,300:730],
                          a[V.base.START+400:V.base.BOTTOM-100,300:730])

def test_fade_releases_source_footage():
    s=V.kinetic_state_v33(4,.40)
    assert s['occlusion']==0 and s['layer_offset']==0

def test_kinetic_release_is_not_continuous_strobe():
    s=V.kinetic_state_v33(7,1.4)
    assert s['occlusion']==0

def test_plan_stays_exact_original_history():
    r=V.inspect_plan()
    assert len(V.SCENES)==8
    assert r['distinct_real_still_sources']==4
    assert '1941' in V.SCENES[0].credit
    assert '1969' in V.SCENES[1].credit
    assert all('FRANÇA' in x.credit for x in V.SCENES[4:])

def test_no_claim_of_voice_or_artistic_certification():
    r=V.inspect_motion_language_v33()
    assert r['voice_embedded'] is False
    assert r['aesthetic_quality_certified'] is False

def test_reject_unsupported_motion_scene():
    with pytest.raises(ValueError,match='motion scene absent'):
        V.kinetic_state_v33(15,.1)

def test_reject_negative_edit_time():
    with pytest.raises(ValueError,match='negative'):
        V.kinetic_state_v33(0,-1)

def test_title_ink_moves_on_twos_independent_of_image():
    overlay=np.zeros((V.base.H,V.base.W,4),np.uint8)
    overlay[220:300,100:250]=(250,210,88,255)
    a=V.animated_title_v33(overlay,.067,'impact')
    b=V.animated_title_v33(overlay,.090,'impact')
    assert np.array_equal(a,b)  # same 15fps graphic exposure
    c=V.animated_title_v33(overlay,.275,'impact')
    assert not np.array_equal(a,c)
    assert np.all(overlay[220:300,100:250] == np.array([250,210,88,255],dtype=np.uint8))
    assert not np.any(a[1810:1910])  # stable provenance zone untouched

def test_documentary_credit_remains_locked_when_headline_moves():
    overlay=np.zeros((V.base.H,V.base.W,4),np.uint8)
    overlay[1830:1880,30:250]=(255,188,75,255)
    out=V.animated_title_v33(overlay,.035,'impact')
    assert np.array_equal(out[1810:1900],overlay[1810:1900])
