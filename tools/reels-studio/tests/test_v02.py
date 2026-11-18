"""V0.2 gates: audio preservation, provenance, timed captions, clip checks, direction."""
import copy,json,sys,wave
from pathlib import Path
import numpy as np
import pytest
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.captions import load_timeline,active_caption
from studio.director import shotlist
from studio.factory import validate,render,probe


def fixture(tmp_path,seconds=2.0,caption=False):
    Image.new('RGB',(320,460),(68,90,110)).save(tmp_path/'frame.jpg')
    m={'project_id':'v02-qa-fixture','human_approval':{'approved':False},
       'assets':{'frame':{'file':'frame.jpg','role':'illustration','source':'synthetic QA fixture, not a real photo','capture_date':'generated','rights_status':'cleared'}},
       'narration':{},'scenes':[{'id':'shot-1','type':'photograph','asset':'frame','duration':seconds,
       'context_label':'ILUSTRAÇÃO TÉCNICA DE TESTE','direction':{'subject':'Fixture generated','intent':'Test overlay',
       'camera_motive':'Reveal technical fixture','cut_motive':'Test next frame'},'camera':{'from':[.5,.5,1.],'to':[.54,.52,1.06]}}]}
    if caption:
        with wave.open(str(tmp_path/'voice.wav'),'wb') as w:
            w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000)
            t=np.arange(int(seconds*16000))
            audio=(np.sin(2*np.pi*220*t/16000)*1200).astype('<i2')
            w.writeframes(audio.tobytes())
        m['narration']={'file':'voice.wav','text':'A história começa aqui',
                         'caption_timeline':'captions.json','timings_verified':False,'timings_reviewed':False}
        (tmp_path/'captions.json').write_text(json.dumps({'cues':[
            {'start':0.0,'end':.8,'text':'A história'},
            {'start':.8,'end':1.7,'text':'começa aqui'}]}),encoding='utf-8')
    return m


def test_caption_timing_and_exact_text(tmp_path):
    m=fixture(tmp_path,caption=True)
    cues=load_timeline(tmp_path/'captions.json',m['narration']['text'],2)
    assert active_caption(cues,.4)=='A história'
    assert active_caption(cues,1.2)=='começa aqui'
    assert active_caption(cues,1.9) is None
    with pytest.raises(ValueError,match='differs'):
        load_timeline(tmp_path/'captions.json','Outro roteiro',2)
    with pytest.raises(ValueError,match='beyond audio'):
        load_timeline(tmp_path/'captions.json','A história começa aqui',1.0)


def test_long_voice_prevented_without_render(tmp_path):
    m=fixture(tmp_path,seconds=2,caption=True)
    m['scenes'][0]['duration']=1
    check=validate(m,tmp_path)
    assert not check['ok']
    assert any('longer than video' in v for v in check['errors'])


def test_timings_flag_alone_cannot_authorize_publication(tmp_path):
    m=fixture(tmp_path,caption=True)
    m['narration']['timings_verified']=True
    check=validate(m,tmp_path,'publish')
    assert not check['ok']
    assert any('not reviewed' in x for x in check['errors'])


def test_video_voice_and_dynamic_caption_render(tmp_path):
    m=fixture(tmp_path,caption=True)
    target=tmp_path/'demo.mp4'
    report=render(m,tmp_path,target,'preview',sample_fps=4)
    assert report['narration_attached'] is True
    assert report['audio_sync_verified'] is False
    streams=probe(target)['streams']
    assert any(x['codec_type']=='audio' for x in streams)
    assert any(x['codec_type']=='video' for x in streams)
    import cv2
    cap=cv2.VideoCapture(str(target));frames=[]
    for ix in (1,5,7):
        cap.set(cv2.CAP_PROP_POS_FRAMES,ix);ok,im=cap.read();assert ok
        frames.append(im[600:780,10:530])
    cap.release()
    # Spoken word changes, and caption region changes after narration ends.
    assert np.abs(frames[0].astype(float)-frames[1].astype(float)).mean()>1.
    assert np.abs(frames[1].astype(float)-frames[2].astype(float)).mean()>1.


def test_document_placement_blocks_overlay(tmp_path):
    m=fixture(tmp_path)
    m['scenes'][0]['type']='document'
    m['scenes'][0]['source_label']='TEST DOCUMENT SOURCE'
    m['scenes'][0]['overlay']='FAKE HEADLINE'
    assert any('no title overlay' in x for x in validate(m,tmp_path)['errors'])
    assert shotlist(m)['blocking']>=1


def test_director_flags_cardification_and_preserves_source(tmp_path):
    m=fixture(tmp_path)
    m['scenes']*=3
    for i,s in enumerate(m['scenes']):s['id']=f'shot-{i}'
    initial=copy.deepcopy(m)
    result=shotlist(m)
    assert result['duration_sec']==6
    assert any('repeated camera' in x['reason'] for x in result['issues'])
    assert m==initial


def test_clip_insufficient_duration_fails_preflight(tmp_path):
    import subprocess
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i','color=c=blue:s=320x560:d=0.6',
                    '-c:v','libx264','-pix_fmt','yuv420p',str(tmp_path/'clip.mp4')],check=True)
    m=fixture(tmp_path)
    m['assets']['clip']={'file':'clip.mp4','role':'context','source':'synthetic film QA clip','capture_date':'generated','rights_status':'cleared'}
    m['scenes'][0].update({'type':'clip','asset':'clip','clip_start':0,'duration':2.0})
    result=validate(m,tmp_path)
    assert not result['ok'] and any('exceeds source duration' in x for x in result['errors'])


def test_visual_qa_flags_black_video(tmp_path):
    import subprocess
    from studio.visualqa import sample_visual_health
    vid=tmp_path/'black.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',
                    'color=c=black:s=320x560:d=2.5','-c:v','libx264','-pix_fmt','yuv420p',str(vid)],check=True)
    report=sample_visual_health(vid,[{'id':'black-test','type':'clip','duration':2.5}])
    assert report['available']
    assert any('black frame' in x['reason'] for x in report['flags'])
    assert any('little detectable motion' in x['reason'] for x in report['flags'])


def test_visual_qa_does_not_call_document_stillness_a_failure(tmp_path):
    import subprocess
    from studio.visualqa import sample_visual_health
    vid=tmp_path/'still.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',
                    'color=c=white:s=320x560:d=2.5','-c:v','libx264','-pix_fmt','yuv420p',str(vid)],check=True)
    report=sample_visual_health(vid,[{'id':'document','type':'document','duration':2.5}])
    assert not report['flags']