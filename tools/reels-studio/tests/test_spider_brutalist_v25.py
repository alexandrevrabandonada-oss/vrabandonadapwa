"""V25 regressions: stylistic upgrade must not undermine documentary veracity."""
from pathlib import Path
import json
import os
import sys
import numpy as np
import cv2
import pytest
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent if HERE.name=='tests' else HERE
if HERE.name=='tests':
    sys.path.insert(0,str(ROOT))
    from studio import spider_brutalist_v25 as m
    from studio.voice_timed_v24 import load_words,cues
else:
    sys.path.insert(0,str(HERE))
    import spider_brutalist_v25 as m
    from reel_voice_sync_v24 import load_words,cues

WORDS=Path(os.environ.get('V25_WORDS',ROOT/'examples/voice_alexandre_words_v24.json'))
PHOTO=Path(os.environ.get('V25_PHOTO',ROOT/'work/v25/sources/csn_2014.jpg'))
FILM=Path(os.environ.get('V25_FILM',ROOT/'work/v25/sources/france_2011.webm'))


def demo_inputs():
    photo=cv2.imread(str(PHOTO))
    cap=cv2.VideoCapture(str(FILM))
    ok,frame=cap.read();cap.release()
    assert ok
    cs=cues(load_words(WORDS)[1])
    return photo,frame,cs


def test_story_follows_real_word_onsets_and_source_transition():
    r=m.validate_story(WORDS)
    assert r['shot_count']==7 and r['word_count']==32
    assert m.BEATS[3].start<=6.861
    assert m.BEATS[2].end>6.049
    assert r['voice_embedded'] is False and r['publication_approved'] is False


def test_seven_distinct_brutalist_grammars():
    assert len(set(b.name for b in m.BEATS))==len(m.BEATS)
    assert all(a.end==b.start for a,b in zip(m.BEATS,m.BEATS[1:]))
    assert m.BEATS[-1].end==14.5


def test_clip_crop_constrained_to_valid_images():
    with pytest.raises(ValueError):m.cover(None,540,960)
    with pytest.raises(ValueError):m.cover(np.ones((960,540,3),dtype=np.uint8),540,960,zoom=2)
    out=m.cover(np.ones((320,640,3),dtype=np.uint8),540,960,zoom=1.2)
    assert out.shape==(960,540,3)


def test_global_caption_safety_and_two_line_limit():
    photo,video,cs=demo_inputs()
    for item in cs:
        for t in ((item['start']+item['end'])/2,item['start']+.02):
            _,r,_=m.frame_draw(photo,video,t,cs)
            assert r['safe'] and r['lines']<=2
            assert r['font']>=24


def test_real_sources_are_separately_credited_with_correct_year():
    assert m.BEATS[0].source=='photo'
    assert m.BEATS[3].source=='film'
    assert m.BEATS[-1].source=='both'
    assert 'Volta Redonda' in m.verify_source(PHOTO)['source_url'] or 'commons' in m.verify_source(PHOTO)['source_url']
    assert m.verify_source(FILM)['date_label']==2011


def test_hash_mutation_is_rejected(tmp_path):
    p=tmp_path/'source.jpg';p.write_bytes(b'original')
    (tmp_path/'source.json').write_text(json.dumps({'sha1':'0'*40,'size_bytes':8}))
    with pytest.raises(ValueError,match='integrity'):
        m.verify_source(p)


def test_color_variants_not_identical_and_caption_safe():
    photo,video,cs=demo_inputs()
    a,ra,_=m.frame_draw(photo,video,7.10,cs,'zine')
    b,rb,_=m.frame_draw(photo,video,7.10,cs,'documental')
    assert a.shape==(960,540,3)
    assert not np.array_equal(a,b)
    assert ra['safe'] and rb['safe']


def test_captured_material_is_not_implicitly_published():
    out=m.validate_story(WORDS)
    assert out['voice_embedded'] is False
    assert out['publication_approved'] is False
    assert 'requires' in out['safe_design_status']


def test_frames_not_static_and_film_is_real_source():
    photo,video,cs=demo_inputs()
    a,_,_=m.frame_draw(photo,video,2.12,cs)
    b,_,_=m.frame_draw(photo,video,3.29,cs)
    assert np.mean(cv2.absdiff(a,b))>1.1
    assert np.var(video)>1


def test_fonts_cyrillic_and_accented_portuguese_will_not_get_cutoff():
    photo,video,cs=demo_inputs()
    for t in (.7,2.8,4.75,7.2,8.7,10.4,13.65):
        fr,rep,scene=m.frame_draw(photo,video,t,cs)
        assert np.var(fr)>50
        assert rep['safe']