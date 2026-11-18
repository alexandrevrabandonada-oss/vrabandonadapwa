"""The sound-first director never confuses timed cutting with confirmed spoken words."""
import wave, numpy as np, pytest
from pathlib import Path
from studio.soundfirst import candidate_pauses, propose_cuts, analyze, decode_pcm

def voice_fixture(tmp):
    sr=16000;signal=[]
    for duration,freq in [(.95,180),(.32,0),(1.1,220),(.32,0),(1.3,160)]:
        t=np.arange(round(sr*duration))/sr
        signal.append(np.sin(2*np.pi*freq*t)*.20 if freq else np.zeros(len(t)))
    data=np.concatenate(signal);p=tmp/'lab.wav'
    with wave.open(str(p),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr)
        f.writeframes((data*32767).astype('<i2').tobytes())
    return p,data,sr

def test_find_real_acoustic_silence_without_word_claim(tmp_path):
    p,samples,sr=voice_fixture(tmp_path)
    detected=candidate_pauses(samples,sr)
    assert len(detected['candidate_pauses'])>=2
    scenes=[{'id':'a','duration':1.15},{'id':'b','duration':1.5},{'id':'c','duration':1.3}]
    report=propose_cuts(detected,scenes)
    assert report['pause_based_cuts']>=1
    assert report['voice_word_alignment_verified'] is False
    assert report['publication_approved'] is False
    assert abs(report['cuts'][-1]['end_sec']-len(samples)/sr)<.001

def test_existing_recording_hash(tmp_path):
    p,_,_=voice_fixture(tmp_path)
    rep=analyze(p,[{'id':'one','duration':1},{'id':'two','duration':1}])
    assert len(rep['audio_sha256'])==64
    assert rep['status']=='PROPOSAL_REQUIRES_HUMAN_AUDIO_REVIEW'

def test_duration_fallback_is_honest():
    r=propose_cuts({'duration_sec':3.,'candidate_pauses':[]},
                   [{'id':'a','duration':1},{'id':'b','duration':2}])
    assert r['pause_based_cuts']==0
    assert r['cuts'][0]['suggestion_source']=='duration_fallback_NOT_AUDIO_SYNC'

def test_bad_audio_rejected(tmp_path):
    x=tmp_path/'fake.wav';x.write_bytes(b'fake')
    with pytest.raises(ValueError):decode_pcm(x)
