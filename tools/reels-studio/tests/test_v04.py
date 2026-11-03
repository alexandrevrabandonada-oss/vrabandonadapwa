"""v0.4 edit-beat, keyframe, safe-layout and footage smoke tests."""
import sys,wave
from pathlib import Path
import cv2,numpy as np,pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.beatcut import check_beats,inspect_repetition,timeline
from studio.motion import validate_keyframes,evaluate
from studio.layout import fit_font_and_lines
from studio.factory import validate,render,probe,font_path

def fixture(tmp):
    a=np.full((90,160,3),(43,99,144),np.uint8)
    cv2.imwrite(str(tmp/'a.jpg'),a)
    video=tmp/'motion.mp4';writer=cv2.VideoWriter(str(video),cv2.VideoWriter_fourcc(*'mp4v'),12,(160,90))
    for i in range(36):
        f=np.zeros_like(a);cv2.circle(f,(int(15+i*3.5),45),14,(240,140,80),-1);writer.write(f)
    writer.release()
    with wave.open(str(tmp/'voice.wav'),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000)
        t=np.arange(16000*3);w.writeframes((np.sin(t*2*np.pi*190/16000)*1000).astype('int16').tobytes())
    direction={'subject':'Synthetic input','intent':'Motion test','camera_motive':'Camera follows subject','cut_motive':'Story contrast'}
    return {'project_id':'v04-test','assets':{
       'photo':{'file':'a.jpg','source':'Synthetic test','role':'illustration','rights_status':'cleared','capture_date':'generated'},
       'clip':{'file':'motion.mp4','source':'Synthetic test','role':'illustration','rights_status':'cleared','capture_date':'generated'}},
       'human_approval':{'approved':False},'narration':{'file':'voice.wav','text':'Test audio only','timings_verified':False},
       'scenes':[
         {'id':'c1','type':'clip','asset':'clip','clip_start':0,'duration':1.5,'direction':direction,
          'camera_keyframes':[{'at':0,'focus':[.4,.5,1]},{'at':.75,'focus':[.55,.5,1.06]},{'at':1.5,'focus':[.6,.5,1.12]}]},
         {'id':'p2','type':'photograph','asset':'photo','duration':1.7,'direction':direction,
          'camera_keyframes':[{'at':0,'focus':[.5,.5,1]},{'at':1.7,'focus':[.45,.5,1.2]}]}],
       'edit_beats':[{'scene_id':'c1','time_sec':0,'reason':'Start footage','audio_anchor':'Test audio'},
                     {'scene_id':'p2','time_sec':1.5,'reason':'Contrast still image'}]}

def test_authored_keyframes(tmp_path):
    p=fixture(tmp_path);s=p['scenes'][0]
    assert not validate_keyframes(s)
    assert evaluate(s,.75)==[.55,.5,1.06]
    assert evaluate(s,-5)==[.4,.5,1]
    assert evaluate(s,5)==[.6,.5,1.12]

def test_invalid_keyframe_is_blocked(tmp_path):
    p=fixture(tmp_path);p['scenes'][0]['camera_keyframes'][1]['focus'][2]=4.0
    assert any('unsafe camera' in e for e in validate(p,tmp_path)['errors'])

def test_beats_reject_bad_anchors(tmp_path):
    p=fixture(tmp_path)
    assert not check_beats(p)[0]
    p['edit_beats'][1]['time_sec']=2.1
    assert any('scene boundary' in e for e in validate(p,tmp_path)['errors'])
    p=fixture(tmp_path);p['edit_beats'][0]['audio_anchor']='Unspoken words'
    assert any('not found' in e for e in validate(p,tmp_path)['errors'])

def test_safe_typography():
    f,lines=fit_font_and_lines('O QUE AINDA NÃO SABEMOS?',font_path(True),42,24,458,3)
    assert len(lines)>=2 and all(f.getlength(line)<=458 for line in lines)
    with pytest.raises(ValueError):
        fit_font_and_lines('XXXXXXXXXXXXXXXXXXXX',font_path(True),38,30,80,2)

def test_audio_and_moving_footage(tmp_path):
    p=fixture(tmp_path)
    assert validate(p,tmp_path)['ok']
    result=render(p,tmp_path,tmp_path/'demo.mp4','preview',sample_fps=8)
    assert result['narration_attached'] is True
    assert result['audio_sync_verified'] is False
    info=probe(tmp_path/'demo.mp4')
    assert any(s['codec_type']=='audio' for s in info['streams'])
    cap=cv2.VideoCapture(str(tmp_path/'demo.mp4'))
    frames=[]
    for i in [1,7,14]:
        cap.set(cv2.CAP_PROP_POS_FRAMES,i);ok,f=cap.read();assert ok;frames.append(f)
    cap.release()
    diff=lambda a,b:np.mean(np.abs(a.astype(float)-b.astype(float)))
    assert diff(frames[0],frames[1])>1
    assert diff(frames[1],frames[2])>5
    assert not validate(p,tmp_path,'publish')['ok']

def test_portfolio_requires_multiple_topics():
    from studio.benchmark import evaluate_portfolio
    one={'topic':'CSN','creative_score':9.9,'external_reviewer_score':9.8,'technical_pass':True,
         'rights_clear':True,'editorial_approved':True,'voice_synced':True,'mobile_reviewed':True}
    assert not evaluate_portfolio([one])['ready']
    assert not evaluate_portfolio([one,one,one])['ready']

def test_portfolio_requires_human_review_and_audio():
    from studio.benchmark import evaluate_portfolio
    cases=[{'topic':x,'creative_score':10,'external_reviewer_score':9.8,'technical_pass':True,
        'rights_clear':True,'editorial_approved':True,'voice_synced':True,'mobile_reviewed':True}
        for x in ('CSN','Rua 33','Saúde')]
    assert evaluate_portfolio(cases)['ready']
    cases[0]['external_reviewer_score']=8
    assert not evaluate_portfolio(cases)['ready']
    cases[0]['external_reviewer_score']=9.8;cases[1]['voice_synced']=False
    assert not evaluate_portfolio(cases)['ready']

def test_repetition_qa_is_diagnostic_not_artificial_score(tmp_path):
    p=fixture(tmp_path)
    details=inspect_repetition(p)
    assert details['distinct_assets']==2
    assert len(timeline(p))==2
    assert not check_beats(p)[0]

def test_anchor_and_scene_alignment_must_be_exact(tmp_path):
    p=fixture(tmp_path)
    p['edit_beats'][1]['time_sec']=-1
    assert not validate(p,tmp_path)['ok']
