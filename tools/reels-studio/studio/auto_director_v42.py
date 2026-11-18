"""Original motion-first documentary graphic engine; multi-source test only.
1080x1920 native compositor. Visual sources remain unmodified in the vault.
No source is automatically claimed to depict any other event.
"""
from __future__ import annotations
import argparse,json,math,subprocess,hashlib,wave
from pathlib import Path
import cv2,numpy as np
from PIL import Image,ImageDraw,ImageFont
from .shot_scout_v42 import check_edit_plan,verify_media,SOURCES
W,H,FPS=1080,1920,30
Y0,Y1=235,1450
INK=np.array((19,17,17),np.uint8);CREAM=(224,229,237);YELLOW=(55,220,250);CYAN=(223,183,37)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'

def ease(x):
 u=max(0,min(1,float(x)));return u*u*(3-2*u)

def stage_crop(src,w,h,zoom=1.,pan=0.,vpan=0.):
 a,b=src.shape[:2]; ratio=max(w/b,h/a)*max(1,zoom)
 sw,sh=int(b*ratio)+2,int(a*ratio)+2
 resized=cv2.resize(src,(sw,sh),interpolation=cv2.INTER_LINEAR)
 cx=int((sw-w)/2+pan*(sw-w)/2);cy=int((sh-h)/2+vpan*(sh-h)/2)
 cx=max(0,min(cx,sw-w));cy=max(0,min(cy,sh-h))
 return resized[cy:cy+h,cx:cx+w].copy()

def title_layer(s,style):
 im=Image.new('RGBA',(W,205),(0,0,0,0));d=ImageDraw.Draw(im)
 title=s['headline'].upper();fsize=75
 font=ImageFont.truetype(FONT,fsize)
 while d.textbbox((0,0),title,font=font)[2]>960 and fsize>36:
  fsize-=2;font=ImageFont.truetype(FONT,fsize)
 d.text((36,25),title,font=font,fill=(254,232,65,255),stroke_width=0)
 return np.array(im)

def timeline_index(shots,t):
 for i,s in enumerate(shots):
  if s['start']<=t<s['end'] or i==len(shots)-1 and t<=s['end']:
   return i
 raise ValueError('timeline gap')

def decode_window(path,start,duration):
 cap=cv2.VideoCapture(str(path))
 if not cap.isOpened():raise ValueError('media missing')
 fps=cap.get(cv2.CAP_PROP_FPS)
 cap.set(cv2.CAP_PROP_POS_MSEC,1000*start)
 frames=[]
 # Read frame by frame only once per source segment, not seeking for each render frame.
 for i in range(int(math.ceil(duration*fps))+8):
  ok,frame=cap.read()
  if not ok:break
  frames.append(cv2.resize(frame,(980,552),interpolation=cv2.INTER_AREA))
 cap.release()
 if len(frames)<duration*fps*.55:raise ValueError('short source window')
 return {'frames':frames,'fps':fps}

def video_frame(item,local):
 idx=max(0,min(len(item['frames'])-1,int(round(local*item['fps']))))
 return item['frames'][idx]

def dynamic_stage(img,shot,local,variant):
 """Six independently animated compositions. No fabricated documentary pixels."""
 stage=np.full((Y1-Y0,1016,3),(26,25,29),np.uint8);h,w=stage.shape[:2]
 dur=shot['end']-shot['start'];u=local/dur
 aggressive=variant=='kinetic';strength=1. if aggressive else .48
 grammar=shot['grammar'];phase=ease(min(1,local/.48))
 if grammar=='archive_unfold':
  # three offset mechanical print plates, all based on the same original photo
  base=stage_crop(img,w,h,1.17+u*.055,pan=-.6+.9*u,vpan=-.10)
  stage[:]=base
  for j,(x0,x1) in enumerate(((0,315),(315,705),(705,w))):
   shift=int((1-phase)*strength*(105-38*j)*(1 if j%2==0 else -1))
   strip=base[:,x0:x1].copy()
   xs=max(0,min(w-(x1-x0),x0+shift))
   stage[:,xs:xs+x1-x0]=strip
  for x in (315,705):cv2.line(stage,(x,0),(x,h),(65,219,235),3,cv2.LINE_AA)
 elif grammar=='archive_parallax':
  base=stage_crop(img,w,h,1.15+u*.045,pan=.48-.6*u,vpan=.06)
  stage[:]=base
  band_h=round(h*.24)
  strip=stage_crop(img,w,band_h,1.32,pan=-.7+.95*u,vpan=-.5)
  ys=round(370+strength*35*math.sin(u*math.pi))
  stage[ys:ys+band_h]=strip
  cv2.line(stage,(0,ys),(w,ys),(46,219,243),5,cv2.LINE_AA)
  cv2.line(stage,(0,ys+band_h),(w,ys+band_h),(46,219,243),5,cv2.LINE_AA)
 elif grammar=='news_window':
  # Preserve the TV interview as TV reportage. Do not call it CSN footage.
  full=cv2.resize(img,(w,570),interpolation=cv2.INTER_LINEAR)
  stage[78:648]=full
  detail=stage_crop(img,w,475,zoom=1.15+strength*.08*u,pan=.5-strength*.35*u)
  stage[680:1155]=detail
  cv2.line(stage,(0,660),(w,660),(54,218,248),6,cv2.LINE_AA)
  cv2.putText(stage,'REGISTRO TELEJORNAL / 2017',(15,54),cv2.FONT_HERSHEY_SIMPLEX,1,(234,228,222),2,cv2.LINE_AA)
 elif grammar=='industrial_split':
  base=stage_crop(img,w,h,1.10+.025*strength*u,pan=.50-strength*.38*u)
  stage[:]=base
  section=stage_crop(img,w,420,1.29,pan=-.65+u*.70)
  ys=round(600+(1-ease(min(1,local/.7)))*110*strength)
  stage[ys:ys+420]=section
  cv2.line(stage,(0,ys),(w,ys),(74,72,231),5,cv2.LINE_AA)
 elif grammar=='industrial_rail':
  left=stage_crop(img,w,h,1.13,pan=-.85+u*.25)
  right=stage_crop(img,w,h,1.13,pan=.85-u*.25)
  boundary=int(w*(.27+.46*ease(min(1,local/.9))))
  stage[:,:boundary]=left[:,:boundary];stage[:,boundary:]=right[:,boundary:]
  cv2.line(stage,(boundary,0),(boundary,h),(65,219,236),6,cv2.LINE_AA)
  cv2.line(stage,(boundary+14,0),(boundary+14,h),(38,36,72),2,cv2.LINE_AA)
 else:
  stage[:]=stage_crop(img,w,h,1.13+u*.026,pan=.35-.35*u)
  # documentary end deliberately rests after its entrance
  if local<.55:
   cut=round(w*(1-ease(local/.55)))
   if cut>0:cv2.rectangle(stage,(0,0),(cut,h),(25,23,21),-1)
 return stage

def animated_title(canvas,rgba,local,dur,variant,shot_index):
 # Delayed arrival, slight overshoot, then full hold, opacity-controlled exit.
 phase=min(1,local/(.20 if variant=='kinetic' else .42))
 u=1-(1-phase)**3
 if variant=='kinetic' and phase<.98:u+=.08*math.sin(phase*math.pi)
 dx=int((1-u)*(-W if shot_index%2==0 else W))
 exitp=max(0,(local-(dur-.27))/.27)
 opacity=1-ease(exitp)
 if opacity<=0:return
 base=rgba[:,:,0:3][:,:,::-1]
 alpha=rgba[:,:,3].astype('float32')/255*opacity
 x0=max(0,dx);x1=min(W,W+dx)
 if x1<=x0:return
 sx0=x0-dx;sx1=sx0+(x1-x0)
 part=base[:,sx0:sx1];a=alpha[:,sx0:sx1,None]
 y0=18;y1=y0+rgba.shape[0]
 region=canvas[y0:y1,x0:x1]
 canvas[y0:y1,x0:x1]=np.clip(region.astype('float32')*(1-a)+part*a,0,255).astype('uint8')

def overlay_footer(canvas,shot,index,t,total):
 cv2.rectangle(canvas,(0,1484),(W,1920),(22,19,17),-1)
 cv2.rectangle(canvas,(38,1531),(1042,1544),(38,38,40),-1)
 cv2.rectangle(canvas,(38,1531),(38+int(1004*(index+1)/6),1544),YELLOW,-1)
 # Text drawn via PIL to support diacritics and avoid illegible small CV font.
 crop=Image.fromarray(cv2.cvtColor(canvas[1548:1840],cv2.COLOR_BGR2RGB))
 d=ImageDraw.Draw(crop)
 body=ImageFont.truetype(FONT,32);small=ImageFont.truetype(FONT,25)
 d.text((20,24),shot['credit'],font=body,fill=(244,242,227))
 d.text((20,94),'ENSAIO PRIVADO • AS FONTES NÃO RETRATAM O MESMO EVENTO',font=small,fill=(182,199,209))
 d.text((20,163),f'{index+1:02d} / 06    |    AÇO GRÁFICO    |    AUTO-SHOT SCOUT',font=small,fill=(250,222,92))
 canvas[1548:1840]=cv2.cvtColor(np.array(crop),cv2.COLOR_RGB2BGR)
 cv2.rectangle(canvas,(0,1911),(round(W*t/total),1919),YELLOW,-1)

def soundtrack(path,dur,shots):
 sr=22050;t=np.arange(round(sr*dur),dtype=np.float64)/sr
 # Original synthesized pulse bed, not third-party music or voice imitation.
 pcm=.044*np.sin(2*np.pi*82*t)+.027*np.sin(2*np.pi*123*t)*(0.55+0.45*np.sin(t*2.4))
 pcm*=np.minimum(1,t/.2)*np.minimum(1,(dur-t)/.3)
 for shot in shots:
  hit=int(shot['start']*sr);N=int(.28*sr)
  if hit+N>len(pcm):continue
  pulse=np.sin(2*np.pi*(68+35*np.exp(-np.arange(N)/sr*18))*np.arange(N)/sr)*np.exp(-np.arange(N)/sr*17)
  pcm[hit:hit+N]+=pulse*.16
 arr=np.clip(pcm*32767,-32767,32767).astype('<i2')
 with wave.open(str(path),'wb') as wf:
  wf.setnchannels(1);wf.setsampwidth(2);wf.setframerate(sr);wf.writeframes(arr.tobytes())

def render(plan_path:Path,source_root:Path,out:Path,*,variant='kinetic'):
 if variant not in ('kinetic','restrained'):raise ValueError('unknown variant')
 manifest=json.loads(Path(plan_path).read_text())
 plan=manifest['edit_plan'];shots=plan['shots'];check_edit_plan(shots)
 if plan['purpose']!='INTERNAL_ONLY' or plan.get('publication_approved') or plan.get('voice_embedded'):
  raise ValueError('bad internal-only provenance manifest')
 root=Path(source_root)
 pathmap={'csn_1941':'csn_1941.tif','csn_1969':'csn_1969.jpg',
          'csn_2014':'csn_2014.jpg','rodovia_2017':'rodovia_2017.webm',
          'france_2011':'france_2011.webm'}
 for key,filename in pathmap.items():verify_media(key,root/filename)
 stills={key:cv2.imread(str(root/filename)) for key,filename in pathmap.items() if 'csn_' in key}
 if any(x is None for x in stills.values()):raise ValueError('corrupt still')
 video_windows={}
 for i,shot in enumerate(shots):
  if shot['source_at'] is not None:
   video_windows[i]=decode_window(root/pathmap[shot['source_id']],shot['source_at'],shot['end']-shot['start'])
 titles=[title_layer(s,variant) for s in shots]
 out=Path(out);out.parent.mkdir(parents=True,exist_ok=True)
 raw=out.with_suffix('.silent.mp4')
 cmd=['ffmpeg','-y','-hide_banner','-v','error','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}',
   '-r',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','ultrafast',
   '-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',str(raw)]
 process=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
 duration=shots[-1]['end'];contact=[]
 try:
  for fr in range(round(duration*FPS)):
   t=fr/FPS;idx=timeline_index(shots,t);shot=shots[idx];local=t-shot['start']
   canvas=np.full((H,W,3),(20,20,20),np.uint8)
   cv2.rectangle(canvas,(0,0),(W,215),(19,17,16),-1)
   cv2.rectangle(canvas,(0,219),(W,229),(52,220,243),-1)
   img=video_frame(video_windows[idx],local) if idx in video_windows else stills[shot['source_id']]
   canvas[Y0:Y1,32:1048]=dynamic_stage(img,shot,local,variant)
   # print-registration details confined to editorial upper margin
   for j in range(4):
    x=33+j*28+round(math.sin(local*8+j)*6)
    cv2.line(canvas,(x,233),(x,240+round(20*math.sin(local*5+j))),CYAN,2,cv2.LINE_AA)
   animated_title(canvas,titles[idx],local,shot['end']-shot['start'],variant,idx)
   overlay_footer(canvas,shot,idx,t,duration)
   try:process.stdin.write(canvas.tobytes())
   except BrokenPipeError:raise RuntimeError('FFmpeg encoder closed unexpectedly')
   if abs(t-(shot['start']+shot['end'])/2)<.018:
    contact.append((idx,cv2.resize(canvas,(270,480))))
  process.stdin.close()
  err=process.stderr.read().decode('utf8',errors='replace')
  rc=process.wait()
  if rc:raise RuntimeError('FFmpeg video encoding: '+err[-1000:])
 finally:
  if process.poll() is None:
   process.kill();process.wait()
 wav=out.with_suffix('.wav');soundtrack(wav,duration,shots)
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(raw),'-i',str(wav),'-map','0:v','-map','1:a',
  '-af','loudnorm=I=-16:TP=-2.0:LRA=7','-c:v','copy','-c:a','aac','-b:a','160k','-t',str(duration),
  '-movflags','+faststart',str(out)],check=True)
 raw.unlink(missing_ok=True);wav.unlink(missing_ok=True)
 board=np.full((960,1620,3),30,dtype=np.uint8)
 for i,img in contact:
  board[(i//6)*480:(i//6+1)*480,(i%6)*270:(i%6+1)*270]=img
 cv2.imwrite(str(out.with_suffix('.jpg')),board)
 metadata={'version':'v0.42','variant':variant,'fps':FPS,'resolution':[W,H],
           'duration_sec':duration,'shots':shots,'provenance':{
            key:verify_media(key,root/filename) for key,filename in pathmap.items()},
           'motion_grammars':len(set(s['grammar'] for s in shots)),
           'source_video_windows_auto_selected':2,
           'source_interview_window_auto_selected':1,
           'narration_embedded':False,'music':'original_lab_synthesis',
           'public_release':False,'internal_only':True,
           'editable_source_code':True}
 out.with_suffix('.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
 return metadata

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--plan',type=Path,required=True)
 ap.add_argument('--sources',type=Path,required=True);ap.add_argument('--out',type=Path,required=True)
 ap.add_argument('--variant',choices=['kinetic','restrained'],default='kinetic')
 args=ap.parse_args();print(json.dumps(render(args.plan,args.sources,args.out,variant=args.variant),ensure_ascii=False)[:450])
