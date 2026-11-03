"""Aço Gráfico: scene-first editorial guards. Heuristics never certify artistry."""
from __future__ import annotations
from itertools import groupby
from typing import Mapping

GRAMMARS={'architectural_travel','coil_occlusion','source_read','action_follow','witness_portrait'}

def inspect(shot_plan:list[dict],sources:Mapping[str,dict],*,public=False)->dict:
    errors=[];warnings=[];seen=[];scene_ids=set();total=0.
    if not shot_plan:errors.append('shot plan empty')
    for index,s in enumerate(shot_plan):
        sid=s.get('id',f'#{index}');label=f'scene {sid}'
        if sid in scene_ids:errors.append(f'{label}: duplicate scene ID')
        scene_ids.add(sid)
        grammar=s.get('grammar')
        if grammar not in GRAMMARS:errors.append(f'{label}: unrecognized visual grammar')
        seen.append(grammar)
        try:
            duration=float(s['duration_sec'])
            if not .35<=duration<=12:errors.append(f'{label}: unsupported shot duration')
            total+=duration
        except (KeyError,ValueError,TypeError):errors.append(f'{label}: shot duration missing');duration=0.
        if grammar in ('architectural_travel','coil_occlusion','witness_portrait') and duration>4:
            warnings.append(f'{label}: long still-based shot; review movement and pacing')
        focal=s.get('subject_anchor')
        if not isinstance(focal,(list,tuple)) or len(focal)!=2 or any(not isinstance(x,(int,float)) or not 0<=x<=1 for x in focal):
            errors.append(f'{label}: focal point missing or unsafe')
        key=s.get('source');source=sources.get(key)
        if source is None:errors.append(f'{label}: missing asset');continue
        if not s.get('on_screen_credit'):errors.append(f'{label}: provenance label not visible')
        if source.get('source_kind')=='historical_document' and grammar!='source_read':
            errors.append(f'{label}: historical primary source cannot receive graphic scene treatment')
        if source.get('source_kind')=='simulation' and 'SIMULAÇÃO' not in s.get('on_screen_credit','').upper():
            errors.append(f'{label}: simulation must be disclosed on screen')
        if source.get('capture_date') is None and s.get('editorial_role')=='event_evidence':
            errors.append(f'{label}: undated photograph cannot prove a dated event')
        if public and source.get('rights_verified') is not True:
            errors.append(f'{label}: media rights not verified')
        if s.get('editorial_role')=='historical_event_evidence' and source.get('event_verified') is not True:
            errors.append(f'{label}: event provenance unverified')
    if len(seen)>=3 and len(set(seen))<3:
        warnings.append('TEMPLATE_RISK: fewer than three distinct grammars in 3+ scenes')
    if seen and max((len(list(items)) for _,items in groupby(seen)),default=0)>=3:
        warnings.append('TEMPLATE_RISK: three consecutive identical scene grammars')
    return {'errors':errors,'warnings':warnings,'duration_sec':round(total,3),
        'distinct_grammars':len(set(seen)),'scene_count':len(shot_plan),
        'creative_quality_approved':False,'publication_allowed':False,
        'release_note':'A QA pass is never a publication authorization.'}
