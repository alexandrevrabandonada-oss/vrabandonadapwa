"""Strict, non-automatic caption timeline.  Timing file != human approval."""
from __future__ import annotations
import json, math, re, unicodedata
from pathlib import Path


def normalize(text: str) -> str:
    txt=unicodedata.normalize('NFKD',text.casefold())
    return re.sub(r'[^a-z0-9]+','', ''.join(c for c in txt if not unicodedata.combining(c)))


def load_timeline(path: Path, expected_text: str, voice_duration: float, maximum_per_cue: float=5.0) -> list[dict]:
    """Reject misordered, unmatched or out-of-bounds captions. Never 'forces' alignment."""
    data=json.loads(path.read_text(encoding='utf-8'))
    cues=data.get('cues')
    if not isinstance(cues,list) or not cues:raise ValueError('caption cues must be a nonempty list')
    out=[];last=0.0
    for i,c in enumerate(cues):
        if not isinstance(c,dict) or not isinstance(c.get('text'),str) or not c['text'].strip():
            raise ValueError(f'caption cue {i}: text missing')
        try: start,end=float(c['start']),float(c['end'])
        except (ValueError,TypeError,KeyError): raise ValueError(f'caption cue {i}: invalid time')
        if not math.isfinite(start) or not math.isfinite(end) or start<0 or start<last-0.001 or end<=start or end>voice_duration+.1:
            raise ValueError(f'caption cue {i}: out-of-order or beyond audio')
        if end-start>maximum_per_cue:raise ValueError(f'caption cue {i}: exceeds reading-time limit')
        if len(c['text'])>120:raise ValueError(f'caption cue {i}: too many characters')
        last=end;out.append({'text':c['text'].strip(),'start':start,'end':end})
    actual=' '.join(c['text'] for c in out)
    if normalize(actual)!=normalize(expected_text):
        raise ValueError('caption transcript differs from approved narration text')
    return out


def active_caption(cues:list[dict],time:float)->str|None:
    for cue in cues:
        if cue['start']<=time<cue['end']:
            return cue['text']
    return None