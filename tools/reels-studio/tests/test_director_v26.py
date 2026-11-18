"""v0.26 tests: generic chapter count, word gaps, optical-window diversity and mobile safety."""
import json
from pathlib import Path
import cv2
import numpy as np
import pytest
from studio.director_v26 import auto_plan,parse_words,scan_motion_windows,schedule_source_windows
from studio.render_v26 import fit_title,graphic_overlay,score_music
from studio.voice_timed_v24 import cues
from studio import spider_brutalist_v25 as core
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[1]
WORDS=ROOT/'examples/voice_alexandre_words_v24.json'
BRIEF=ROOT/'examples/editorial_brief_v26.json'

def data():
    return json.loads(BRIEF.read_text(encoding='utf8')),json.loads(WORDS.read_text(encoding='utf8'))

def test_six_generated_shots_replace_seven_fixed_templates():
    brief,words=data();p=auto_plan(brief,words,'graphic')
    assert p['shot_count']==6 and p['chapters']==4 and p['word_count']==32
    assert p['shots'][0]['start']==0. and p['shots'][-1]['end']==14.5
    assert p['source_role_sequence']==['photo']*3+['film']+['both']*2
    assert all(abs(a['end']-b['start'])<.002 for a,b in zip(p['shots'],p['shots'][1:]))
    assert not p['voice_embedded'] and not p['publication_approved']

def test_cut_points_lie_between_real_spoken_words():
    b,w=data();p=auto_plan(b,w)
    for shot in p['shots'][1:]:
        t=shot['start']
        assert not any(x['start']+.04<t<x['end']-.04 for x in parse_words(w))

def test_same_brief_separate_cinema_and_print_directors():
    b,w=data();g=auto_plan(b,w,'graphic');c=auto_plan(b,w,'cinema')
    assert g['shot_count']==c['shot_count']
    assert [s['layout'] for s in g['shots']] != [s['layout'] for s in c['shots']]
    assert [(s['source'],s['start'],s['end']) for s in g['shots']] == [(s['source'],s['start'],s['end']) for s in c['shots']]

def test_different_brief_produces_different_scene_count():
    words=['Cidade','tem','uma','memória.','Outro','arquivo','mostra','máquinas.']
    doc={'transcript':' '.join(words),'words':[[s,i*.55,i*.55+.4] for i,s in enumerate(words)],'duration_sec':4.25}
    b={'publication_approved':False,'end_padding_sec':.35,'chapters':[
       {'id':'cidade','spoken_text':'Cidade tem uma memória.','source':'photo','headline':'A CIDADE','source_credit':'FOTO DEMONSTRATIVA'},
       {'id':'arquivo','spoken_text':'Outro arquivo mostra máquinas.','source':'film','headline':'MÁQUINAS EM AÇÃO','source_credit':'DOCUMENTO DEMONSTRATIVO'}]}
    p=auto_plan(b,doc)
    assert p['shot_count']!=7 and p['chapters']==2 and p['shots'][-1]['source']=='film'
    assert p['shots'][-1]['end']==4.6

@pytest.mark.parametrize('mutation', ['bad_transcript','negative_start','bad_chapter','missing_credit','fake_source','published'])
def test_data_fidelity_gates(mutation):
    b,w=data()
    if mutation=='bad_transcript':w['transcript']='fake words'
    if mutation=='negative_start':w['words'][0][1]=-.5
    if mutation=='bad_chapter':b['chapters'][0]['spoken_text']='fake words'
    if mutation=='missing_credit':b['chapters'][2]['source_credit']=''
    if mutation=='fake_source':b['chapters'][2]['source']='AI generated fact'
    if mutation=='published':b['publication_approved']=True
    with pytest.raises(ValueError):auto_plan(b,w)

def test_title_fit_typography_and_word_highlight_with_provenance():
    b,w=data();p=auto_plan(b,w)
    d=ImageDraw.Draw(Image.new('RGB',(540,960)))
    rows,size=fit_title(d,'A ORIGEM IMPORTA',largest=99)
    assert len(rows)<=2 and size>=44
    timed=cues(parse_words(w))
    bg=np.full((960,540,3),(45,45,45),np.uint8)
    for k in (0,3,5):
        s=p['shots'][k];t=(s['start']+s['end'])/2
        frame,caption=graphic_overlay(bg,s,t,.5,k,len(p['shots']),timed,'graphic')
        assert caption['safe'] and frame.shape==(960,540,3) and frame.std()>25
    assert p['shots'][3]['credit'].startswith('FRANÇA')

def test_motion_windows_separated_in_source_chronology():
    b,w=data();p=auto_plan(b,w)
    window={'windows':[
      {'start':7.8,'end':10.6,'median_frame_change':40.5,'median_brightness':100.},
      {'start':2.6,'end':5.4,'median_frame_change':23.2,'median_brightness':100.},
      {'start':10.4,'end':13.2,'median_frame_change':22.7,'median_brightness':100.},
      {'start':20.8,'end':23.6,'median_frame_change':22.5,'median_brightness':100.}]}
    q=schedule_source_windows(p,window)
    times=[s['source_window_start'] for s in p['shots'] if s['source_window_start'] is not None]
    assert times==[2.6,10.4,20.8]
    assert not q['verified_human_action'] and not q['publication_approved']

def test_optical_detection_on_synthetic_nonnews_video(tmp_path):
    path=tmp_path/'synthetic.mp4'
    writer=cv2.VideoWriter(str(path),cv2.VideoWriter_fourcc(*'mp4v'),24,(320,180))
    for i in range(24*9):
        a=np.zeros((180,320,3),np.uint8)
        if i>=24*4:cv2.circle(a,(i%270+20,90),30,(0,150,255),-1)
        writer.write(a)
    writer.release()
    q=scan_motion_windows(path)
    assert len(q['windows'])>=2 and not q['screened_for_actual_event']
    assert max(s['median_frame_change'] for s in q['windows'])>0

def test_dynamic_music_contains_beats(tmp_path):
    import wave
    f=tmp_path/'pulse.wav'
    score_music(f,[0,1.2,2.6],4.1,sr=8000)
    with wave.open(str(f)) as w:
        assert w.getnframes()==32800 and w.getframerate()==8000
