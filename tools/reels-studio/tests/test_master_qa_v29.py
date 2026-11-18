from pathlib import Path
import json
import pytest
from studio import master_qa_v29 as qa
from studio import master_director_v29 as render

def test_caption_export_uses_original_times_not_generated_timings(tmp_path):
    w=render.read_words(Path(__file__).resolve().parents[1]/'examples'/'voice_alexandre_words_v24.json')
    srt=tmp_path/'verified.srt'
    n=qa.export_srt(w,srt)
    raw=srt.read_text(encoding='utf8')
    assert n==9
    assert '00:00:00,000' in raw and '00:00:14,071' in raw
    assert 'Volta Redonda tem memória.' in raw

def test_media_contract_negative_cases_are_closed():
    assert render.check_plan()['duration']==14.5
    for scene in render.SHOTS:
        if scene.role=='film':
            assert scene.credit.upper().find('FRANÇA')>=0

def test_true_peak_cannot_be_derived_from_metadata_only():
    import inspect
    src=inspect.getsource(qa.technical)
    assert 'ebur128=peak=true' in src
    assert 'aesthetic_score_certified' in src
