"""Validate a supplied REAL narration file and audio presence in the rendered MP4.

No TTS generation, no external downloads, no assumption that a 14s WAV belongs
to Alexandre. Signal presence ≠ speaker identity, intelligibility or exact
word-level synchronization; the ElevenLabs generation hash is not available.
"""
from __future__ import annotations
import hashlib,json,math,subprocess
from pathlib import Path
import numpy as np
from .master_director_v29 import read_words

SR=8000

def pcm(path:Path,sample_rate:int=SR):
    result=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(path),
        '-vn','-ac','1','-ar',str(sample_rate),'-f','f32le','-'],capture_output=True)
    if result.returncode!=0 or len(result.stdout)<2048:
        raise ValueError('cannot decode audio track')
    return np.frombuffer(result.stdout,dtype='<f4').copy()


def rolling_voice_activity(samples:np.ndarray,rate:int=SR,window_s:float=.25)->dict:
    if samples.size<rate or not np.all(np.isfinite(samples)):
        raise ValueError('too short or invalid audio waveform')
    n=int(rate*window_s)
    blocks=[samples[i:i+n] for i in range(0,samples.size-n+1,n)]
    rms=np.array([np.sqrt(np.mean(a.astype('float64')**2)) for a in blocks])
    active=np.mean(rms>0.0003)
    peak=float(np.max(np.abs(samples)))
    return {'rms_median':round(float(np.median(rms)),6),
            'active_fraction':round(float(active),3),
            'peak':round(peak,4),'active_windows':int(np.sum(rms>0.0003)),
            'windows':int(len(rms))}


def inspect_candidate(path:Path,words_path:Path,expected_duration:float=14.0713)->dict:
    """Check only decoded audio, plausible energy and the actual known transcript timeline."""
    if not path.is_file():raise FileNotFoundError(path)
    words=read_words(words_path)
    duration=float(json.loads(subprocess.check_output(['ffprobe','-v','error',
        '-show_entries','format=duration','-of','json',str(path)],text=True))['format']['duration'])
    if abs(duration-expected_duration)>.42:
        raise ValueError('candidate narration duration does not match aligned recording')
    audio=pcm(path);signal=rolling_voice_activity(audio)
    if signal['active_fraction']<.30 or signal['rms_median']<.0003:
        raise ValueError('candidate narration lacks usable audio energy')
    return {'duration_sec':duration,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
            'source_file':path.name,'timeline_words':len(words),
            'speech_like_audio_energy':signal,
            'original_Alexandre_generation_hash_verified':False,
            'speaker_identity_verified':False,
            'word_sync_to_mp4_verified':False,
            'publication_approved':False,
            'note':'Signal-energy and duration only. No proof of speaker identity from wave shape.'}


def waveform_similarity_to_master(original:Path,finished:Path,words_path:Path)->dict:
    """Check that the *supplied* sound contributes to the master, not whose voice it is.

    Normalize 8kHz PCM, check short offsets to allow encoder priming. This is
    a regression test against accidentally outputting only background music.
    """
    src_report=inspect_candidate(original,words_path)
    src=pcm(original);out=pcm(finished)
    n=min(len(src),len(out),int(13.5*SR))
    if n<SR:raise ValueError('empty output')
    src=src[:n].astype('float64');out=out[:n].astype('float64')
    # Correlation is computed across short shifts instead of using 13s cross correlation.
    results=[]
    for shift in range(-120,121,24):
        if shift<0:a,b=src[-shift:],out[:n+shift]
        elif shift>0:a,b=src[:n-shift],out[shift:]
        else:a,b=src,out
        a=a-a.mean();b=b-b.mean()
        denom=np.linalg.norm(a)*np.linalg.norm(b)
        results.append(float(np.dot(a,b)/denom) if denom>1e-6 else 0.)
    score=round(max(results),4)
    if score<.11:raise ValueError('supplied narration is not detectably present in the master')
    return {'voice_signal_detectable_in_master':True,'max_approx_waveform_correlation':score,
            'source_sha256':src_report['sha256'],
            'original_Alexandre_generation_hash_verified':False,
            'speaker_identity_verified':False,
            'publication_approved':False}
