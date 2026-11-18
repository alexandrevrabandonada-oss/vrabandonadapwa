import json
from pathlib import Path
from studio.motion_contract_v32 import inspect

FIXTURE=Path(__file__).resolve().parents[1]/'examples/motion_identity_v32.json'
def load():return json.loads(FIXTURE.read_text(encoding='utf8'))
def test_kinetic_profile_valid():
    x=inspect(load())
    assert x['ok'] and x['distinct_grammars']==4 and x['independent_cues']==4
def test_palette_only_cannot_pass():
    x=load()
    for cue in x['cues']:cue['layers']=1
    assert not inspect(x)['ok']
def test_no_independent_trajectories_cannot_pass():
    x=load();x['cues'][0]['trajectories']=['x','x']
    assert not inspect(x)['ok']
def test_graphic_exposures_do_not_reduce_video_cadence():
    x=load();x['documentary_fps']=15
    assert not inspect(x)['ok']
def test_original_facts_protected():
    x=load();x['animation_only_editorial_layers']=False
    assert not inspect(x)['ok']
def test_flash_rate_fail():
    x=load();x['cues'][0]['flash_rate_hz']=7
    assert not inspect(x)['ok']
def test_narrative_motivation_required():
    x=load();x['cues'][0]['narrative_reason']=''
    assert not inspect(x)['ok']
def test_grading_not_automated():
    x=inspect(load());assert x['artistic_score'] is None and x['technical_capability_score'] is None
