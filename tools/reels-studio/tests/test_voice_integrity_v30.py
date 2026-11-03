import sys,subprocess,wave
from pathlib import Path
import numpy as np
import pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.voice_integrity_v30 import inspect_candidate,pcm,rolling_voice_activity,waveform_similarity_to_master
WORDS=Path(__file__).resolve().parents[1]/'examples/voice_alexandre_words_v24.json'


def wav(path,signal,sample_rate=8000):
    signal=np.asarray(signal,dtype=np.float32)
    with wave.open(str(path),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sample_rate)
        f.writeframes((np.clip(signal,-1,1)*32767).astype('<i2').tobytes())
    return path


def test_silent_file_cannot_pass_as_real_narration(tmp_path):
    path=wav(tmp_path/'silent.wav',np.zeros(112571))
    with pytest.raises(ValueError,match='lacks usable audio energy'):
        inspect_candidate(path,WORDS)


def test_bad_duration_rejected(tmp_path):
    path=wav(tmp_path/'wrong.wav',np.sin(np.arange(8000*4)*2*np.pi*440/8000)*.25)
    with pytest.raises(ValueError,match='duration'):
        inspect_candidate(path,WORDS)


def test_valid_test_carrier_is_not_claimed_as_alexandre(tmp_path):
    sr=8000;t=np.arange(round(14.0713*sr))/sr
    wavpath=wav(tmp_path/'synthetic_carrier.wav',.19*np.sin(2*np.pi*320*t))
    report=inspect_candidate(wavpath,WORDS)
    assert report['timeline_words']==32
    assert report['speaker_identity_verified'] is False
    assert report['original_Alexandre_generation_hash_verified'] is False
    assert report['publication_approved'] is False


def test_mix_cannot_falsely_claim_voice_when_only_music(tmp_path):
    sr=8000;t=np.arange(round(14.0713*sr))/sr
    voice=wav(tmp_path/'carrier.wav',.2*np.sin(2*np.pi*450*t))
    no_voice=wav(tmp_path/'music.wav',.2*np.sin(2*np.pi*140*t))
    with pytest.raises(ValueError,match='not detectably present'):
        waveform_similarity_to_master(voice,no_voice,WORDS)


def test_composite_media_detects_supplied_carrier(tmp_path):
    sr=8000;t=np.arange(round(14.0713*sr))/sr
    voice=wav(tmp_path/'carrier.wav',.12*np.sin(2*np.pi*340*t))
    music=wav(tmp_path/'music.wav',.045*np.sin(2*np.pi*62*t))
    out=tmp_path/'mix.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(voice),'-i',str(music),
        '-filter_complex','[0:a][1:a]amix=inputs=2:duration=longest:weights=1 0.4[a]',
        '-map','[a]',str(out)],check=True)
    r=waveform_similarity_to_master(voice,out,WORDS)
    assert r['voice_signal_detectable_in_master']
    assert r['max_approx_waveform_correlation']>.7
