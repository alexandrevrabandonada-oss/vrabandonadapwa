"""V0.14 offline regression: no audio duration mismatch or false artistic certification."""
import pytest
from studio.sound_edit_v14 import compile_edl
from studio.film_quality_v14 import inspect_edl

def scenes():
    return [{'id':i,'duration':d,'motion':'tilt_punch'} for i,d in zip('ABCDE',(2.,2.2,2.8,1.6,3.))]

def lab():
    return {'duration_sec':20.9604,'candidate_pauses':[
      {'second':1.58,'confidence':.4},{'second':5.02,'confidence':1.},
      {'second':8.02,'confidence':.72},{'second':11.18,'confidence':1.},
      {'second':16.24,'confidence':1.}]}

def test_frame_accurate_global_pause_matching():
    p=compile_edl(lab(),scenes(),fps=24)
    assert p['cuts_on_pauses']>=3
    assert p['shots'][0]['first_frame']==0
    assert p['shots'][-1]['last_frame_exclusive']==round(lab()['duration_sec']*24)
    assert all(a['last_frame_exclusive']==b['first_frame'] for a,b in zip(p['shots'],p['shots'][1:]))
    assert abs(p['duration_difference_sec'])<=.5/24+.00001
    assert not p['publication_allowed']

def test_missing_pauses_are_not_mislabeled_as_synced():
    p=compile_edl({'duration_sec':8.,'candidate_pauses':[]},scenes())
    assert p['cuts_on_pauses']==0
    assert all('NOT_AUDIO_SYNC' in s['source'] for s in p['shots'][:-1])

def test_short_or_unsafe_timelines_rejected():
    with pytest.raises(ValueError):compile_edl({'duration_sec':1.,'candidate_pauses':[]},scenes())
    with pytest.raises(ValueError):compile_edl(lab(),scenes(),fps=13)

def test_visual_qa_catches_long_static_shots():
    p=compile_edl(lab(),scenes())
    r=inspect_edl(p,scenes())
    assert any(a['issue']=='LONG_NON_FILMED_SCENE' for a in r['warnings'])
    assert r['aesthetic_quality_certified'] is False
