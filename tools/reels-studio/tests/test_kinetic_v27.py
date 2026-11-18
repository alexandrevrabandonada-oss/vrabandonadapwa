"""V27 high-image-occupancy graphic engine regression; lab frames are synthetic."""
import json
from pathlib import Path
import sys
import cv2
import numpy as np
import pytest
sys.path.insert(0,str(Path(__file__).resolve().parent))
try:
    from studio.kinetic_editor_v27 import compose,composition_for,balanced_caption
    from studio.director_v26 import auto_plan,parse_words
    from studio.voice_timed_v24 import cues
except ImportError:
    from kinetic_editor_v27 import compose,composition_for,balanced_caption
    from director_v26 import auto_plan,parse_words
    from reel_voice_sync_v24 import cues
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1] if (Path(__file__).resolve().parents[1]/'examples').is_dir() else Path(__file__).resolve().parent
WORDS=(ROOT/'examples/voice_alexandre_words_v24.json') if (ROOT/'examples/voice_alexandre_words_v24.json').is_file() else Path('/mnt/data/V24_ALEXANDRE_WORDS.json')

def fixtures():
    brief_path=(ROOT/'examples/editorial_brief_v26.json') if (ROOT/'examples/editorial_brief_v26.json').is_file() else ROOT/'editorial_brief_v26.json'
    brief=json.loads(brief_path.read_text())
    words=json.loads(WORDS.read_text())
    return brief,words

def synth():
    y,x=np.mgrid[:480,:640]
    im=np.empty((480,640,3),np.uint8)
    im[:,:,0]=(x%205).astype('uint8');im[:,:,1]=(y%217).astype('uint8');im[:,:,2]=((x//3+y//4)%210).astype('uint8')
    motion=im[:,:,::-1].copy()
    return im,motion

def test_role_dependent_compositions_not_seven_hardcoded_scenes():
    brief,words=fixtures()
    plan=auto_plan(brief,words,'graphic')
    choices=[composition_for(x) for x in plan['shots']]
    assert len(plan['shots'])>=4 and len(set(choices))>=4
    # A separate story may have any number of chapters and different roles.
    for role in ('photo','film','both'):
        variants=[composition_for({'source':role,'index':i}) for i in range(15)]
        assert len(set(variants))==3
        assert variants[0]==variants[3]

def test_real_timestamps_word_caption_no_orphans_and_safe():
    _,word_doc=fixtures()
    words=parse_words(word_doc)
    timed=cues(words)
    palette=(245,223,60)
    for cue in timed:
        times=[cue['start']+0.09, (cue['start']+cue['end'])/2, cue['end']-.03]
        for t in times:
            if t<0:continue
            frame=Image.new('RGBA',(540,960))
            result=balanced_caption(ImageDraw.Draw(frame),timed,t,palette)
            assert result['safe'] and not result['single_word_orphan']
            assert 1<=result['lines']<=2

def test_two_color_directions_and_distinct_role_frames():
    brief,words=fixtures();plan=auto_plan(brief,words,'graphic')
    image,motion=synth()
    timed=cues(parse_words(words))
    variants=[]
    for variant in ('graphic','cinema'):
        for shot in plan['shots']:
            t=(shot['start']+shot['end'])/2
            frame,meta=compose(image,motion,shot,t,.5,shot['index'],len(plan['shots']),timed,variant)
            assert frame.shape==(960,540,3)
            assert meta['safe'] and not meta.get('single_word_orphan',False)
            assert np.std(frame[410:630,30:510])>12, 'image area blank or replaced by a flat block'
            variants.append(frame)
    assert not np.array_equal(variants[0],variants[len(plan['shots'])])
    assert len({int(np.mean(f)) for f in variants[:len(plan['shots'])]})>=3

def test_bad_source_roles_and_bad_profiles_rejected():
    with pytest.raises(ValueError):composition_for({'source':'fabricated_history','index':0})
    img,_=synth()
    with pytest.raises(ValueError):compose(img,img,{},0,.2,0,1,[],'bad_style')

def test_archival_caption_is_not_read_as_voice_in_mp4():
    brief,words=fixtures()
    plan=auto_plan(brief,words,'graphic')
    assert plan['voice_embedded'] is False
    assert plan['publication_approved'] is False

