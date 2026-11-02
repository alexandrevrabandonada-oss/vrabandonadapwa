"""Aço Gráfico V18 — two real, authenticated audiovisual sources with source-specific context.

Cinematic grammar: human action -> industrial scale -> simultaneous comparison.
Original source pixels are not represented as recordings from CSN or Brazil.
No publication is authorized, and no synthesized event footage is involved.
"""
from __future__ import annotations
import argparse, hashlib, json, math, subprocess
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SOURCES={
 'senegal':{
  'sha1':'cacc1db79fd88d7da28eb8783a57514159a5a3c1',
  'url':'https://commons.wikimedia.org/wiki/File:Armature_en_acier_de_pliage.webm',
  'credit':'4MAPS / Demba Welle',
  'country':'Senegal','year':'2024','license':'CC BY-SA 4.0',
  'license_url':'https://creativecommons.org/licenses/by-sa/4.0/'},
 'france':{
  'sha1':'c1129cac8654866856c7bec31196206f16eac6c7',
  'url':'https://commons.wikimedia.org/wiki/File:Vicart_-_Aci%C3%A9rie.webm',
  'credit':'Damien Vicart',
  'country':'Franca','year':'2011','license':'CC BY 3.0',
  'license_url':'https://creativecommons.org/licenses/by/3.0/'}}
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'
PALETTE={'blue':(24,22,69),'pink':(230,49,121),'yellow':(255,224,82),'white':(241,240,234)}

def source_check(path:Path,identity:str)->dict:
    if identity not in SOURCES:raise ValueError('unknown media identity')
    if not path.is_file():raise FileNotFoundError(path)
    digest=hashlib.sha1(path.read_bytes()).hexdigest()
    if digest!=SOURCES[identity]['sha1']:
        raise ValueError(f'HASH_MISMATCH {identity}: original source is not verified')
    return {'sha1':digest,'size_bytes':path.stat().st_size,**SOURCES[identity]}

class Reader:
    def __init__(self,path):
        self.cap=cv2.VideoCapture(str(path))
        if not self.cap.isOpened():raise ValueError(f'cannot decode source: {path}')
        self.fps=self.cap.get(cv2.CAP_PROP_FPS)
        if self.fps<=0:raise ValueError('missing source frame rate')
        self.index=-1;self.cached=None
    def at(self,seconds):
        frame_id=max(0,round(seconds*self.fps))
        if frame_id<self.index:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES,0)
            self.index=-1;self.cached=None
        while self.index<frame_id:
            ok,frame=self.cap.read()
            if not ok:raise ValueError(f'source clip truncated at frame {frame_id}')
            self.cached=frame;self.index+=1
        return self.cached
    def close(self):self.cap.release()

def cover(src,w,h,fx=.5,fy=.5,zoom=1):
    ih,iw=src.shape[:2]
    factor=max(w/iw,h/ih)*zoom
    iw2=max(w,round(iw*factor));ih2=max(h,round(ih*factor))
    scaled=cv2.resize(src,(iw2,ih2),interpolation=cv2.INTER_AREA if factor<1 else cv2.INTER_LINEAR)
    x=round(np.clip(fx*iw2-w/2,0,iw2-w))
    y=round(np.clip(fy*ih2-h/2,0,ih2-h))
    return scaled[y:y+h,x:x+w].copy()

def film_color(src,pink=False):
    a=src.astype(np.float32)
    grade=np.array([7,2,19] if pink else [18,4,-3],np.float32)
    return np.clip((a-127)*1.14+127+grade,0,255).astype('uint8')

def stage(readers,t,w,h)->np.ndarray:
    # All 3 grammars use recorded motion, not generated machinery.
    if t<3.5:
        u=t/3.5
        image=readers['senegal'].at(.35+t)
        return film_color(cover(image,w,h,.48+.035*u,.52,1.04+.09*u),pink=True)
    if t<7:
        u=(t-3.5)/3.5
        image=readers['france'].at(.4+t-3.5)
        result=np.empty((h,w,3),np.uint8);result[:]=(23,17,53)
        img=cover(image,w,round(h*.54),.45+.10*u,.46,1.01)
        y=round(h*.215)
        result[y:y+img.shape[0]]=img
        stripe=cover(image,w,round(h*.15),.69,.50,1.32)
        result[round(h*.075):round(h*.075)+len(stripe)]=stripe
        return film_color(result)
    if t<10.5:
        u=t-7
        left=readers['senegal'].at(4.3+u)
        right=readers['france'].at(4.3+u)
        result=np.empty((h,w,3),np.uint8);result[:]=(11,17,47)
        w1=round(w*.55)
        result[round(h*.14):round(h*.84),:w1]=cover(left,w1,round(h*.70),.52,.52,1.10)
        y0=round(h*.22);y1=round(h*.84)
        result[y0:y1,w1:]=cover(right,w-w1,y1-y0,.56,.45,1.05)
        cv2.line(result,(w1,round(h*.16)),(w1,round(h*.83)),(42,80,240),max(3,w//120))
        return film_color(result,pink=True)
    u=t-10.5
    src=readers['senegal'].at(7.8+u)
    return film_color(cover(src,w,h,.48-.035*u,.56,1.22-.06*u),pink=True)

def text_frame(frame,t,w,h)->np.ndarray:
    # Bold paper texture and structural diagonals; credits remain readable.
    im=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)).convert('RGBA')
    gfx=Image.new('RGBA',(w,h),(0,0,0,0))
    d=ImageDraw.Draw(gfx)
    p=w/720;edge=round(.055*w)
    def f(size):return ImageFont.truetype(FONT,round(size*p))
    d.polygon([(0,0),(int(w*.90),0),(int(w*.58),int(h*.145)),(0,int(h*.17))],fill=(*PALETTE['blue'],232))
    d.polygon([(w,0),(w,int(h*.22)),(int(w*.84),int(h*.17))],fill=(*PALETTE['pink'],220))
    t1,t2=(
      ('AÇO','TEM MÃOS') if t<3.5 else
      ('AÇO','TEM ESCALA') if t<7 else
      ('TRABALHO','E INDÚSTRIA') if t<10.5 else
      ('AÇO','TEM HISTÓRIAS'))
    d.text((edge,int(h*.03)),t1,font=f(68),fill=(*PALETTE['white'],255),stroke_width=1)
    d.text((edge,int(h*.095)),t2,font=f(63 if len(t2)<12 else 53),fill=(*PALETTE['yellow'],255))
    # Source labels are permanently on screen, not a credit hidden at the end.
    d.rectangle((0,int(h*.85),w,h),fill=(10,12,31,244))
    d.rectangle((edge,int(h*.848),int(w*.945),int(h*.854)),fill=(*PALETTE['pink'],255))
    if t<3.5 or t>=10.5:
        d.text((edge,int(h*.864)),'SENEGAL 2024  ·  CONTEXTO',font=f(28),fill=(*PALETTE['yellow'],255))
        d.text((edge,int(h*.904)),'4MAPS / DEMBA WELLE  ·  CC BY-SA 4.0',font=f(19),fill=(*PALETTE['white'],255))
    elif t<7:
        d.text((edge,int(h*.864)),'FRANÇA 2011  ·  CONTEXTO',font=f(28),fill=(*PALETTE['yellow'],255))
        d.text((edge,int(h*.904)),'DAMIEN VICART  ·  CC BY 3.0',font=f(22),fill=(*PALETTE['white'],255))
    else:
        d.text((edge,int(h*.864)),'SENEGAL 2024 + FRANÇA 2011',font=f(28),fill=(*PALETTE['yellow'],255))
        d.text((edge,int(h*.904)),'4MAPS / DEMBA WELLE + DAMIEN VICART',font=f(19),fill=(*PALETTE['white'],255))
    d.text((edge,int(h*.947)),'IMAGENS REAIS DE CONTEXTO  ·  NÃO SÃO DA CSN',font=f(19),fill=(*PALETTE['white'],245))
    return cv2.cvtColor(np.array(Image.alpha_composite(im,gfx).convert('RGB')),cv2.COLOR_RGB2BGR)

def run(paths:dict[str,Path],out:Path,*,w=540,h=960,fps=24,seconds=12,strict=True):
    if w<270 or h<480 or fps not in (24,30):raise ValueError('unsupported output settings')
    if abs(seconds-12)>.001:raise ValueError('V18 EDL requires 12 seconds')
    checked={k:source_check(paths[k],k) for k in ('senegal','france')} if strict else {'simulation_test_only':True}
    readers={k:Reader(v) for k,v in paths.items()}
    out.parent.mkdir(parents=True,exist_ok=True)
    silent=out.with_name(out.stem+'_video_only.mp4')
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*'mp4v'),fps,(w,h))
    if not writer.isOpened():raise RuntimeError('encoder failed')
    try:
        for i in range(round(seconds*fps)):
            t=i/fps
            writer.write(text_frame(stage(readers,t,w,h),t,w,h))
    finally:
        writer.release()
        for rdr in readers.values():rdr.close()
    # One SOURCE's on-location soundtrack only; no fabricated historical recording.
    cmd=['ffmpeg','-y','-loglevel','error','-i',str(silent),'-i',str(paths['senegal']),
        '-map','0:v:0','-map','1:a?','-t',str(seconds),'-c:v','libx264',
        '-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',
        '-af','acompressor=threshold=0.08:ratio=3:attack=10:release=150,loudnorm=I=-16:LRA=8:TP=-1.5',
        '-movflags','+faststart',str(out)]
    subprocess.run(cmd,check=True)
    meta={'version':'v0.18','internal_only':True,'source_integrity':checked,
          'scene_grammars':['human_action','industrial_scale','cross_source_split','human_return'],
          'native_size':[w,h],'fps':fps,'duration_sec':seconds,
          'not_CSN_footage':True,'not_recording_of_1962':True,
          'audio':'location sound from Senegal clip; NO Alexandre voice','publication_authorized':False,
          'adaptations':['crop/reframing','contrast/grade','editorial split','title + credits']}
    out.with_suffix('.json').write_text(json.dumps(meta,indent=2,ensure_ascii=False))
    return meta

if __name__=='__main__':
    a=argparse.ArgumentParser()
    a.add_argument('--senegal',type=Path,required=True)
    a.add_argument('--france',type=Path,required=True)
    a.add_argument('--output',type=Path,required=True)
    a.add_argument('--width',type=int,default=540)
    a.add_argument('--height',type=int,default=960)
    a.add_argument('--fps',type=int,default=24)
    args=a.parse_args()
    print(json.dumps(run({'senegal':args.senegal,'france':args.france},args.output,
                         w=args.width,h=args.height,fps=args.fps),indent=2,ensure_ascii=False))
