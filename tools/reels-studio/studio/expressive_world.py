"""AÇO GRÁFICO V0.9: original industrial expressive motion engine.

Authorial design principles: deep environmental composition, rough printing,
heavy brutalist geometry, editorial storytelling. Film-inspired general
principles only; no Spider-Verse characters, art, frames or marks.

Primary-source imagery is only repositioned/cropped/zoomed; no false alteration
of historical contents. Experimental audiovisual internal use only.
"""
from __future__ import annotations
import json, math, functools
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

PALETTE={
  'ink':(12,16,27), 'cream':(250,237,201), 'electric':(24,182,251),
  'cobalt':(38,48,184),'fuchsia':(229,34,145),'molten':(253,91,33),
  'signal':(252,221,58), 'rust':(139,40,42)
}
LABELS={"context":"IMAGEM INDUSTRIAL DE CONTEXTO  •  DATA NÃO VERIFICADA",
        "archive":"FONTE: A NOITE  •  29 JAN 1962  •  FAC-SÍMILE"}
BASE=Path(__file__).resolve().parent.parent
FONT='/usr/share/fonts/truetype/lato/Lato-Heavy.ttf'
MONO='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'

def smooth(x:float)->float:
    x=max(0.,min(1.,x));return x*x*(3-2*x)

def ease_out(x:float)->float:
    x=max(0.,min(1.,x));return 1-(1-x)**3

def validate_manifest(man:dict,root:Path=BASE)->list[str]:
    errors=[]
    if man.get('visual_rules',{}).get('publication_blocked') is not True:
        errors.append('publication must remain blocked')
    scenes=man.get('scenes',[]);srcs=man.get('sources',{})
    if not scenes:errors.append('scenes missing')
    if len(scenes)>14:errors.append('too many scenes')
    ids=set()
    for i,s in enumerate(scenes):
        if s.get('id') in ids:errors.append(f'scene {i} repeated id')
        ids.add(s.get('id'))
        if s.get('source') not in srcs:errors.append(f'scene {i} unknown source')
        if s.get('kind') not in ('industrial_world','document_world'):errors.append(f'scene {i} unsupported world')
        if not .6<=float(s.get('duration',0))<=12:errors.append(f'scene {i} invalid duration')
        if s.get('accent') not in ('electric','molten','signal'):errors.append(f'scene {i} invalid accent')
        if s.get('kind')=='document_world' and srcs.get(s.get('source'),{}).get('role')!='archival_newspaper':
            errors.append(f'scene {i} original document required')
        if s.get('kind')=='industrial_world' and srcs.get(s.get('source'),{}).get('role')=='archival_newspaper':
            errors.append(f'scene {i} archival image cannot be expressive graded')
    for key,v in srcs.items():
        p=(root/v['path']).resolve()
        if not p.is_relative_to(root.resolve()):errors.append(f'{key} unsafe path')
        if not p.is_file():errors.append(f'{key} image missing')
        if v.get('rights') not in ('pending','restricted','cleared'):errors.append(f'{key} missing rights status')
        if not v.get('on_screen_label'):errors.append(f'{key} on-screen provenance label required')
    return errors

@functools.lru_cache(maxsize=12)
def type_image(words:str,size:int,color:tuple[int,int,int],stroke:int=0,stroke_color=(0,0,0))->np.ndarray:
    f=ImageFont.truetype(FONT,size)
    bbox=f.getbbox(words,stroke_width=stroke)
    w=max(1,bbox[2]-bbox[0]+10);h=max(1,bbox[3]-bbox[1]+10)
    im=Image.new('RGBA',(w,h),(0,0,0,0))
    ImageDraw.Draw(im).text((5-bbox[0],5-bbox[1]),words,font=f,fill=(*color,255),stroke_width=stroke,stroke_fill=(*stroke_color,255))
    return np.array(im)

@functools.lru_cache(maxsize=16)
def micro_label(text:str)->np.ndarray:
    font=ImageFont.truetype(MONO,13)
    bbox=font.getbbox(text);im=Image.new('RGBA',(bbox[2]+9,26),(0,0,0,0))
    ImageDraw.Draw(im).text((1,1),text,font=font,fill=(*PALETTE['cream'],255))
    return np.array(im)

def blend(canvas:np.ndarray,rgba:np.ndarray,x:int,y:int,alpha:float=1.0):
    h,w=canvas.shape[:2];hh,ww=rgba.shape[:2]
    x0=max(x,0);y0=max(y,0);x1=min(x+ww,w);y1=min(y+hh,h)
    if x0>=x1 or y0>=y1:return
    src=rgba[y0-y:y1-y,x0-x:x1-x]
    if src.shape[2]==4:
        a=src[:,:,3:4].astype(np.float32)/255*alpha
        c=src[:,:,:3]
    else:a=alpha;c=src
    dst=canvas[y0:y1,x0:x1]
    canvas[y0:y1,x0:x1]=np.uint8(np.clip(dst*(1-a)+c*a,0,255))

def draw_speckle(frame:np.ndarray,sec:float,rate:float=.7):
    h,w=frame.shape[:2]
    # deterministic screen-print noise; animated in time, not stochastic flicker
    ty,tx=np.mgrid[0:h:12,0:w:12]
    mask=((tx*41+ty*17)%11<2)&((tx*5+ty*7+int(sec*4)*19)%13<3)
    xy=np.column_stack([tx[mask],ty[mask]])
    for x,y in xy[::2]:cv2.circle(frame,(int(x),int(y)),1,PALETTE['cream'],cv2.FILLED,cv2.LINE_AA)

def image_cover(img:np.ndarray,w:int,h:int,panx:float=.5,pany:float=.5,zoom:float=1.0)->np.ndarray:
    hi,wi=img.shape[:2]
    scale=max(w/wi,h/hi)*zoom
    nw=max(w,math.ceil(wi*scale));nh=max(h,math.ceil(hi*scale))
    resized=cv2.resize(img,(nw,nh),interpolation=cv2.INTER_LINEAR)
    x=int(max(0,min(nw-w,(nw-w)*panx)));y=int(max(0,min(nh-h,(nh-h)*pany)))
    return resized[y:y+h,x:x+w].copy()

def color_photo(image:np.ndarray,accent:str)->np.ndarray:
    rgb=cv2.cvtColor(image,cv2.COLOR_BGR2RGB).astype(np.float32)
    # split-toning without generating evidence or changing structural content
    lum=np.mean(rgb,axis=2,keepdims=True)/255
    if accent=='molten': shadow=np.array([13,14,52]);high=np.array([255,137,74])
    else:shadow=np.array([12,37,78]);high=np.array([242,112,128])
    grade=rgb*.59+((1-lum)*shadow+lum*high)*.41
    grade=np.clip((grade-112)*1.13+112,0,255)
    return grade.astype(np.uint8)

def skew_photo(img:np.ndarray,quad:np.ndarray,outw:int,outh:int)->tuple[np.ndarray,np.ndarray]:
    hi,wi=img.shape[:2]
    source=np.float32([[0,0],[wi-1,0],[wi-1,hi-1],[0,hi-1]])
    H=cv2.getPerspectiveTransform(source,np.float32(quad))
    warped=cv2.warpPerspective(img,H,(outw,outh),borderValue=(0,0,0))
    mask=np.full((hi,wi),255,np.uint8)
    m=cv2.warpPerspective(mask,H,(outw,outh))
    return warped,m

def paste_warp(canvas:np.ndarray,photo:np.ndarray,quad,edge:tuple):
    h,w=canvas.shape[:2];warped,mask=skew_photo(photo,np.array(quad,np.float32),w,h)
    a=(mask.astype(np.float32)/255)[:,:,None]
    canvas[:]=np.uint8(canvas*(1-a)+warped*a)
    pts=np.array(quad,np.int32)
    cv2.polylines(canvas,[pts],True,edge,3,cv2.LINE_AA)

def halftone_corner(frame:np.ndarray,offset:int,circle_color:tuple,limit_y:int=430):
    h,w=frame.shape[:2]
    for y in range(12,min(limit_y,h),17):
        for x in range(8,w-10,17):
            rad=2+int((x+y+offset)%5<2)
            if x<140 or (y<160 and x>280):cv2.circle(frame,(x,y),rad,circle_color,-1,cv2.LINE_AA)

def vignette_bar(frame:np.ndarray,top:int,color:tuple):
    h,w=frame.shape[:2]
    cv2.rectangle(frame,(0,top),(w,top+44),color,-1)

class ExpressiveWorld:
    def __init__(self,manifest:dict,root:Path=BASE):
        problems=validate_manifest(manifest,root)
        if problems:raise ValueError('; '.join(problems))
        self.man=manifest;self.root=root
        self.w=int(manifest['output']['width']);self.h=int(manifest['output']['height'])
        self.fps=int(manifest['output']['fps'])
        self.sources={key:cv2.cvtColor(cv2.imread(str(root/src['path'])),cv2.COLOR_BGR2RGB)
                      for key,src in manifest['sources'].items()}
        self.prepared={}
        for s in manifest['scenes']:
            if s['kind']!='industrial_world':continue
            im=self.sources[s['source']]
            self.prepared[s['id']]=color_photo(image_cover(im,self.w+125,self.h+125,zoom=1.01),s['accent'])
        self.timeline=[];sec=0
        for s in manifest['scenes']:
            self.timeline.append((sec,sec+s['duration'],s));sec+=s['duration']
        self.duration=sec
    def frame(self,t:float)->np.ndarray:
        t=max(0.,min(self.duration-1e-5,t))
        start,end,s=next((a,b,ss) for a,b,ss in self.timeline if a<=t<b)
        p=(t-start)/(end-start)
        if s['kind']=='industrial_world':return self.industrial(s,p,t)
        return self.document(s,p,t)
    def industrial(self,s:dict,p:float,t:float)->np.ndarray:
        w,h=self.w,self.h
        # Contrasting world of several surfaces, diagonal forced perspective
        bg=np.zeros((h,w,3),np.uint8);bg[:]=PALETTE['ink']
        blue=PALETTE['cobalt'];mag=PALETTE['fuchsia'];hot=PALETTE['molten'];a=PALETTE[s['accent']]
        cv2.fillConvexPoly(bg,np.array([[0,0],[w,0],[w,round(420+45*p)],[0,round(650-60*p)]],np.int32),blue)
        cv2.fillConvexPoly(bg,np.array([[0,620],[w,320],[w,780],[0,960]],np.int32),mag)
        # coordinate grid suggests architectural space; vanishing toward image
        origin=np.array([w*.7,h*.32]);
        for k in range(-7,9):
            bottom=(k*100,960)
            cv2.line(bg,(int(origin[0]+(p-.5)*30),int(origin[1])),bottom,(24,15,63),1,cv2.LINE_AA)
        # Three independently directed shot systems: not one repeated template.
        motion=s['motion'];im=self.prepared[s['id']]
        h0,w0=im.shape[:2]
        def crop_region(xfrac,yfrac):
            xx=int(max(0,min(w0-w,(w0-w)*xfrac)))
            yy=int(max(0,min(h0-h,(h0-h)*yfrac)))
            return im[yy:yy+h,xx:xx+w]
        if motion=='tilt_punch':
            drive=ease_out(min(p*2,1));dx=int((1-drive)*130-37*p);dy=int((1-drive)*-140+28*p)
            q=[[22+dx,170+dy],[w-34+dx,110+dy],[w+dx,760+dy],[-18+dx,812+dy]]
            paste_warp(bg,crop_region(.28+.48*p,.75-.32*p),q,a)
            bx=int(-180+140*p)
            cv2.fillConvexPoly(bg,np.array([[bx,130],[bx+80,130],[bx+375,935],[bx+294,935]],np.int32),PALETTE['ink'])
            cv2.line(bg,(bx+79,130),(bx+375,935),a,7,cv2.LINE_AA)
            cv2.circle(bg,(w-5,120+int(23*np.sin(p*np.pi))),115,a,-1,cv2.LINE_AA)
            cv2.circle(bg,(w-5,120+int(23*np.sin(p*np.pi))),79,PALETTE['ink'],-1,cv2.LINE_AA)
            text=s['title'];size=88
            title=type_image(text,size,PALETTE['cream'],2,PALETTE['ink'])
            y=int(665+26*(1-ease_out(min(p*3,1))))
            blend(bg,title,18,y)
            cv2.rectangle(bg,(18,y-12),(min(w-18,18+int((w-34)*min(1,p*3))),y-4),a,-1)
        elif motion=='opposing_planes':
            # Two original-photo details on different physical planes. Opposing movement.
            shift= int(140*(1-ease_out(min(1,p*2.5))))
            upper=[[10+shift,70],[w-38+shift,15],[w+20+shift,515],[-40+shift,550]]
            lower=[[-95-shift,495],[w-45-shift,560],[w+30-shift,895],[-55-shift,875]]
            paste_warp(bg,crop_region(.12+.38*p,.08),upper,PALETTE['signal'])
            paste_warp(bg,crop_region(.89-.3*p,.9),lower,a)
            # High-contrast black fracture: typography occupies the collision.
            cv2.fillConvexPoly(bg,np.array([[-20,455],[w+20,395],[w+20,585],[-20,644]],np.int32),PALETTE['ink'])
            cv2.line(bg,(0,461),(w,400),PALETTE['cream'],5,cv2.LINE_AA)
            title=type_image('FORJADA',101,PALETTE['cream'],2,PALETTE['ink'])
            if title.shape[1]>w-38:
                ww=w-38;title=cv2.resize(title,(ww,int(title.shape[0]*ww/title.shape[1])))
            blend(bg,title,18+int(22*(1-ease_out(min(p*3,1)))),455)
            # Add recognizably industrial signal geometry, not random sparkle.
            for k in range(5):
                cv2.line(bg,(390+k*20,620+int(p*30)),(w+40,700+k*15+int(p*30)),a,3,cv2.LINE_AA)
        elif motion=='diagonal_rush':
            # Abrupt depth dive: image bleeds beyond screen and foreground structures wipe.
            shift=int(110*(1-ease_out(min(1,p*2.2))))
            full=crop_region(.2+.5*p,.42-.32*p)
            quad=[[-50-shift,-25],[w+55,45-shift],[w+48,844],[15,790+shift]]
            paste_warp(bg,full,quad,PALETTE['signal'])
            cv2.fillConvexPoly(bg,np.array([[w-130,0],[w,0],[w,950],[w-25,950]],np.int32),PALETTE['cobalt'])
            cv2.line(bg,(w-150,0),(w-45,850),PALETTE['electric'],8,cv2.LINE_AA)
            for k in range(7):
                yy=int(220+k*90-55*p)
                cv2.line(bg,(-40,yy+70), (320,yy-10),PALETTE['cream'] if k%2==0 else PALETTE['signal'],2,cv2.LINE_AA)
            cv2.fillConvexPoly(bg,np.array([[0,640],[w,567],[w,810],[0,880]],np.int32),PALETTE['ink'])
            title=type_image('NO AÇO',100,PALETTE['cream'],2,PALETTE['ink'])
            if title.shape[1]>w-36:
                ww=w-36;title=cv2.resize(title,(ww,int(title.shape[0]*ww/title.shape[1])))
            blend(bg,title,20,662+int(35*(1-ease_out(min(1,p*3,1)))))
            cv2.line(bg,(20,650),(w-20,580),a,9,cv2.LINE_AA)
        else:raise ValueError('unsupported camera choreography')
        # Dynamic printed surface / analog registration; only on graphic context.
        for i in range(5):
            y=int((130+i*157+135*p)%(h+160)-80)
            cv2.line(bg,(w-55,y),(w+80,y-46),PALETTE['cream'] if i%2==0 else a,1,cv2.LINE_AA)
        halftone_corner(bg,int(p*2),PALETTE['signal'],260)
        draw_speckle(bg,t)
        vignette_bar(bg,915,PALETTE['ink'])
        blend(bg,micro_label(self.man['sources'][s['source']]['on_screen_label']),14,927)
        return bg
    def document(self,s:dict,p:float,t:float)->np.ndarray:
        w,h=self.w,self.h;bg=np.zeros((h,w,3),np.uint8);bg[:]=(15,16,27)
        # Graphic world outside evidence frame: restrained blue/copper geometry
        cv2.fillConvexPoly(bg,np.array([[0,0],[w,0],[w,190],[0,350]],np.int32),PALETTE['cobalt'])
        cv2.fillConvexPoly(bg,np.array([[0,650],[w,530],[w,960],[0,960]],np.int32),PALETTE['rust'])
        halftone_corner(bg,0,PALETTE['signal'],250)
        source=self.sources[s['source']]  # original page RGB, no grading
        ih,iw=source.shape[:2]
        # Full facsimile then smoothly zoom into the authentic article on upper right.
        # Camera only changes crop; no reconstruction or text rewriting.
        focus=(.40,.045,.995,.475)
        if p<.25:q=0.
        else:q=smooth((p-.25)/.45)
        x1=int(iw*focus[0]*q);y1=int(ih*focus[1]*q)
        x2=int(iw*(1+(focus[2]-1)*q));y2=int(ih*(1+(focus[3]-1)*q))
        roi=source[y1:y2,x1:x2]
        rh,rw=roi.shape[:2];scale=min((w-48)/rw,(h-265)/rh)
        tw=max(1,int(rw*scale));th=max(1,int(rh*scale));paper=cv2.resize(roi,(tw,th))
        x=(w-tw)//2;y=140+(h-300-th)//2
        # page remains source pixels, no overlaid type
        cv2.rectangle(bg,(x-8,y-9),(x+tw+8,y+th+9),(20,12,51),-1)
        cv2.rectangle(bg,(x-4,y-5),(x+tw+4,y+th+5),PALETTE['cream'],-1)
        bg[y:y+th,x:x+tw]=paper
        cv2.rectangle(bg,(0,0),(w,108),PALETTE['ink'],-1)
        big=type_image('29 JAN 1962',65,PALETTE['cream'])
        if big.shape[1]>w-20:big=cv2.resize(big,(w-20,round(big.shape[0]*(w-20)/big.shape[1])))
        blend(bg,big,12,24)
        # headline details uncovered by camera; no fake historic quotations
        cv2.line(bg,(24,115),(w-24,115),PALETTE['signal'],5)
        if p>.72:
            note=type_image('A NOITE / VOLTA REDONDA',24,PALETTE['signal'])
            blend(bg,note,28,833,int(min(1,(p-.72)/.16)))
        vignette_bar(bg,915,PALETTE['ink']);blend(bg,micro_label(self.man['sources'][s['source']]['on_screen_label']),14,927)
        return bg

def load_manifest(filename:Path)->dict:
    return json.loads(filename.read_text(encoding='utf8'))