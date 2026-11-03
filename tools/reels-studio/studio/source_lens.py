"""Documentary camera: crop/zoom only original pixels, no rewritten evidence."""
from __future__ import annotations
import math
import cv2
import numpy as np

def validate_lens(scene:dict)->list[str]:
    lens=scene.get('document_lens')
    if lens is None:return []
    if scene.get('type')!='document':return ['document_lens requires a document scene']
    if not isinstance(lens,dict):return ['document_lens must be an object']
    box=lens.get('focus_box')
    if not isinstance(box,list) or len(box)!=4:return ['focus_box must be [left,top,right,bottom] normalized']
    errors=[]
    try:
        left,top,right,bottom=map(float,box)
        if not all(map(math.isfinite,(left,top,right,bottom))):errors.append('focus box nonfinite')
        elif not (0<=left<right<=1 and 0<=top<bottom<=1):errors.append('focus box out of image bounds')
        elif (right-left)*(bottom-top)<.015:errors.append('focus box too small, risks unreadable evidence')
        d=float(scene['duration']);start=float(lens.get('start_sec',.8));end=float(lens.get('end_sec',d-.5))
        if not 0<=start<end<=d:errors.append('lens timings invalid')
        if end-start<.6:errors.append('lens move too fast for evidence')
        if lens.get('matte') not in (None,'ink','paper'):errors.append('invalid document matte')
    except (ValueError,TypeError,KeyError):errors.append('invalid document lens values')
    return errors

def documentary_focus(source:np.ndarray,frame_width:int,frame_height:int,scene:dict,seconds:float)->np.ndarray:
    lens=scene.get('document_lens')
    if lens is None:raise ValueError('document_lens required')
    errors=validate_lens(scene)
    if errors:raise ValueError('; '.join(errors))
    if source.ndim!=3 or source.shape[2]!=3:raise ValueError('document must be BGR image')
    h,w=source.shape[:2];x1,y1,x2,y2=lens['focus_box']
    start=float(lens.get('start_sec',.8));end=float(lens.get('end_sec',scene['duration']-.5))
    u=float(np.clip((seconds-start)/(end-start),0,1));t=u*u*(3-2*u)
    l=round(x1*t*w);top=round(y1*t*h);r=round((1+(x2-1)*t)*w);b=round((1+(y2-1)*t)*h)
    l=max(0,min(w-2,l));r=max(l+2,min(w,r))
    top=max(0,min(h-2,top));b=max(top+2,min(h,b))
    src=source[top:b,l:r]
    background=(19,19,22) if lens.get('matte','ink')=='ink' else (231,235,240)
    frame=np.full((frame_height,frame_width,3),background,dtype=np.uint8)
    scale=min(frame_width*.94/(r-l),frame_height*.88/(b-top))
    dw=min(frame_width,max(1,round((r-l)*scale)));dh=min(frame_height,max(1,round((b-top)*scale)))
    small=cv2.resize(src,(dw,dh),interpolation=cv2.INTER_AREA if scale<1 else cv2.INTER_LINEAR)
    ox=(frame_width-dw)//2;oy=(frame_height-dh)//2
    frame[oy:oy+dh,ox:ox+dw]=small
    return frame
