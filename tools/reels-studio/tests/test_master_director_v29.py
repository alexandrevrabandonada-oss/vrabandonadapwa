"""Fast v29 contract tests; real 1080p MP4 integration runs in GH Actions."""
import json
from pathlib import Path
import cv2
import numpy as np
import pytest
from studio import master_director_v29 as v

def test_native_master_not_upscaled_legacy_profile():
    assert (v.W,v.H,v.FPS,v.DUR)==(1080,1920,30,14.5)
    assert v.check_plan()['shots']==7
    assert v.check_plan()['film_windows']==4
    assert abs(sum(s.end-s.start for s in v.SHOTS)-14.5)<1e-8

def test_no_french_film_misidentified_as_csn():
    assert all('FRANÇA' in s.credit for s in v.SHOTS if s.role=='film')
    assert all('2014' in s.credit for s in v.SHOTS if s.role=='photo')
    assert all('2011' in s.credit and '2014' in s.credit for s in v.SHOTS if s.role=='both')
    bad=list(v.SHOTS)
    from dataclasses import replace
    bad[3]=replace(bad[3],credit='CSN · VOLTA REDONDA')
    with pytest.raises(ValueError,match='misidentify'):
        v.check_plan(bad)

def test_32_verified_words_are_monotonic():
    words=v.read_words(Path(__file__).resolve().parents[1]/'examples'/'voice_alexandre_words_v24.json')
    assert len(words)==32
    assert words[0]['text']=='Volta'
    assert words[-1]['text']=='origem.'
    assert v.caption_draw(words,8.6,'graphic') is not None
    assert v.caption_draw(words,14.49,'graphic') is None

def test_original_source_apertures_and_native_text_layer():
    still=np.full((960,1440,3),(32,69,98),np.uint8)
    film=np.full((1080,1920,3),(49,63,91),np.uint8)
    for variant in ('graphic','cinema'):
        frame=v.frame_image(still,film,v.SHOTS[3],.5,variant)
        overlay=v.static_overlay(v.SHOTS[3],variant,3,'quiet')
        assert frame.shape==(1920,1080,3)
        assert overlay.shape==(1920,1080,4)
        assert np.array_equal(frame[900,540], np.array([49,63,91]))
        assert np.any(overlay[:,:,3]>0)
        assert not np.array_equal(v.static_overlay(v.SHOTS[3],variant,3,'impact'),overlay)

def test_source_role_affects_image_not_graphics_only():
    still=np.full((960,1440,3),(11,19,230),np.uint8)
    film=np.full((1080,1920,3),(225,34,18),np.uint8)
    a=v.frame_image(still,film,v.SHOTS[0],.55,'graphic')
    b=v.frame_image(still,film,v.SHOTS[3],.55,'graphic')
    assert not np.array_equal(a[1000,500],b[1000,500])

def test_captions_are_real_speech_groups_and_do_not_fabricate_timestamps():
    words=v.read_words(Path(__file__).resolve().parents[1]/'examples'/'voice_alexandre_words_v24.json')
    i=v.caption_draw(words,6.9,'graphic')
    assert i[1] is not None and words[i[1]]['text']=='siderurgia'
    reg=v.caption_region(json.dumps(words,ensure_ascii=False),*i,'graphic')
    assert reg.shape==(318,1080,4)
    assert reg[:,:,3].max()>0

def test_missing_voice_never_declared_embedded():
    overlay=v.static_overlay(v.SHOTS[0],'graphic',0,'quiet',voice_embedded=False)
    voiced=v.static_overlay(v.SHOTS[0],'graphic',0,'quiet',voice_embedded=True)
    assert not np.array_equal(overlay,voiced)
    with pytest.raises(Exception):v.inspect_audio(Path('/path/not/existing.mp3'))

def test_invalid_retime_or_missing_video_rejected():
    from dataclasses import replace
    wrong=list(v.SHOTS);wrong[1]=replace(wrong[1],start=1.0)
    with pytest.raises(ValueError):v.check_plan(wrong)
    wrong=list(v.SHOTS);wrong[3]=replace(wrong[3],film_at=None)
    with pytest.raises(ValueError):v.check_plan(wrong)
