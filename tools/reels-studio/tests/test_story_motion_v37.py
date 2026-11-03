"""Art direction and audiovisual safety regression for source-led movement v0.37."""
from pathlib import Path
import tempfile
import wave
import numpy as np
import pytest
from studio import story_motion_v37 as v

WORDS=Path(__file__).resolve().parents[1]/'examples'/'voice_alexandre_words_v24.json'

def test_eight_distinct_title_animations():
    labels=[v.typography_timing(i,.1,'kinetic')['grammar'] for i in range(8)]
    assert len(set(labels))==8

def test_titles_tell_the_history_not_describe_software():
    text=' '.join(s[3] for s in v.STAGES)
    assert all(x in text for x in ('1941','1969','2014','FRANÇA','ORIGEM'))
    assert all(x not in text for x in ('COLISÃO','PERSPECTIVAS','CAMADAS','OBLÍQUA'))

def test_newsroom_semantic_source_order():
    assert v.validate_plan()
    assert [s[2] for s in v.STAGES]==['1941','1969','2014','2014','france','france','france','both']
    assert all('FRANÇA' in s[4] for s in v.STAGES[4:])

def test_archive_and_source_safety_year_gate():
    bad=list(v.STAGES)
    a=list(bad[0]);a[4]='REGISTRO DESCONHECIDO';bad[0]=tuple(a)
    with pytest.raises(ValueError):v.validate_plan(tuple(bad))

def test_word_marks_are_original():
    words=v.words_load(WORDS)
    assert len(words)==32
    assert len(v.narrative_events(words))==8
    assert len(v.captions(words,8.6)[1])>10

def test_animation_changes_real_pixels_not_only_grammar_names():
    img=np.zeros((600,900,3),np.uint8)
    for x in range(900):img[:,x]=[(x*7)%255,(x*3)%255,(x*11)%255]
    # Ensure transforms are distinct even with matching artwork/text.
    a=v.typography_layer('MEMÓRIA',v.motion_at(0,.06,'kinetic'),0)
    b=v.typography_layer('MEMÓRIA',v.motion_at(0,.39,'kinetic'),0)
    assert a is not None and b is not None
    assert np.mean(np.abs(a.astype('float32')-b.astype('float32')))>5
    c=v.typography_layer('MEMÓRIA',v.motion_at(1,1.04,'kinetic'),1)
    assert c is not None
    assert np.mean(np.abs(a.astype('float32')-c.astype('float32')))>5

def test_same_palette_ab_motion_different():
    assert v.DARK==(13,20,31) and v.YELLOW==(255,214,74)
    a=v.typography_layer('CSN 2014',v.motion_at(2,2.0,'kinetic'),2)
    b=v.typography_layer('CSN 2014',v.motion_at(2,2.0,'measured'),2)
    assert a is not None and b is not None
    assert np.mean(np.abs(a.astype('float32')-b.astype('float32')))>1

def test_final_evidence_pause_is_longer():
    assert v.typography_timing(7,0,'kinetic')['exposure_sec']>1.5
    assert v.typography_timing(0,0,'kinetic')['exposure_sec']<.8

def test_15fps_editorial_motion_with_30fps_documentary():
    assert v.motion_at(4,6.17,'kinetic')['graphic_pose']==v.motion_at(4,6.19,'kinetic')['graphic_pose']
    assert v.FPS==30

def test_no_audio_no_false_voice_and_real_voice_footer_differs():
    txt='FRANÇA · SIDERURGIA · DAMIEN VICART, 2011'
    p=v.static_top(6,txt,False)
    q=v.static_top(6,txt,True)
    assert not np.array_equal(p,q)

def test_local_voice_rejects_missing_and_invalid_bytes(tmp_path):
    with pytest.raises(ValueError):v.inspect_local_narration(tmp_path/'absent.mp3')
    f=tmp_path/'invalid.mp3';f.write_bytes(b'0'*10000)
    with pytest.raises(Exception):v.inspect_local_narration(f)

def test_local_voice_accepts_matching_duration_not_identity(tmp_path):
    p=tmp_path/'lab_voice.wav'
    with wave.open(str(p),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000)
        w.writeframes((np.zeros(round(14.0713*24000),dtype='<i2')).tobytes())
    x=v.inspect_local_narration(p)
    assert x['identity_verified'] is False
    assert x['generated_here'] is False
    assert len(x['sha256'])==64

def test_audio_not_generated_by_voice_provider():
    import inspect
    src=inspect.getsource(v.render)
    assert 'ElevenLabs' not in src
    assert 'publish(' not in src

def test_no_source_falsification_in_film_credits():
    assert v.FILM_SHA1=='c1129cac8654866856c7bec31196206f16eac6c7'
    assert all('FRANÇA' in s[4] for s in v.STAGES[4:])

def test_title_sizes_fit_even_with_historical_text():
    assert v.text_fits('1969 · POR DENTRO DA CSN',960,76)>=22
    assert v.text_fits('1941 · A USINA NASCE',960,76)>=22