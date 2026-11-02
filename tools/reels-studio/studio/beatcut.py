"""Narration-aware edit decisions; authored timings, never guessed transcription."""
from __future__ import annotations
import math
from itertools import groupby

def timeline(project:dict)->list[dict]:
    entries=[];cursor=0.
    for scene in project.get('scenes',[]):
        d=float(scene['duration'])
        entries.append({'scene_id':scene['id'],'start':round(cursor,3),'end':round(cursor+d,3),'duration':d,'type':scene['type'],'subject':scene.get('direction',{}).get('subject',''),'cut_motive':scene.get('direction',{}).get('cut_motive','')})
        cursor+=d
    return entries

def check_beats(project:dict,require_beats:bool=False)->tuple[list[str],list[str]]:
    errors=[];warnings=[];marks=project.get('edit_beats',[])
    if not marks:
        if require_beats:errors.append('sound-first edit requires authored edit_beats')
        else:warnings.append('no narration-linked beat plan; shot timing is not sound-first')
        return errors,warnings
    if not isinstance(marks,list):return ['edit_beats must be a list'],[]
    shots=timeline(project);known={s['scene_id']:s for s in shots}
    if len(marks)!=len(shots):errors.append('each scene must have exactly one edit beat')
    used=set();prev=-1.
    for idx,b in enumerate(marks):
        if not isinstance(b,dict):errors.append(f'beat {idx}: invalid');continue
        sid=b.get('scene_id');shot=known.get(sid)
        if not shot:errors.append(f'beat {idx}: unknown scene_id');continue
        if sid in used:errors.append(f'beat {idx}: repeated scene_id')
        used.add(sid)
        try:t=float(b['time_sec'])
        except (KeyError,TypeError,ValueError):errors.append(f'beat {idx}: invalid time');continue
        if not math.isfinite(t) or t<0:errors.append(f'beat {idx}: nonfinite or negative');continue
        if abs(t-shot['start'])>.12:errors.append(f'beat {idx}: time not at scene boundary for {sid}')
        if t<prev:errors.append(f'beat {idx}: out of order')
        prev=t
        if not str(b.get('reason','')).strip():errors.append(f'beat {idx}: semantic cut reason missing')
        if b.get('audio_anchor') and not isinstance(b['audio_anchor'],str):errors.append(f'beat {idx}: invalid audio_anchor')
    if set(known)!=used:errors.append('edit beats do not cover every scene')
    script=str(project.get('narration',{}).get('text','')).casefold()
    for b in marks:
        if not isinstance(b,dict):continue
        phrase=b.get('audio_anchor')
        if phrase and phrase.casefold() not in script:
            errors.append(f"beat {b.get('scene_id')}: audio_anchor not found in approved narration")
    if not project.get('narration',{}).get('file'):
        warnings.append('beat plan is design-only; no audio file, real alignment not verified')
    return errors,warnings

def inspect_repetition(project:dict)->dict:
    scenes=project.get('scenes',[])
    types=[s.get('type') for s in scenes];assets=[s.get('asset') for s in scenes]
    max_identical=max((len(list(g)) for _,g in groupby(types)),default=0)
    distinct=len(set(a for a in assets if a));warnings=[]
    if len(scenes)>=4 and distinct<3:warnings.append('too few distinct visuals for a documentary sequence')
    if max_identical>=4:warnings.append('four or more identical shot types in a row')
    missing=[s.get('id') for s in scenes if not all(s.get('direction',{}).get(k) for k in ('subject','intent','camera_motive','cut_motive'))]
    if missing:warnings.append('shots missing authored direction: '+', '.join(map(str,missing)))
    return {'distinct_assets':distinct,'max_consecutive_same_type':max_identical,'missing_direction':missing,'warnings':warnings}
