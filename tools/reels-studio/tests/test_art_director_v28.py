"""Proof of v28 autonomous design grammar; synthetic imagery only, no publication."""
import json,cv2,numpy as np,pytest
from pathlib import Path
from PIL import Image
from studio.art_director_v28 import composition_for,image_stage,overlay,compose,COMPOSITIONS
from studio.kinetic_editor_v27 import _draw_overlay as old_overlay
from studio.director_v26 import auto_plan,parse_words
from studio.voice_timed_v24 import cues

ROOT=Path(__file__).resolve().parents[1]


def plan():
    return auto_plan(json.loads((ROOT/'examples/editorial_brief_v26.json').read_text()),
                     json.loads((ROOT/'examples/voice_alexandre_words_v24.json').read_text()),'graphic')


def lab():
    h,w=480,640
    yy,xx=np.indices((h,w))
    a=np.uint8(np.dstack([xx%249,yy%213,(xx//2+yy//3)%255]))
    b=np.uint8(np.dstack([(yy+xx)%249,(xx*2)%247,(yy*3)%251]))
    return a,b


def cues_real():
    return cues(parse_words(json.loads((ROOT/'examples/voice_alexandre_words_v24.json').read_text())))


def test_nine_grammars_independent_of_script_length():
    assert len(COMPOSITIONS)==3 and sum(map(len,COMPOSITIONS.values()))==9
    for role in COMPOSITIONS:
        results={composition_for({'source':role,'index':n,'role_ordinal':n}) for n in range(18)}
        assert len(results)==3
        assert composition_for({'source':role,'index':0}) in results


def test_real_script_has_several_distinct_stage_types():
    p=plan()
    types=[composition_for(s) for s in p['shots']]
    assert len(p['shots'])>=5 and len(set(types))>=5
    assert p['shots'][0]['source']=='photo'
    assert 'film' in {s['source'] for s in p['shots']}


def test_frame_shape_safe_caption_and_provenance_credit():
    a,b=lab();words=cues_real();p=plan()
    for style in ('graphic','cinema'):
        for s in p['shots']:
            t=(s['start']+s['end'])/2
            frame,qa=compose(a,b,s,t,.5,s['index'],len(p['shots']),words,style)
            assert frame.shape==(960,540,3) and frame.dtype==np.uint8
            assert qa['safe'] and not qa.get('single_word_orphan',False)
            assert qa['credit_verified_by_renderer'] and not qa['voice_audio_embedded']


def test_headline_does_not_permanently_occlude_documentary_action():
    a,b=lab();shot=plan()['shots'][0];words=cues_real()
    base=image_stage(a,b,shot,.5,'graphic');t=shot['start']+1.0
    modern,_=overlay(base,shot,t,.6,0,6,words,'graphic')
    legacy,_=old_overlay(base,shot,t,.6,0,6,words,'graphic')
    region=np.s_[155:390,:,:]
    cover_modern=np.mean(np.abs(modern[region].astype(float)-base[region])>28)
    cover_legacy=np.mean(np.abs(legacy[region].astype(float)-base[region])>28)
    assert cover_modern<.12 and cover_legacy>.35


def test_entry_headline_moves_off_photo_as_expected():
    a,b=lab();shot=plan()['shots'][0];words=cues_real()
    base=image_stage(a,b,shot,.5,'graphic')
    entering,_=overlay(base,shot,shot['start']+.13,.07,0,6,words,'graphic')
    settled,_=overlay(base,shot,shot['start']+1.0,.55,0,6,words,'graphic')
    assert np.mean(np.abs(entering[155:390].astype(float)-base[155:390])>28)>.10
    assert np.mean(np.abs(settled[155:390].astype(float)-base[155:390])>28)<.12


def test_voice_label_is_truthful_in_both_cases():
    a,b=lab();shot=plan()['shots'][0];words=cues_real()
    base=image_stage(a,b,shot,.5,'graphic')
    silent,m=overlay(base,shot,.7,.5,0,6,words,'graphic',False)
    spoken,n=overlay(base,shot,.7,.5,0,6,words,'graphic',True)
    assert not m['voice_audio_embedded'] and n['voice_audio_embedded']
    assert not np.array_equal(silent[900:950],spoken[900:950])


def test_moving_source_actual_frames_change_compositions():
    a,b=lab();shot=next(s for s in plan()['shots'] if s['source']=='film')
    s=image_stage(a,b,shot,.1,'graphic')
    t=image_stage(a,b,shot,.8,'graphic')
    assert np.mean(np.abs(s.astype(float)-t.astype(float)))>1
    assert np.any(s[200:500]!=t[200:500])


def test_two_palettes_have_different_accents():
    a,b=lab();shot=plan()['shots'][0];words=cues_real()
    x,_=compose(a,b,shot,.4,.25,0,6,words,'graphic')
    y,_=compose(a,b,shot,.4,.25,0,6,words,'cinema')
    assert np.mean(np.abs(x.astype(float)-y.astype(float)))>1


def test_invalid_source_role_or_palette_rejected():
    a,b=lab();shot=plan()['shots'][0];shot['source']='AI_GENERATED_AS_ARCHIVE'
    with pytest.raises(ValueError):image_stage(a,b,shot,.5,'graphic')
    shot['source']='photo'
    with pytest.raises(ValueError):image_stage(a,b,shot,.5,'nonsense')


def test_all_word_cues_timing_bounded_and_whole_text():
    w=json.loads((ROOT/'examples/voice_alexandre_words_v24.json').read_text())
    raw=parse_words(w);timed=cues(raw)
    assert len(raw)==32 and len(timed)>=6
    assert abs(raw[-1]['end']-14.071)<.05
    assert all(c['end']>c['start'] for c in timed)


def test_long_title_never_overflows_silently():
    a,b=lab();shot=plan()['shots'][0]
    shot['headline']='TRABALHADORES RECONHECIMENTOS REORGANIZACOES DOCUMENTAIS'
    base=image_stage(a,b,shot,.5,'graphic')
    try:
        f,qa=overlay(base,shot,1.0,.6,0,6,cues_real(),'graphic')
        assert f.shape==(960,540,3) and qa['safe']
    except ValueError as exc:
        assert 'headline' in str(exc) or 'unreadable' in str(exc)


def test_quiet_title_retreat_for_majority_of_runtime():
    p=plan();duration=p['duration_sec']
    quiet=sum(max(0.,s['end']-s['start']-.62) for s in p['shots'])
    assert quiet/duration>.70

