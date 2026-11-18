"""v39 regressions: source authenticity, motion's editorial role and speaker honesty."""
import json
from pathlib import Path
import pytest
from studio import adaptive_director_v39 as v
from studio import story_motion_v37 as baseline

BASE=Path(__file__).resolve().parents[1]
WORDS=BASE/'examples'/'voice_alexandre_words_v24.json'


def test_8_scenes_2_intent_movement_profiles():
    plan=v.editorial_plan()
    assert len(plan)==8
    assert sum(x['motion_profile']=='kinetic' for x in plan)==4
    assert sum(x['motion_profile']=='measured' for x in plan)==4
    assert len(set(x['motion_grammar'] for x in plan))==8


def test_no_irresponsible_movement_on_archive_and_disclosure():
    p=v.editorial_plan()
    assert all(p[i]['motion_profile']=='measured' for i in (0,1,5,7))
    assert p[4]['motion_profile']=='kinetic'
    assert p[5]['narrative_intent']=='foreign-origin disclosure'


def test_documentary_provenance_is_explicit():
    p=v.editorial_plan()
    assert p[0]['source']=='1941' and p[1]['source']=='1969'
    assert all('FRANÇA' in p[i]['credit'] for i in range(4,8))
    assert all('2014' in p[i]['credit'] for i in (2,3))


def test_regression_fails_on_mislabelled_foreign_footage():
    stages=list(baseline.STAGES)
    wrong=list(stages[4]);wrong[4]='CSN, VOLTA REDONDA, 2011';stages[4]=tuple(wrong)
    with pytest.raises(ValueError):v.editorial_plan(tuple(stages))


def test_word_timing_never_guessed():
    words=baseline.words_load(WORDS)
    drift=v.verify_word_anchor(words)
    assert len(drift)==7 and max(drift)<.11
    with pytest.raises(ValueError):v.verify_word_anchor(words[:-1])


def test_rejects_altered_real_sources(tmp_path):
    for n in ('photo1.jpg','photo2.jpg','photo3.jpg','film.webm'):
        (tmp_path/n).write_bytes(b'fake historical file')
    with pytest.raises(ValueError,match='Unverified'):
        v.source_check(tmp_path/'photo1.jpg',tmp_path/'photo2.jpg',tmp_path/'photo3.jpg',tmp_path/'film.webm')


def test_expected_source_integrity_constants():
    from studio.adaptive_director_v39 import source_check
    assert 'c1129cac'==baseline.FILM_SHA1[:8]


def test_motion_signature_changes_each_shot():
    signatures=[]
    for i,(_,mode) in enumerate(v.PROFILES):
        sig=baseline.motion_signature(i,.35,mode)
        signatures.append(sig)
    assert len(set(signatures))==8


def test_no_speech_or_publishing_generation_present():
    assert not hasattr(v,'generate_speech') and not hasattr(v,'publish')
    assert not hasattr(v,'upload_to_instagram')


def test_real_voice_requires_original_audio_bytes(tmp_path):
    with pytest.raises(ValueError):baseline.inspect_local_narration(tmp_path/'not-here.mp3')


def test_editorial_slow_down_is_not_a_color_change():
    assert baseline.motion_curve(.25,1,'kinetic')!=baseline.motion_curve(.25,1,'measured')
    assert set(q for _,q in v.PROFILES)=={'measured','kinetic'}


def test_no_1962_event_claim_in_footage():
    import inspect
    src=inspect.getsource(v.render)
    assert 'not_a_1962_event_reconstruction=True' in src
