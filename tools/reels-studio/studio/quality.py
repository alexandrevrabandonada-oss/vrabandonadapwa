"""Deterministic media QA. Objective gates never replace aesthetic/ethical judgment."""
from __future__ import annotations
import json, subprocess
from pathlib import Path
from .factory import probe,validate


def _fps(rate):
    if not rate:return 0.
    if '/' in rate:
        a,b=map(float,rate.split('/'));return a/b if b else 0.
    return float(rate)


def audit(project:dict,workspace:Path,media:Path,master:bool=False):
    issues=[];advice=[];technical={};metadata=None
    if not media.is_file():issues.append('render missing');return {'passed':False,'issues':issues}
    metadata=probe(media)
    video=next((s for s in metadata.get('streams',[]) if s.get('codec_type')=='video'),None)
    audio=next((s for s in metadata.get('streams',[]) if s.get('codec_type')=='audio'),None)
    if not video:issues.append('video stream missing')
    else:
        technical={'dimensions':[video.get('width'),video.get('height')],
                   'fps':_fps(video.get('r_frame_rate')),'codec':video.get('codec_name'),
                   'duration':float(metadata.get('format',{}).get('duration',0))}
        if video.get('width')!= (1080 if master else 540) or video.get('height')!=(1920 if master else 960):
            issues.append('export dimensions mismatch selected mode')
        if master and abs(technical['fps']-30)>0.01:issues.append('master fps below 30')
    if not audio: advice.append('No audio stream: cannot evaluate narration/music mix')
    narration=project.get('narration',{})
    if not narration.get('file'):issues.append('voice missing from master readiness')
    if not narration.get('timings_verified',False):issues.append('captions/voice alignment not verified')
    editorial=validate(project,workspace,'publish')
    issues+=editorial['errors']
    clips=sum(sc['type']=='clip' for sc in project.get('scenes',[]))
    if clips==0:advice.append('All scenes are stills/animated photographs. Add grounded footage or stronger subject/action direction.')
    if len(project.get('assets',{}))<6:advice.append('Asset diversity low; consider adding verified archival footage/photographs and documents.')
    if not project.get('human_approval',{}).get('approved'):advice.append('Creative 10/10 cannot be inferred from automated checks; independent aesthetic review required.')
    return {'passed':not issues,'master':master,'technical':technical,'audio_stream':bool(audio),
            'issues':list(dict.fromkeys(issues)),'recommendations':advice,
            'creative_score':'NOT AUTOMATABLE','publication_status':'BLOCKED' if issues else 'PENDING EDITORIAL CONFIRMATION'}