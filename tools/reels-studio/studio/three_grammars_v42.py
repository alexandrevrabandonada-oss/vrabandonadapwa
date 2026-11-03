"""Aço Gráfico v0.42: three genuinely distinct motion grammars over intact, real sources.

Internal-only cinema lab. The visual source and its provenance are immutable;
editorial geometry is in a separate layer. No publication API; no voice claim.
"""
from __future__ import annotations
import argparse, hashlib, json, math, subprocess, wave
from dataclasses import dataclass
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W,H,FPS,DUR=1080,1920,30,6.0
BG=(20,22,30); CREAM=(232,237,241); AMBER=(40,197,244); CYAN=(225,209,53); PINK=(115,83,237)
SOURCES={
 '1941':('1941.tif','91d061df6f5fb7962d17c86948e656c335f1b0ca','ARQUIVO NACIONAL · CONSTRUÇÃO DA CSN · 1941'),
 '1969':('1969.jpg','1e16caba06722d121eaf3b88b39d89be910bb2a0','ARQUIVO NACIONAL · INTERIOR DA CSN · 1969'),
 '2014':('2014.jpg','6a792f0fd16ddd4c8bed2ca981788c9b9accb7a4','HENRIQUEBARRAMANSA · CSN · VOLTA REDONDA · 2014'),
 'france':('france_2011.webm','c1129cac8654866856c7bec31196206f16eac6c7','DAMIEN VICART · FILMAGEM SIDERÚRGICA · FRANÇA, 2011'),
 'rodovia':('rodovia_2017.webm','0974ee5e46efa3599f623e32c94fc0e0fd7da46a','TV BRASILGOV · REPORTAGEM RODOVIA DO CONTORNO · 2017'),
}
PROFILES={
 'arquivo':{'headline':'A MEMÓRIA DO AÇO','kicker':'1941  /  1969  /  2014','accent':AMBER,'sources':('1941','1969','2014'),'grammar':'archive_layers'},
 'industria':{'headline':'MATÉRIA EM MOVIMENTO','kicker':'FRANÇA  /  2011  /  CONTEXTO','accent':CYAN,'sources':('france',),'grammar':'industrial_shutters'},
 'telejornal':{'headline':'A CIDADE NA TELA','kicker':'RODOVIA DO CONTORNO  /  2017','accent':PINK,'sources':('rodovia',),'grammar':'broadcast_frames'},
}
FONT_HEAVY='/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'
FONT_BODY='/usr/share/fonts/truetype/lato/Lato-Semibold.ttf'


def sha1(path):
 h=hashlib.sha1()
 with Path(path).open('rb') as f:
  for c in iter(lambda:f.read(1024*1024),b''):h.update(c)
 return h.hexdigest()

def verify_sources(src:Path, profile:str):
 if profile not in PROFILES:raise ValueError('unknown editorial grammar')
 needed=PROFILES[profile]['sources']; out={}
 for item in needed:
  file_name,expected,label=SOURCES[item];p=src/file_name
  if not p.is_file() or sha1(p)!=expected:raise ValueError('source verification failed: '+item)
  out[item]={'file':str(p),'sha1':expected,'label':label}
 return out

class TextCache:
 def __init__(self):self.layers={}
 def get(self,text,size,accent=CREAM,heavy=True):
  key=text,size,accent,heavy
  if key not in self.layers:
   font=ImageFont.truetype(FONT_HEAVY if heavy else FONT_BODY,size)
   bbox=font.getbbox(text);w=bbox[2]-bbox[0]+18;h=bbox[3]-bbox[1]+22
   im=Image.new('RGBA',(w,h),(0,0,0,0));d=ImageDraw.Draw(im)
   d.text((9-bbox[0],10-bbox[1]),text,font=font,fill=(accent[2],accent[1],accent[0],255))
   b=np.asarray(im);self.layers[key]=b
  return self.layers[key]
 def paint(self,frame,text,x,y,size,color=CREAM,opacity=1.0,heavy=True):
  layer=self.get(text,size,color,heavy);h,w=layer.shape[:2];Hf,Wf=frame.shape[:2]
  x=int(x);y=int(y);i=max(0,x);j=max(0,y);a=min(Wf,x+w);b=min(Hf,y+h)
  if a<=i or b<=j:return
  cut=layer[j-y:b-y,i-x:a-x]
  alpha=(cut[:,:,3:4].astype('float32')/255)*max(0,min(1,opacity))
  roi=frame[j:b,i:a].astype('float32')
  frame[j:b,i:a]=np.uint8(roi*(1-alpha)+cut[:,:,:3].astype('float32')*alpha)


def ease(x):
 x=max(0,min(1,x));return x*x*(3-2*x)

def cover(img,w,h,focus=.5,zoom=1.0):
 ih,iw=img.shape[:2];ratio=max(w/iw,h/ih)*zoom
 rw,rh=max(w,round(iw*ratio)),max(h,round(ih*ratio))
 resized=cv2.resize(img,(rw,rh),interpolation=cv2.INTER_AREA if ratio<1 else cv2.INTER_LINEAR)
 x=round((rw-w)*focus);y=(rh-h)//2
 return resized[y:y+h,x:x+w].copy()

def put(frame,img,x,y):
 h,w=img.shape[:2]
 x=int(x);y=int(y)
 x1,y1=max(0,x),max(0,y);x2,y2=min(frame.shape[1],x+w),min(frame.shape[0],y+h)
 if x2>x1 and y2>y1:frame[y1:y2,x1:x2]=img[y1-y:y2-y,x1-x:x2-x]

def frame_base(t,profile,cache):
 data=PROFILES[profile];accent=data['accent'];f=np.empty((H,W,3),np.uint8);f[:]=BG
 cv2.rectangle(f,(0,0),(W,12),accent,-1)
 cv2.rectangle(f,(36,55),(48,126),accent,-1)
 cache.paint(f,'VR ABANDONADA   /   LABORATÓRIO 42',66,43,30,CREAM,heavy=False)
 # Editorial headline slides independently from footage, with 15fps held poses.
 q=math.floor(t*15)/15
 intro=ease(q/.45);settle=ease((q-.55)/.28)
 hsize=58 if profile!='industria' else 52
 x=int(-780*(1-intro)+55+18*math.sin(min(1,q/1.4)*math.pi))
 cache.paint(f,data['headline'],x,140-int(42*settle),hsize,accent)
 cache.paint(f,data['kicker'],65,238,28,CREAM,heavy=False)
 cv2.rectangle(f,(0,1610),(W,1620),accent,-1)
 cache.paint(f,'ORIGEM VERIFICADA   /   USO PRIVADO',57,1653,35,CREAM)
 cache.paint(f,'ANIMAÇÃO EM CAMADAS  •  SEM NARRAÇÃO',57,1730,28,CREAM,heavy=False)
 cache.paint(f,'PROVA DE MOTOR  /  NÃO É REPORTAGEM PUBLICADA',57,1790,23,(175,185,190),heavy=False)
 cv2.rectangle(f,(0,1907),(round(W*t/DUR),H-1),accent,-1)
 return f


def render_archive(f,t,imgs,cache):
 accent=PROFILES['arquivo']['accent'];s=min(2,int(t//2));u=t-2*s;ph=ease(u/1.9)
 if s==0:
  # Foreground and background are differently timed; static source remains unchanged.
  photo=cover(imgs['1941'],1000,1270,.56,1.035)
  put(f,photo,70-int(45*ph),316)
  cv2.rectangle(f,(45,313),(1055,1590),accent,4)
  cache.paint(f,'01 / 1941',75+int(65*ease(u/.34)),1400,68,accent)
 elif s==1:
  a=cover(imgs['1941'],610,1200,.55,1.02);b=cover(imgs['1969'],560,1200,.45,1.03)
  put(f,a,35-int(130*ph),350);put(f,b,610-int(94*(1-ph)),350)
  for x in [40,600]:cv2.rectangle(f,(x,333),(x+9,1550),accent,-1)
  cache.paint(f,'02 / 1969',70,1420,64,accent)
 else:
  p=cover(imgs['2014'],1040,1240,.40+.25*(u/2),1.02)
  # Reveal source via a moving industrial gate over a continuous photograph.
  put(f,p,20,334)
  shutter=round(1030*(1-ease(u/.53)))
  if shutter>0:cv2.rectangle(f,(20,335),(20+shutter,1570),BG,-1)
  cv2.rectangle(f,(20,335),(1058,1577),accent,4)
  cache.paint(f,'03 / 2014',66,1445,65,accent)
 text=SOURCES[('1941','1969','2014')[s]][2]
 cache.paint(f,text,42,1580,18,CREAM,heavy=False)


_READERS={}
def open_source(cap,t):
 """Sequential decoded frame cache; avoids re-seeking for every output frame."""
 token=id(cap); fps=cap.get(cv2.CAP_PROP_FPS) or 25.0
 target=round(float(t)*fps)
 entry=_READERS.get(token)
 if entry is not None and entry[0]==target:return entry[1]
 if entry is None or target<entry[0] or target-entry[0]>18:
  cap.set(cv2.CAP_PROP_POS_FRAMES,target)
  ok,img=cap.read()
 else:
  ok,img=True,entry[1]
  for _ in range(target-entry[0]):ok,img=cap.read()
 if not ok:raise ValueError('source film ended')
 _READERS[token]=(target,img)
 return img


def render_industry(f,t,cap,cache):
 accent=PROFILES['industria']['accent'];s=min(2,int(t//2));u=t-2*s
 at=(3.0,8.2,27.2)[s]+u*.84
 raw=open_source(cap,at)
 # Full-height moving footage on the center stage, source colors untouched.
 focus=(.46,.60,.39)[s];frame=cover(raw,1030,1260,focus,1.01)
 put(f,frame,25,317)
 q=math.floor(t*15)/15
 # Shutter masks and kinetic registration happen on the editorial edges.
 for i in range(5):
  y=328+i*225+round(math.sin(q*9+i)*18)
  xx=round(18+55*(1-ease(u/.37)))
  cv2.line(f,(xx,y),(xx+30+round(u*36),y),accent,5,cv2.LINE_AA)
 cv2.rectangle(f,(20,313),(1060,1575),accent,4)
 if u<.46:
  amount=round((1-ease(u/.46))*500)
  pts=np.array([(W-amount,317),(W,317),(W,317+520),(W-amount*.72,317+520)],np.int32)
  cv2.fillConvexPoly(f,pts,accent)
 cache.paint(f,('FAÍSCAS','METAL','FORNO')[s],80+round(18*math.sin(q*3.)),1415,77,accent)
 cache.paint(f,SOURCES['france'][2],38,1580,20,CREAM,heavy=False)


def render_broadcast(f,t,cap,cache):
 accent=PROFILES['telejornal']['accent'];s=min(2,int(t//2));u=t-2*s
 source_at=(2.8,27.0,64.0)[s]+u*.9
 raw=open_source(cap,source_at)
 # Preserve full 16:9 news broadcast instead of cropping off interview credits.
 video=cv2.resize(raw,(1030,580),interpolation=cv2.INTER_AREA)
 y=472+round(15*math.sin(math.pi*min(1,u/1.9)))
 put(f,video,25,y)
 cv2.rectangle(f,(20,468),(1060,1077),accent,4)
 # Move a separate newsroom timeline independently of video frames.
 cv2.rectangle(f,(52,1140),(1028,1456),(30,40,48),-1)
 for n in range(5):
  x=90+n*230+round(60*math.sin(t*1.1+n*.2))
  cv2.line(f,(x,1210),(x-80,1438),accent,3,cv2.LINE_AA)
 cache.paint(f,('TRABALHO','REPORTAGEM','ENTREVISTA')[s],72+round(26*(1-ease(u/.42))),1200,73,accent)
 cache.paint(f,'MONTAGEM ORIGINAL  /  2017',72,1328,31,CREAM,heavy=False)
 cache.paint(f,'TRECHO DE TV BRASILGOV · NÃO É CAPTAÇÃO ATUAL',35,1578,20,CREAM,heavy=False)


def check_stages(profile,still=None,video=None):
 if profile not in PROFILES:raise ValueError('unknown profile')
 if profile=='arquivo' and not still:raise ValueError('archive requires verified still photographs')
 if profile!='arquivo' and video is None:raise ValueError('video source missing')

def soundtrack(out,profile):
 rate=48000;n=int(rate*DUR)
 x=np.arange(n,dtype=np.float64)/rate
 intensity={'arquivo':.65,'industria':1.0,'telejornal':.76}[profile]
 y=np.zeros(n)
 # Lab-generated original percussive audio, no composition/sample reuse.
 for beat in range(0,12):
  onset=beat*.5+(0.08 if profile=='telejornal' else 0.0)
  tau=x-onset;mask=(tau>=0)&(tau<.18)
  wavelet=np.sin(2*np.pi*(72+22*np.exp(-np.maximum(tau,0)*20))*np.maximum(tau,0))
  y+=intensity*.24*np.exp(-np.maximum(tau,0)*26)*wavelet*mask
 y+=.04*np.sin(2*np.pi*46*x)+.027*np.sin(2*np.pi*89*x)
 y*=np.clip(x/.11,0,1)*np.clip((DUR-x)/.25,0,1)
 y=np.clip(y,-.85,.85)
 with wave.open(str(out),'wb') as wav:
  wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate)
  wav.writeframes((y*32767).astype('<i2').tobytes())

def render(profile,sources,output,*,w=W,h=H,fps=FPS):
 if (w,h,fps)!=(W,H,FPS):raise ValueError('V42 only exports 1080x1920 / 30fps')
 meta=verify_sources(Path(sources),profile)
 output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
 imgs={x:cv2.imread(str(Path(sources)/SOURCES[x][0])) for x in meta if x in ('1941','1969','2014')}
 if any(v is None for v in imgs.values()):raise ValueError('cannot read photo')
 cap=None
 if profile!='arquivo':
  key=PROFILES[profile]['sources'][0]
  cap=cv2.VideoCapture(str(Path(sources)/SOURCES[key][0]))
  if not cap.isOpened():raise ValueError('cannot read video')
 temp=output.with_suffix('.avi');wr=cv2.VideoWriter(str(temp),cv2.VideoWriter_fourcc(*'MJPG'),FPS,(W,H))
 if not wr.isOpened():raise ValueError('cannot write frames')
 cache=TextCache();snapshots=[];motion=[];prev=None
 try:
  for idx in range(round(DUR*FPS)):
   t=idx/FPS;f=frame_base(t,profile,cache)
   if profile=='arquivo':render_archive(f,t,imgs,cache)
   elif profile=='industria':render_industry(f,t,cap,cache)
   else:render_broadcast(f,t,cap,cache)
   wr.write(f)
   if idx in [30,90,150]:snapshots.append(cv2.resize(f,(360,640)))
   if idx % 30 == 0 and prev is not None:
    a=cv2.cvtColor(f[400:1410],cv2.COLOR_BGR2GRAY)
    b=cv2.cvtColor(prev[400:1410],cv2.COLOR_BGR2GRAY)
    motion.append(round(float((np.abs(a.astype('int16')-b.astype('int16'))>18).mean()),4))
   if idx % 30 == 0:prev=f.copy()
 finally:
  wr.release()
  if cap is not None:cap.release()
 snd=output.with_suffix('.wav');soundtrack(snd,profile)
 cmd=['ffmpeg','-hide_banner','-v','error','-y','-i',str(temp),'-i',str(snd),'-map','0:v','-map','1:a',
      '-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p',
      '-r',str(FPS),'-c:a','aac','-b:a','160k','-af','loudnorm=I=-16:TP=-2:LRA=7',
      '-t',str(DUR),'-movflags','+faststart',str(output)]
 subprocess.run(cmd,check=True)
 temp.unlink(missing_ok=True);snd.unlink(missing_ok=True)
 if len(snapshots)==3:cv2.imwrite(str(output.with_suffix('.jpg')),np.concatenate(snapshots,axis=1))
 report={'version':'v0.42','profile':profile,'grammar':PROFILES[profile]['grammar'],
         'sources':meta,'duration_sec':DUR,'width':W,'height':H,'fps':FPS,
         'frames':round(DUR*FPS),'graphic_poses_fps':15,
         'visual_motion_samples':motion,'source_hashes_passed':True,
         'narration_embedded':False,'publication_approved':False,
         'source_role':'contextual_test_footage','laboratory_only':True,
         'quality_claim':'No independent artistic evaluation'}
 output.with_suffix('.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 return report

def main():
 p=argparse.ArgumentParser();p.add_argument('--profile',choices=PROFILES,required=True)
 p.add_argument('--sources',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
 a=p.parse_args(); print(json.dumps(render(a.profile,a.sources,a.output),ensure_ascii=False,indent=2))
if __name__=='__main__':main()
