"""Offline provider-timing and no-double-charge tests. Never contacts the API."""
import hashlib
import json
import sys
from pathlib import Path
import pytest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio import voice_bridge_v23 as b

def align(phrase='Oi, VR!'):
    chars=list(phrase)
    return {'characters':chars,
            'character_start_times_seconds':[i*.1 for i in range(len(chars))],
            'character_end_times_seconds':[(i+1)*.1 for i in range(len(chars))]}

def test_provider_chars_generate_words_at_actual_timings():
    x=b.alignment_to_words(align())
    assert x['transcript']=='Oi, VR!'
    assert [w['text'] for w in x['words']]==['Oi,','VR!']
    assert x['words'][1]['start']==.4
    assert x['words'][1]['end']==.7
    assert x['status']=='PROVIDER_ALIGNED_HUMAN_UNREVIEWED'

def test_provider_missing_or_mismatched_timings_rejected():
    x=align();x['character_end_times_seconds'].pop()
    with pytest.raises(ValueError,match='lengths'):b.alignment_to_words(x)
    x=align();x['character_start_times_seconds'][2]=-.8
    with pytest.raises(ValueError):b.alignment_to_words(x)

def test_no_api_or_credits_without_explicit_request(tmp_path):
    with pytest.raises(ValueError,match='explicit'):
        b.generate_timed_speech('teste voz','uM5sFrRJkaxDKSD5SLWM',tmp_path/'voice.mp3',generate=False)

def test_changed_input_cannot_overwrite_prior_cached_voice(tmp_path):
    p=tmp_path/'voice.mp3';p.write_bytes(b'synthetic fixture, not an MP3')
    meta={'request_sha256':b.request_hash('hello','uM5sFrRJkaxDKSD5SLWM'),
          'audio_sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    p.with_suffix('.generation.json').write_text(json.dumps(meta))
    p.with_suffix('.words.json').write_text('{}')
    assert b.inspect_cached(p,meta['request_sha256'])['cache_hit']
    with pytest.raises(ValueError,match='different'):
        b.generate_timed_speech('changed','uM5sFrRJkaxDKSD5SLWM',p,generate=True,api_key='fake')

def test_api_key_missing_protects_from_generation(tmp_path,monkeypatch):
    monkeypatch.delenv('ELEVENLABS_API_KEY',raising=False)
    with pytest.raises(ValueError,match='absent'):
        b.generate_timed_speech('hello','uM5sFrRJkaxDKSD5SLWM',tmp_path/'voice.mp3',generate=True)

def test_hash_is_deterministic_without_secret():
    a=b.request_hash('  Olá VR  ','uM5sFrRJkaxDKSD5SLWM')
    assert a==b.request_hash('Olá VR','uM5sFrRJkaxDKSD5SLWM')
    assert len(a)==64
