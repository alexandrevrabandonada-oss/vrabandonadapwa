"""V23 motion-directed documentary factory regression tests, offline fixtures only."""
from __future__ import annotations
import json
import sys
import wave
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from studio import auto_director_v23 as d


def fixture_frame(w=640,h=360):
    x=np.linspace(0,255,w,dtype=np.uint8)[None,:]
    y=np.linspace(0,180,h,dtype=np.uint8)[:,None]
    return np.stack([np.broadcast_to(x,(h,w)),np.broadcast_to(y,(h,w)),
                     np.full((h,w),110,dtype=np.uint8)],axis=2)


def test_beat_driven_storyboard_is_complete_and_has_real_moving_footage():
    a=d.validate_story()
    assert a['ok'],a
    assert a['scene_count']==7
    assert a['visual_grammars']==7
    assert a['real_moving_footage_sec']==8.5
    assert a['hook_duration_sec']<=1.5
    assert a['edit_points_on_beat']
    assert not a['automated_artistic_10_10_certification']


def test_scene_pacing_rejects_slow_hook_and_missing_video():
    slow=(d.Scene(0,2.5,'impact','A','B','photo'),)+d.SCENES[1:]
    assert not d.validate_story(slow)['ok']
    still=tuple(d.Scene(s.start,s.end,s.layout,s.title,s.subtitle,'photo')
               for s in d.SCENES)
    assert any('genuinely moving' in e for e in d.validate_story(still)['errors'])


def test_seven_contrasting_layouts_and_two_looks_are_real_frames():
    base=fixture_frame()
    layers=[]
    for j,scene in enumerate(d.SCENES):
        f=d.layout_frame(base,base,scene.start+.45*(scene.end-scene.start),j,'expressive',2011)
        assert f.shape==(960,540,3)
        assert f.dtype==np.uint8
        assert 20<float(f.mean())<230
        layers.append(f)
    assert len({hash(f.tobytes()) for f in layers})==7
    a=d.layout_frame(base,base,.45,0,'expressive',2011)
    b=d.layout_frame(base,base,.45,0,'restrained',2011)
    assert np.mean(np.abs(a.astype('int16')-b.astype('int16')))>1


def test_french_clip_is_not_labeled_as_brazilian_road():
    from PIL import Image,ImageDraw
    for year in (2011,2017):
        canvas=Image.new('RGBA',(540,960))
        # The source-credit overlay is a first-class function, not video OCR.
        d.source_credit(ImageDraw.Draw(canvas),d.SCENES[2],year)
        assert np.asarray(canvas)[:,:,3].sum()>0
    src=Path(d.__file__).read_text(encoding='utf8')
    assert 'FRANÇA 2011' in src
    assert '2017' in src


def test_mixed_4_3_and_16_9_sources_crop_without_black_borders():
    for shape in ((100,200),(200,100),(360,640)):
        x=np.full((*shape,3),128,np.uint8)
        y=d.crop_cover(x,540,960,.5,.5,1.04)
        assert y.shape==(960,540,3)
        assert np.all(y==128)


def test_voice_longer_than_picture_extends_only_last_scene(tmp_path):
    p=tmp_path/'original_audio.wav'
    sr=8000
    with wave.open(str(p),'wb') as f:
        f.setframerate(sr);f.setsampwidth(2);f.setnchannels(1)
        f.writeframes(np.zeros(round(14.071*sr),dtype='<i2').tobytes())
    length,scenes,voice_len=d.compute_voice_timeline(p)
    assert abs(voice_len-14.071)<.01
    assert length==14.5
    assert scenes[:-1]==d.SCENES[:-1]
    assert scenes[-1].end==14.5
    assert d.validate_story(scenes,length)['ok']


def test_very_long_voice_is_not_autotruncated(tmp_path):
    p=tmp_path/'too_long.wav'
    with wave.open(str(p),'wb') as f:
        f.setframerate(8000);f.setsampwidth(2);f.setnchannels(1)
        f.writeframes(np.zeros(18*8000,dtype='<i2').tobytes())
    with pytest.raises(ValueError,match='cannot fit'):
        d.compute_voice_timeline(p)


def test_sha1_manifest_tamper_fails(tmp_path):
    p=tmp_path/'source.webm'
    p.write_bytes(b'unit-test-only')
    meta={'sha1':'0'*40,'size_bytes':len(p.read_bytes())}
    p.with_suffix('.json').write_text(json.dumps(meta))
    with pytest.raises(ValueError,match='match original'):
        d.verify_bytes(p,p.with_suffix('.json'))


def test_original_beat_soundtrack_fits_picture(tmp_path):
    p=tmp_path/'original_music.wav'
    d.make_soundtrack(p,duration=3.,sample_rate=8000)
    with wave.open(str(p)) as r:
        assert r.getnframes()==24000
        assert r.getframerate()==8000
        arr=np.frombuffer(r.readframes(r.getnframes()),dtype='<i2')
        assert arr.max()>200
        assert np.max(np.abs(arr))<32768