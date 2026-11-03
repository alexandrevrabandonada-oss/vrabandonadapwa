"""V0.5 tests: honest caption alignment, measured audio and provenance."""
import json,sys,wave
from pathlib import Path
import numpy as np,pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.alignment import validate_words,export_alignment
from studio.audioqa import inspect_audio
from studio.provenance import snapshot

WORDS=[{'text':txt,'start':.4*i,'end':.4*i+.30} for i,txt in enumerate(['Dados','e','fontes','importam.'])]

def test_word_timeline_exports_unapproved_draft(tmp_path):
    assert len(validate_words(WORDS,'Dados e fontes importam.',2.2))==4
    result=export_alignment(WORDS,'Dados e fontes importam.',2.2,tmp_path/'test')
    assert result['status']=='DRAFT_TIME_CODES_NOT_HUMAN_REVIEWED'
    assert json.loads((tmp_path/'test.json').read_text())['cues']
    assert '-->' in (tmp_path/'test.srt').read_text()

def test_word_text_or_time_mismatch_blocks():
    with pytest.raises(ValueError):validate_words(WORDS[:-1],'Dados e fontes importam.',2.2)
    bad=[dict(w) for w in WORDS];bad[0]['start']=-1
    with pytest.raises(ValueError):validate_words(bad,'Dados e fontes importam.',2.2)
    bad=[dict(w) for w in WORDS];bad[1]['start']=bad[0]['start']
    with pytest.raises(ValueError):validate_words(bad,'Dados e fontes importam.',2.2)

def test_ebu_r128_meter_reads_synthetic_audio(tmp_path):
    wav=tmp_path/'lab.wav'
    t=np.arange(16000*2)/16000
    data=(np.sin(t*2*np.pi*190)*.04*32767).astype('<i2')
    with wave.open(str(wav),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000);w.writeframes(data.tobytes())
    report=inspect_audio(wav)
    assert report['ok'] and report['integrated_lufs']<0
    assert abs(report['duration']-2)<.02

def test_sha256_does_not_grant_publication_rights(tmp_path):
    (tmp_path/'test.jpg').write_bytes(b'NOT A DOCUMENTARY IMAGE')
    p={'project_id':'test-project','assets':{'a':{'file':'test.jpg','source':'synthetic','rights_status':'pending'}}}
    s=snapshot(p,tmp_path)
    assert s['assets'][0]['sha256'] and not s['public_distribution_allowed']
    assert s['assets'][0]['rights_status']=='pending'
