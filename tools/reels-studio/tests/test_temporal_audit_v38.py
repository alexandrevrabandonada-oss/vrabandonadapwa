"""v0.38 regression tests: semantic cuts, safety, false voice, honest human rating."""
import json
from pathlib import Path
import pytest
from studio import temporal_audit_v38 as v
ROOT=Path(__file__).resolve().parents[1]
WORDS=ROOT/'examples'/'voice_alexandre_words_v24.json'

def test_real_timestamps():
    words=v.read_words(WORDS)
    assert len(words)==32 and words[0][0]=='Volta'
    assert words[-1][2]==pytest.approx(14.071,abs=.002)

def test_seven_verified_semantic_cuts():
    cuts=v.cut_alignment(v.read_words(WORDS))
    assert len(cuts)==7
    assert max(row['drift_sec'] for row in cuts)==pytest.approx(.098,abs=.002)

def test_missing_words_fail_closed():
    words=v.read_words(WORDS)
    words=[('another',a,b) if word=='memória.' else (word,a,b) for word,a,b in words]
    with pytest.raises(ValueError,match='Missing semantic anchor'):
        v.cut_alignment(words)

def test_false_voice_claim_fails_before_video_decode(tmp_path):
    f=tmp_path/'preview.mp4';f.write_bytes(b'')
    f.with_suffix('.json').write_text(json.dumps({'version':'v0.37','narration_embedded':True}))
    with pytest.raises(ValueError,match='false voice'):
        v.audit(f,WORDS)

def test_false_csn_film_fails_before_video_decode(tmp_path):
    f=tmp_path/'preview.mp4';f.write_bytes(b'')
    f.with_suffix('.json').write_text(json.dumps({
      'version':'v0.37','narration_embedded':False,
      'historical_photo_source_years':[1941,1969,2014],
      'choreography':v.MOTIONS,'film_source':'CSN, 2011'}))
    with pytest.raises(ValueError,match='French film'):
        v.audit(f,WORDS)

def test_no_video_is_rejected(tmp_path):
    with pytest.raises(ValueError,match='Cannot decode video'):
        v.video_dynamics(tmp_path/'not-a-video.mp4')

def test_offline_review_page_has_ungraded_human_controls():
    html=(ROOT/'review/v38/index.html').read_text(encoding='utf-8')
    assert 'Sem avaliação completa' in html
    assert 'original_voice_embedded:false' in html
    assert 'V38_A_CINETICA.mp4' in html and 'V38_B_CONTIDA.mp4' in html
    assert 'https://' not in html and 'fetch(' not in html

def test_eight_motion_classes_unique():
    assert len(v.MOTIONS)==len(set(v.MOTIONS))==8
