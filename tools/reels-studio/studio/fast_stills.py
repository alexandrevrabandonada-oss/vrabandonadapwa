"""Bounded prepared-image cache for fast deterministic virtual-camera photographs.

No source media is changed. The full image is resized only once per unique
asset and scene maximum zoom. Every frame crops from prepared pixels.
"""
from __future__ import annotations
from collections import OrderedDict
from dataclasses import dataclass
import math
import cv2
import numpy as np

@dataclass
class PreparedStill:
    full: np.ndarray
    max_zoom: float
    width: int
    height: int

    @classmethod
    def build(cls, src: np.ndarray, width: int, height: int, zoom: float):
        if src.ndim not in (2,3) or width<1 or height<1:
            raise ValueError('bad source image or dimensions')
        if not math.isfinite(zoom) or zoom<1 or zoom>2.5:
            raise ValueError('zoom out of bounds')
        h,w=src.shape[:2]
        factor=max(width/w,height/h)*zoom
        neww=max(width,math.ceil(w*factor));newh=max(height,math.ceil(h*factor))
        return cls(cv2.resize(src,(neww,newh),interpolation=cv2.INTER_LINEAR),zoom,width,height)

    def crop(self,fx:float=.5,fy:float=.5,zoom:float=1.0)->np.ndarray:
        if not all(math.isfinite(v) for v in (fx,fy,zoom)) or not 0<=fx<=1 or not 0<=fy<=1 or not 1<=zoom<=self.max_zoom+1e-5:
            raise ValueError('unsafe camera parameters')
        canvas_h,canvas_w=self.full.shape[:2]
        vieww=min(canvas_w,max(1,round(self.width*self.max_zoom/zoom)))
        viewh=min(canvas_h,max(1,round(self.height*self.max_zoom/zoom)))
        left=int(round(np.clip(fx*canvas_w-vieww/2,0,canvas_w-vieww)))
        top=int(round(np.clip(fy*canvas_h-viewh/2,0,canvas_h-viewh)))
        view=self.full[top:top+viewh,left:left+vieww]
        if (vieww,viewh)==(self.width,self.height):return view.copy()
        return cv2.resize(view,(self.width,self.height),interpolation=cv2.INTER_LINEAR)

class BoundedStillCache:
    def __init__(self,limit_bytes=96*1024*1024):
        self.limit_bytes=int(limit_bytes)
        self.entries=OrderedDict()
        self.bytes=0;self.hits=0;self.misses=0;self.skipped=0

    def get(self,key,src,width,height,max_zoom):
        if key in self.entries:
            self.entries.move_to_end(key);self.hits+=1
            return self.entries[key]
        self.misses+=1
        height0,width0=src.shape[:2]
        factor=max(width/width0,height/height0)*max_zoom
        predicted=max(width,math.ceil(width0*factor))*max(height,math.ceil(height0*factor))*src.dtype.itemsize*(src.shape[2] if src.ndim==3 else 1)
        if predicted>self.limit_bytes:
            self.skipped+=1
            return None
        while self.bytes+predicted>self.limit_bytes and self.entries:
            _,prior=self.entries.popitem(last=False)
            self.bytes-=prior.full.nbytes
        entry=PreparedStill.build(src,width,height,max_zoom)
        self.entries[key]=entry;self.bytes+=entry.full.nbytes
        return entry

    def stats(self):
        return {'hits':self.hits,'misses':self.misses,'skipped':self.skipped,
                'resident_bytes':self.bytes,'entries':len(self.entries),
                'limit_bytes':self.limit_bytes}
