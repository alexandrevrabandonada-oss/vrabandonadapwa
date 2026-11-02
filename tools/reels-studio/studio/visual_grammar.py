"""Deterministic editorial transitions; no modification of documentary originals."""
from __future__ import annotations
import math
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

def composite(previous,current,progress,style):
    if previous.shape!=current.shape or previous.ndim!=3:raise ValueError('transition frames require same BGR dimensions')
    if style not in VALID:raise ValueError('unknown transition')
    t=float(np.clip(progress,0,1))
    if style=='hard_cut' or t>=1:return current.copy()
    if t<=0:return previous.copy()
    h,w=current.shape[:2]
    yy,xx=np.mgrid[0:h,0:w];nx=xx/max(1,w-1);ny=yy/max(1,h-1)
    if style=='print_registration':
        ridge=.045*np.sin(16*ny+3*np.sin(ny*7))+.025*np.sin(41*ny)
        mask=nx<t*1.20-.12+ridge
    elif style=='slag_reveal':
        phase=nx*.73+ny*.27
        jitter=.018*np.sin(19*nx+21*ny)+.018*np.sin(57*nx-13*ny)
        mask=phase+jitter<t*1.17-.08
    else:
        band=np.floor(ny*7).astype('int');stagger=(band%3)*.038
        mask=np.abs(nx-.5)+stagger<t*.72
    return np.where(mask[:,:,None],current,previous).astype(np.uint8)
