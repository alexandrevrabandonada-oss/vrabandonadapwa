"""Aço Gráfico v0.16: footage preflight and documented moving-source shot.

Technical motion NEVER proves recording authenticity. Preserve source master.
"""
from dataclasses import dataclass
from pathlib import Path
import hashlib
import cv2
import numpy as np

@dataclass(frozen=True)
class MovingSource:
    path:Path
    kind:str
    location:str
    credit:str
    capture_date:str|None=None
    source_url:str|None=None
    license_name:str|None=None
    license_url:str|None=None
    rights_reviewed:bool=False

    def errors(self,publish=False):
        errors=[]
        if self.kind not in ('licensed_recorded','synthetic_lab','unverified_recorded'):errors.append('unrecognized footage kind')
        if not self.path.is_file():errors.append('missing clip')
        if not self.location or not self.credit:errors.append('missing credit or location')
        if self.kind=='licensed_recorded' and not all((self.capture_date,self.source_url,self.license_name,self.license_url,self.rights_reviewed)):
            errors.append('recorded footage origin and rights incomplete')
        if publish and (self.kind!='licensed_recorded' or not self.rights_reviewed):
            errors.append('publication blocked for synthetic/unverified footage')
        return errors

    def provenance(self):
        return {'kind':self.kind,'location':self.location,'credit':self.credit,'capture_date':self.capture_date,
                'source_url':self.source_url,'license_name':self.license_name,'license_url':self.license_url,
                'sha256':hashlib.sha256(self.path.read_bytes()).hexdigest() if self.path.is_file() else None,
                'publication_approved':False}

def required_label(source:MovingSource):
    return ('SIMULAÇÃO GRÁFICA • NÃO É REGISTRO HISTÓRICO'
            if source.kind=='synthetic_lab' else
            f'CONTEXTO • {source.location.upper()} • {source.capture_date or "DATA NÃO CONFIRMADA"}')

def staged_frame(clip:cv2.VideoCapture,seconds:float,width:int,height:int,source:MovingSource):
    if source.errors():raise ValueError('; '.join(source.errors()))
    if seconds<0:raise ValueError('negative clip time')
    clip.set(cv2.CAP_PROP_POS_MSEC,seconds*1000)
    ok,frame=clip.read()
    if not ok:raise ValueError('unable to decode source frame')
    ih,iw=frame.shape[:2]
    scale=max(width/iw,height/ih)*1.04
    rw,rh=max(width,round(iw*scale)),max(height,round(ih*scale))
    frame=cv2.resize(frame,(rw,rh),interpolation=cv2.INTER_LINEAR)
    x=(rw-width)//2;y=(rh-height)//2
    frame=frame[y:y+height,x:x+width].copy()
    if frame.shape[:2]!=(height,width):raise ValueError('bad crop')
    return frame

def verify_clip(path:Path):
    cap=cv2.VideoCapture(str(path))
    if not cap.isOpened():raise ValueError('undecodable clip')
    try:
        fps=cap.get(cv2.CAP_PROP_FPS)
        frames=cap.get(cv2.CAP_PROP_FRAME_COUNT)
        if fps<=0 or frames<2:raise ValueError('invalid clip timing')
        return {'fps':round(float(fps),3),'frame_count':int(frames),'duration_sec':round(frames/fps,3),
                'recorded_action_verified':False,'notice':'video motion is NOT provenance'}
    finally:cap.release()
