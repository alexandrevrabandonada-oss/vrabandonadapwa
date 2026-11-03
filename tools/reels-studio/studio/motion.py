"""Keyframed cinematic camera path. Keyframes explicitly authored per scene."""
from __future__ import annotations
import math

def validate_keyframes(scene:dict)->list[str]:
    frames=scene.get('camera_keyframes')
    if frames is None:return []
    errors=[]
    if not isinstance(frames,list) or len(frames)<2 or len(frames)>12:
        return ['camera_keyframes must include 2 to 12 controls']
    try:
        duration=float(scene['duration']);times=[]
        for i,k in enumerate(frames):
            t=float(k['at']);focus=k['focus']
            if not math.isfinite(t) or t<0 or t>duration or not isinstance(focus,list) or len(focus)!=3:
                errors.append(f'camera keyframe {i}: invalid time/position');continue
            coords=[float(a) for a in focus]
            if not all(math.isfinite(x) for x in coords) or any(not 0<=x<=1 for x in coords[:2]) or not .9<=coords[2]<=2.5:
                errors.append(f'camera keyframe {i}: unsafe camera geometry')
            times.append(t)
        if len(times)==len(frames):
            if abs(times[0])>.001 or abs(times[-1]-duration)>.001:errors.append('camera keyframe path must start at 0 and end at duration')
            if any(b<=a for a,b in zip(times,times[1:])):errors.append('camera keyframe times must increase strictly')
    except (ValueError,TypeError,KeyError):errors.append('camera keyframes contain malformed values')
    return errors

def evaluate(scene:dict,seconds:float)->list[float]:
    frames=scene.get('camera_keyframes',[])
    if not frames:raise ValueError('no keyframes')
    t=max(0.,min(float(scene['duration']),seconds))
    for a,b in zip(frames,frames[1:]):
        if a['at']<=t<=b['at']:
            u=(t-a['at'])/(b['at']-a['at']);u=u*u*(3-2*u)
            return [float(x)+(float(y)-float(x))*u for x,y in zip(a['focus'],b['focus'])]
    return [float(x) for x in frames[-1]['focus']]
