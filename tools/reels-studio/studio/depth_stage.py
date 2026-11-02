"""Registered-photo 2.5D stage: moving layers and genuine foreground occlusion.

Inputs: photographic source, derived inpainted background and foreground mask.
Derivatives are illustration tools, not primary historical evidence.
"""
from __future__ import annotations
from dataclasses import dataclass
import cv2
import numpy as np

@dataclass
class DepthStage:
    foreground: np.ndarray
    background: np.ndarray
    mask: np.ndarray
    width: int
    height: int
    pan_x: float=.5
    pan_y: float=.5
    strength: float=1.

    def __post_init__(self):
        if self.foreground.shape[:2]!=self.background.shape[:2] or self.foreground.shape[:2]!=self.mask.shape[:2]:
            raise ValueError('mask and photos must share source coordinates')
        if self.foreground.ndim!=3 or self.foreground.shape[2]!=3 or self.background.ndim!=3 or self.background.shape[2]!=3:
            raise ValueError('three-channel image source required')
        if not (0<self.width<=2160 and 0<self.height<=3840 and 0<=self.pan_x<=1 and 0<=self.pan_y<=1 and 0<=self.strength<=1.5):
            raise ValueError('unsafe stage geometry')
        self._prepare()

    def _cover(self,img,w,h):
        ih,iw=img.shape[:2]
        scale=max(w/iw,h/ih)
        nw=max(w,round(iw*scale));nh=max(h,round(ih*scale))
        im=cv2.resize(img,(nw,nh),interpolation=cv2.INTER_LINEAR)
        x=round((nw-w)*self.pan_x);y=round((nh-h)*self.pan_y)
        return im[y:y+h,x:x+w].copy()

    def _prepare(self):
        self.pad=max(12,round(self.width*.075*self.strength))
        w=self.width+2*self.pad;h=self.height+2*self.pad
        self.back=self._cover(self.background,w,h)
        self.front=self._cover(self.foreground,w,h)
        raw=self.mask if self.mask.ndim==2 else cv2.cvtColor(self.mask,cv2.COLOR_BGR2GRAY)
        a=self._cover(raw,w,h).astype(np.float32)/255.
        kernel=max(3,round(self.width*.006)|1)
        self.alpha=np.clip(cv2.GaussianBlur(a,(kernel,kernel),0),0,1)

    def frame(self,progress:float,accent=(251,182,24),subtle:bool=False)->np.ndarray:
        if not np.isfinite(progress):raise ValueError('nonfinite time')
        t=float(np.clip(progress,0,1));e=t*t*(3-2*t)
        w,h=self.width,self.height;p=self.pad
        d=self.strength*(.85 if subtle else 1.)
        bdx=round(-w*.022*d*e);bdy=round(h*.012*d*e)
        fdx=round(w*.035*d*e);fdy=round(-h*.016*d*e)
        back=self.back[p+bdy:p+bdy+h,p+bdx:p+bdx+w]
        front=self.front[p+fdy:p+fdy+h,p+fdx:p+fdx+w]
        a=self.alpha[p+fdy:p+fdy+h,p+fdx:p+fdx+w]
        if back.shape[:2]!=(h,w) or front.shape[:2]!=(h,w):raise ValueError('insufficient overscan')
        if not subtle:
            scale=1+.14*(e*e*(3-2*e))*d
            matrix=cv2.getRotationMatrix2D((w*.5,h*.66),0,scale)
            front=cv2.warpAffine(front,matrix,(w,h),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
            a=cv2.warpAffine(a,matrix,(w,h),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=0)
        alpha=a[:,:,None]
        output=back.astype(np.float32)*(1-alpha)+front.astype(np.float32)*alpha
        if not subtle:
            rim=cv2.morphologyEx((a*255).astype(np.uint8),cv2.MORPH_GRADIENT,np.ones((5,5),np.uint8))
            rim=cv2.GaussianBlur(rim,(0,0),1.5).astype(np.float32)[:,:,None]/255.
            output=output*(1-rim*.24)+np.asarray(accent,np.float32)[None,None,:]*rim*.24
        return np.uint8(np.clip(output,0,255))
