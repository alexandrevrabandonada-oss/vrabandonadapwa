"""Reusable photographic cinema operators. No synthetic facts or documentary alterations."""
from __future__ import annotations
import cv2
import numpy as np

GRADES = {'neutral', 'molten', 'steel-blue', 'silver', 'industrial-ink'}

def filmic_grade(frame:np.ndarray, kind:str='neutral', intensity:float=.65, frame_index:int=0)->np.ndarray:
    if kind not in GRADES:raise ValueError('unknown cinematic grade')
    if not 0<=intensity<=1:raise ValueError('grade intensity out of range')
    if kind=='neutral' or intensity==0:return frame.copy()
    h,w=frame.shape[:2];im=frame.astype(np.float32)/255.
    lum=im.mean(axis=2,keepdims=True)
    if kind=='silver':
        gray=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY).astype(np.float32)/255.
        neutral=np.repeat(gray[...,None],3,axis=2)
        im=im*(1-intensity*.76)+neutral*(intensity*.76)
        im+=np.array([.014,.008,-.008],np.float32)*intensity
    else:
        if kind=='molten':shadow=np.array([.015,-.024,-.025],np.float32);bright=np.array([-.014,.016,.075],np.float32)
        elif kind=='steel-blue':shadow=np.array([.068,.005,-.028],np.float32);bright=np.array([.022,.010,-.012],np.float32)
        else:shadow=np.array([.053,-.013,-.025],np.float32);bright=np.array([-.019,.014,.056],np.float32)
        im+=intensity*(np.clip((.49-lum)*2.2,0,1)*shadow+np.clip((lum-.52)*2.,0,1)*bright)
    yy,xx=np.indices((h,w),dtype=np.int32)
    grain=((xx*13+yy*17+(frame_index//2)*11)%47)/47.-.5
    im+=grain[:,:,None]*(intensity*.022)
    return np.uint8(np.clip(im*255,0,255))

def camera_plane(frame:np.ndarray,progress:float,amount:float=.014)->np.ndarray:
    if not 0<=amount<=.05:raise ValueError('camera amount out of range')
    h,w=frame.shape[:2];t=np.clip(progress,0,1)
    swing=np.sin(np.pi*(t-.5))*amount
    pts=np.float32([[0,0],[w-1,0],[w-1,h-1],[0,h-1]])
    inset=w*.025;insety=h*.018
    dst=np.float32([[inset+w*swing,insety],[w-1-inset-w*swing,insety-h*swing*.3],
                    [w-1-inset+w*swing,h-1-insety],[inset-w*swing,h-1-insety+h*swing*.3]])
    mat=cv2.getPerspectiveTransform(pts,dst)
    return cv2.warpPerspective(frame,mat,(w,h),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)

def light_pass(frame:np.ndarray,progress:float,mode:str='warm',opacity:float=.24)->np.ndarray:
    if mode not in {'warm','cool'}:raise ValueError('light mode invalid')
    if not 0<=opacity<=.5:raise ValueError('light opacity invalid')
    h,w=frame.shape[:2];lh,lw=max(32,h//8),max(32,w//8)
    yy,xx=np.indices((lh,lw),dtype=np.float32)
    sx=(.2+.58*np.clip(progress,0,1))*lw;sy=.25*lh
    dist=((xx-sx)/(.62*lw))**2+((yy-sy)/(.85*lh))**2
    light=cv2.resize(np.exp(-2.8*dist).astype(np.float32),(w,h),interpolation=cv2.INTER_LINEAR)[:,:,None]
    color=np.array([36,115,255] if mode=='warm' else [255,156,69],np.float32)
    return np.uint8(np.clip(frame.astype(np.float32)+light*color*opacity,0,255))

def softened_mask(mask:np.ndarray,softness:int=11)->np.ndarray:
    if mask.ndim==3:mask=cv2.cvtColor(mask[:,:,:3],cv2.COLOR_BGR2GRAY)
    k=max(1,int(softness)|1)
    return cv2.GaussianBlur(mask,(k,k),0)

def depth_compose(background:np.ndarray,foreground:np.ndarray,mask:np.ndarray,focus:float=.15)->np.ndarray:
    if background.shape!=foreground.shape:raise ValueError('layer sizes differ')
    if not 0<=focus<=1:raise ValueError('focus out of range')
    if focus:
        soft=cv2.GaussianBlur(background,(0,0),sigmaX=.35+focus*3.4)
        background=cv2.addWeighted(background,1-focus*.65,soft,focus*.65,0)
    alpha=softened_mask(mask).astype(np.float32)[:,:,None]/255
    return np.uint8(np.clip(background.astype(float)*(1-alpha)+foreground.astype(float)*alpha,0,255))

def documentary_stage(photo:np.ndarray,w:int,h:int,scale:float=1.,ink_color=(22,24,27))->np.ndarray:
    """Display whole source page, without cropping a historical headline."""
    if photo.ndim!=3:raise ValueError('document must be a three-channel image')
    hh,ww=photo.shape[:2]
    sf=min(w*.95/ww,h*.90/hh)*min(1.,max(.8,scale))
    tw,th=max(1,round(ww*sf)),max(1,round(hh*sf))
    resized=cv2.resize(photo,(tw,th),interpolation=cv2.INTER_AREA if sf<1 else cv2.INTER_LINEAR)
    canvas=np.zeros((h,w,3),np.uint8);canvas[:]=ink_color
    x=(w-tw)//2;y=(h-th)//2
    # Shadow belongs to the stage, not the original document.
    shadow=np.zeros_like(canvas);cv2.rectangle(shadow,(x+6,y+8),(x+tw+6,y+th+8),(4,7,9),-1)
    shadow=cv2.GaussianBlur(shadow,(0,0),12)
    mask=np.zeros((h,w),np.uint8);cv2.rectangle(mask,(x+6,y+8),(x+tw+6,y+th+8),255,-1)
    alpha=cv2.GaussianBlur(mask,(0,0),12).astype(np.float32)[:,:,None]/255
    canvas=np.uint8(canvas*(1-alpha*.48)+shadow*(alpha*.48))
    canvas[y:y+th,x:x+tw]=resized
    return canvas
