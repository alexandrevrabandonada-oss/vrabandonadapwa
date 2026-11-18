"""V0.6: transitions, existing-voice handoff, immutable journalistic content."""
import sys,wave,hashlib
from pathlib import Path
import numpy as np,pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.visual_grammar import composite,validate_transition
from studio.voice_delivery import import_existing
from studio.variants_v06 import produce
from studio.factory import render,validate

def test_material_reveals_are_deterministic_and_bounded():
    a=np.full((100,80,3),15,np.uint8);b=np.full((100,80,3),185,np.uint8)
    for name in ('print_registration','slag_reveal','press_gate'):
        mid=composite(a,b,.55,name)
        assert np.array_equal(mid,composite(a,b,.55,name))
        assert (mid==15).any() and (mid==185).any()
        assert np.array_equal(composite(a,b,1,name),b)
        assert np.array_equal(composite(a,b,0,name),a)
    with pytest.raises(ValueError):composite(a,b,.5,'spin')

def test_transition_limit_rejects_overlong_effects():
    sc={'duration':1.2,'transition_in':{'style':'print_registration','duration':.24}}
    assert validate_transition(sc)==[]
    sc['transition_in']['duration']=1.5
    assert validate_transition(sc)

def test_voice_ingest_never_generates_or_overwrites(tmp_path):
    src=tmp_path/'test.wav';t=np.arange(16000*2)/16000
    sample=np.int16(np.sin(t*2*np.pi*190)*7000)
    with wave.open(str(src),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000);w.writeframes(sample.tobytes())
    dest=tmp_path/'stored'/'original.wav'
    report=import_existing(src,dest,2)
    assert dest.read_bytes()==src.read_bytes()
    assert report['sha256']==hashlib.sha256(src.read_bytes()).hexdigest()
    assert not report['timings_verified'] and not report['consent_to_publication']
    with pytest.raises(FileExistsError):import_existing(src,dest,2)
    with pytest.raises(ValueError):import_existing(src,tmp_path/'wrong.wav',21)

def test_ab_versions_preserve_editorial_sources():
    p={'edition':'test','assets':{'news':{'file':'issue.jpg','source':'archive','rights_status':'pending'}},
       'narration':{'text':'Approved words'},'scenes':[{'id':'s1','asset':'news','type':'document','duration':1.0,'source_label':'A Noite'},
       {'id':'s2','asset':'news','type':'document','duration':1.0,'source_label':'A Noite'}]}
    a=produce(p,'restrained');b=produce(p,'expressive')
    assert a['assets']==b['assets']==p['assets']
    assert a['narration']==b['narration']==p['narration']
    assert a['scenes'][1]['transition_in']['style']=='hard_cut'
    assert b['scenes'][1]['transition_in']['style']=='print_registration'

def test_real_renderer_with_transition_fixture(tmp_path):
    import cv2
    for name,color in [('a',(22,40,60)),('b',(100,150,230))]:
        img=np.zeros((80,145,3),np.uint8);img[:]=color;cv2.imwrite(str(tmp_path/(name+'.jpg')),img)
    assets={k:{'file':k+'.jpg','source':'Synthetic test','role':'illustration','capture_date':'generated','rights_status':'cleared'} for k in ('a','b')}
    scenes=[{'id':'a','type':'photograph','asset':'a','duration':.6},
            {'id':'b','type':'photograph','asset':'b','duration':.6,'transition_in':{'style':'print_registration','duration':.20}}]
    p={'project_id':'transition-smoke','assets':assets,'scenes':scenes,'narration':{},'human_approval':{'approved':False}}
    assert validate(p,tmp_path)['ok']
    r=render(p,tmp_path,tmp_path/'smoke.mp4',sample_fps=8)
    assert r['frames']==10
    assert not validate(p,tmp_path,'publish')['ok']
