"""Deterministic industrial editorial transitions, with bounded memoized geometry."""
from __future__ import annotations
import math
from functools import lru_cache
import numpy as np
VALID={'hard_cut','print_registration','slag_reveal','press_gate'}

def validate_transition(scene):
    t=scene.get('transition_in')
    if t is None:return []
    if not isinstance(t,dict):return ['transition_in must be an object']
    kind=t.get('style','hard_cut');errors=[]
    if kind not in VALID:errors.append('unsupported transition language')
    try:d=float(t.get('duration',.25))
    except (ValueError,TypeError):return errors+['invalid transition duration']
    if not math.isfinite(d) or d<0 or d>.45:errors.append('transition must last 0–0.45 seconds')
    if kind!='hard_cut' and d<=0:errors.append('effect transition needs positive duration')
    if d>float(scene.get('duration',0))/2:errors.append('transition cannot dominate its scene')
    return errors

@lru_cache(maxsize=8)
def _threshold_field(h:int,w:int,style:str)->np.ndarray:
    if style not in VALID or style=='hard_cut':raise ValueError('unsupported geometry')
    yy,xx=np.indices((h,w),dtype=np.float32)
    nx=xx/max(1,w-1);ny=yy/max(1,h-1)
    if style=='print_registration':
        ridge=.045*np.sin(16*ny+3*np.sin(ny*7))+.025*np.sin(41*ny)
        return np.ascontiguousarray(nx+.12-ridge,dtype=np.float32)
    if style=='slag_reveal':
        jitter=.018*np.sin(19*nx+21*ny)+.018*np.sin(57*nx-13*ny)
        return np.ascontiguousarray(nx*.73+ny*.27+jitter+.08,dtype=np.float32)
    bands=np.floor(ny*7).astype(np.int8)
    return np.ascontiguousarray(np.abs(nx-.5)+(bands%3)*.038,dtype=np.float32)

def composite(previous,current,progress,style):
    if previous.shape!=current.shape or previous.ndim!=3:raise ValueError('transition frames require same BGR dimensions')
    if style not in VALID:raise ValueError('unknown transition')
    t=float(np.clip(progress,0,1))
    if style=='hard_cut' or t>=1:return current.copy()
    if t<=0:return previous.copy()
    h,w=current.shape[:2];field=_threshold_field(h,w,style)
    threshold=t*(1.20 if style=='print_registration' else 1.17 if style=='slag_reveal' else .72)
    return np.where((field<threshold)[:,:,None],current,previous).astype(np.uint8)
