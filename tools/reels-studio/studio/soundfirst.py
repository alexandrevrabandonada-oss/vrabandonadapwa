"""Sound-first proposal from an EXISTING local recording. This is NOT transcription or word alignment."""
from __future__ import annotations
import hashlib, math, subprocess
from pathlib import Path
import numpy as np

def decode_pcm(path:Path,max_seconds:float=240.,sr:int=16000):
    if not path.is_file():raise FileNotFoundError(path)
    proc=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(path),'-t',str(max_seconds),
        '-f','s16le','-ac','1','-ar',str(sr),'-'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if proc.returncode!=0 or len(proc.stdout)<sr//10*2:raise ValueError('audio undecodable or too short')
    return np.frombuffer(proc.stdout,dtype='<i2').astype(np.float32)/32768.,sr

def candidate_pauses(samples:np.ndarray,sr:int=16000,window_ms:int=40,min_pause_sec:float=.16):
    if samples.ndim!=1 or sr<8000:raise ValueError('mono PCM expected')
    dur=len(samples)/sr
    if dur<.5:raise ValueError('recording too short')
    n=max(1,round(sr*window_ms/1000))
    windows=np.pad(samples,(0,(-len(samples))%n)).reshape(-1,n)
    rms=np.sqrt(np.mean(windows.astype(np.float64)**2,axis=1))
    db=20*np.log10(np.maximum(rms,1e-7))
    voiced=db[db>-55];ref=float(np.percentile(voiced,65)) if voiced.size else -55.
    threshold=max(-46.,min(-31.,ref-16.))
    silence=db<threshold;positions=[];start=None
    for i,silent in enumerate(list(silence)+[False]):
        if silent and start is None:start=i
        elif not silent and start is not None:
            if (i-start)*n/sr>=min_pause_sec and start>0 and i<len(silence):
                length=(i-start)*n/sr
                positions.append({'second':round((i+start)*n/(2*sr),3),
                                  'duration':round(length,3),'confidence':round(min(1.,length/.5),2)})
            start=None
    return {'duration_sec':round(dur,4),'threshold_dbfs':round(threshold,2),
            'candidate_pauses':positions,'energy_dbfs':[round(float(v),2) for v in db],
            'note':'Acoustic pauses only; no spoken words verified'}

def propose_cuts(pauses:dict,scenes:list[dict],max_deviation_sec:float=1.1,min_shot_sec:float=.6):
    if not scenes:raise ValueError('scene list required')
    total=float(pauses['duration_sec']);durations=[float(s['duration']) for s in scenes]
    if total<=0 or any(not math.isfinite(d) or d<=0 for d in durations):raise ValueError('bad duration')
    boundaries=np.cumsum(durations)/sum(durations)*total
    candidates=pauses['candidate_pauses'];cuts=[];last=0.
    for i,scene in enumerate(scenes):
        if i==len(scenes)-1:end=total;source='recording_end';confidence=1.
        else:
            target=float(boundaries[i])
            eligible=[p for p in candidates if abs(p['second']-target)<=max_deviation_sec
                      and p['second']>=last+min_shot_sec
                      and p['second']<=total-min_shot_sec*(len(scenes)-i-1)]
            if eligible:
                best=min(eligible,key=lambda p:abs(p['second']-target)-.15*p['duration'])
                end=float(best['second']);source='acoustic_pause';confidence=best['confidence']
            else:
                end=max(last+min_shot_sec,min(total-min_shot_sec*(len(scenes)-i-1),target))
                source='duration_fallback_NOT_AUDIO_SYNC';confidence=0.
        cuts.append({'scene_id':scene['id'],'start_sec':round(last,3),'end_sec':round(end,3),
                     'duration_sec':round(end-last,3),'suggestion_source':source,
                     'confidence':confidence,'reason':scene.get('direction',{}).get('cut_motive','pending editorial direction')})
        last=end
    return {'status':'PROPOSAL_REQUIRES_HUMAN_AUDIO_REVIEW','duration_sec':total,'cuts':cuts,
            'pause_based_cuts':sum(c['suggestion_source']=='acoustic_pause' for c in cuts),
            'voice_word_alignment_verified':False,'publication_approved':False}

def analyze(path:Path,scenes:list[dict]):
    audio,sr=decode_pcm(path)
    pauses=candidate_pauses(audio,sr)
    proposal=propose_cuts(pauses,scenes)
    proposal['audio_sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
    proposal['audio_analysis']={k:v for k,v in pauses.items() if k!='energy_dbfs'}
    return proposal
