"""Aço Gráfico v0.37: factual story-led choreography and animated typography.

Originality and factual integrity: image movement translates/crops actual original
source pixels, never generates or paints false historic details. Documentary 30fps,
editorial poses at 15fps. A/B changes timing only, not palette.

This module does not publish, download, or call paid voice generation endpoints.
"""
from __future__ import annotations
import argparse, hashlib, json, math, subprocess, wave
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H, FPS, LENGTH = 1080, 1920, 30, 14.5
Y0, Y1 = 200, 1470
DARK = (13, 20, 31)
PAPER = (243, 237, 220)
YELLOW = (255, 214, 74)
CORAL = (248, 83, 59)
FILM_SHA1 = 'c1129cac8654866856c7bec31196206f16eac6c7'
STAGES = (
  (0., .92, '1941', '1941 · A USINA NASCE', '1941 · CONSTRUÇÃO DA CSN · ARQUIVO NACIONAL', None, 'collision'),
  (.92, 1.90, '1969', '1969 · POR DENTRO DA CSN', '1969 · INTERIOR DA CSN · ARQUIVO NACIONAL', None, 'accordion'),
  (1.90, 4.08, '2014', 'CSN · 2014', '2014 · CSN · VOLTA REDONDA · HENRIQUEBARRAMANSA', None, 'vertical_shutters'),
  (4.08, 6.16, '2014', 'VOLTA REDONDA', '2014 · CSN · VOLTA REDONDA · HENRIQUEBARRAMANSA', None, 'oblique_camera'),
  (6.16, 8.46, 'france', 'SIDERURGIA EM CENA', 'FRANÇA · SIDERURGIA · DAMIEN VICART, 2011', 2.6, 'diagonal_reveal'),
  (8.46, 9.66, 'france', 'ARQUIVO FRANCÊS', 'FRANÇA · SIDERURGIA · DAMIEN VICART, 2011', 7.8, 'counterpoint'),
  (9.66, 11.56, 'france', 'FRANÇA · 2011', 'FRANÇA · SIDERURGIA · DAMIEN VICART, 2011', 27.8, 'moving_beam'),
  (11.56, 14.5, 'both', 'A ORIGEM IMPORTA', 'CSN, 2014 / FRANÇA, 2011 · COMPARAÇÃO EDITORIAL', 22.4, 'documentary_rest'),
)
LABELS = ('collision','accordion','vertical_shutters','oblique_camera','diagonal_reveal','counterpoint','moving_beam','documentary_rest')
# Events are genuine aligned word onsets from the existing ElevenLabs Scribe transcript.
# These are editorial cues, not source sounds or claimed film audio.
EVENTS = ((0.,'Volta'),(.998,'memória.'),(2.810,'CSN'),(5.294,'quatorze.'),
          (6.258,'As'),(8.557,'francês.'),(10.414,'transformar'),(13.305,'origem.'))
V37_VERSION='v0.37'

def narrative_events(words):
    # Fail closed if the alignment used by the motion design is a different recording.
    actual={w[0].casefold().strip():[] for w in words}
    for word,start,end in words:
        actual.setdefault(word.casefold(),[]).append((start,end))
    for t,word in EVENTS:
        if not any(abs(st-t)<.035 for st,_ in actual.get(word.casefold(),[])):
            raise ValueError(f'Word onset does not match original recording: {word}')
    return [{'second':t,'word':w} for t,w in EVENTS]

def motion_curve(local, duration, variant='kinetic'):
    """Anticipation, overshoot and rest measured as a normalized displacement.

    This is NOT generic ease-in across every scene. It incorporates pre-movement,
    main acceleration, a damped overshoot and a stable hold. Editorial-only.
    """
    if variant not in ('kinetic','measured'):raise ValueError('Unsupported variant')
    tempo=.63 if variant=='kinetic' else .93
    u=max(0.,min(1.,local/tempo))
    if u<.12: return -.065*math.sin(math.pi*u/.12)  # anticipatory recoil
    z=(u-.12)/.88
    if z<.68:
        q=z/.68;return 1.075*(q*q*(3-2*q))
    if z<.88:
        q=(z-.68)/.20;return 1.075-.11*(q*q*(3-2*q))
    q=(z-.88)/.12;return .965+.035*(q*q*(3-2*q))

def motion_signature(index, progress, variant):
    """Distinct, source-agnostic trajectories for two independently moving layers.
    Return numeric vectors used in actual shot masks/camera composition.
    """
    amp=1. if variant=='kinetic' else .58
    u=max(0.,min(1.,progress))
    vectors=(
       ((1-u)*(-160), (1-u)*110, (1-u)*150, -(1-u)*75),
       (72*math.sin(math.pi*u),-72*math.sin(math.pi*u),-130*(1-u),65*(1-u)),
       (102*(1-u),-82*(1-u),-102*(1-u),70*(1-u)),
       (55*math.sin(math.pi*u*.75),38*u,-43*math.sin(math.pi*u*.75),-36*u),
       ((1-u)*170,0.,(1-u)*(-160),20*math.sin(math.pi*u)),
       (88*(1-u),24*math.sin(2*math.pi*u),-88*(1-u),-22*math.sin(2*math.pi*u)),
       (160*(1-u),20*math.sin(math.pi*u),-120*(1-u),-26*math.sin(math.pi*u)),
       (35*math.sin(math.pi*u),-12*u,-35*math.sin(math.pi*u),12*u),
    )
    return tuple(round(float(x)*amp,3) for x in vectors[index])


def semantic_pulse(t):
    """Brief editorial activity envelope synchronized to meaningful spoken words."""
    peaks=[math.exp(-((t-sec)/.145)**2) for sec,_ in EVENTS]
    return max(peaks,default=0.0)



def validate_plan(stages=STAGES):
    if len(stages) != 8 or len({s[6] for s in stages}) != 8:
        raise ValueError('Eight different actual motion grammars required')
    if abs(stages[0][0])>.001 or abs(stages[-1][1]-LENGTH)>.001:
        raise ValueError('Timeline must be full-length')
    for j,s in enumerate(stages):
        if s[1]<=s[0] or (j and abs(s[0]-stages[j-1][1])>.001):
            raise ValueError('Noncontiguous shot')
        if j>=4 and ('FRANÇA' not in s[4] or s[5] is None):
            raise ValueError('Foreign industrial sources cannot masquerade as CSN')
        if j<4 and s[2] not in s[4]:
            raise ValueError('Dated source credit missing')
    return True


def sha1(path):
    hash=hashlib.sha1()
    with Path(path).open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):hash.update(b)
    return hash.hexdigest()


def expo(x):
    x=max(0.,min(1.,x))
    return 1-(1-x)**3


def smooth(x):
    x=max(0.,min(1.,x))
    return x*x*(3-2*x)


def motion_at(index,t,variant):
    if variant not in ('kinetic','measured'):raise ValueError('Unknown choreography mode')
    shot=STAGES[index]
    u=max(0.,min(1.,(t-shot[0])/(shot[1]-shot[0])))
    local=max(0.,t-shot[0]);mag=1. if variant=='kinetic' else .58
    # Documentary source frames stay at 30 fps; graphical poses intentionally on twos.
    graphic_pose=math.floor(local*15+1e-8)/15
    arrival=motion_curve(graphic_pose,shot[1]-shot[0],variant)
    vx1,vy1,vx2,vy2=motion_signature(index,u,variant)
    return {'arrival':arrival,'magnitude':mag,'progress':u,
            'graphic_pose':graphic_pose,'jitter':round(4*mag*math.sin(graphic_pose*18.3)),
            'elapsed':local,'variant':variant,'motion':shot[6],
            'vectors':(vx1,vy1,vx2,vy2),'pulse':semantic_pulse(t)}


def cover(src, w, h, zoom=1.0, fx=.5, fy=.5):
    if src is None or src.ndim!=3:raise ValueError('Real image pixels unavailable')
    sh,sw=src.shape[:2];k=max(w/sw,h/sh)*zoom
    nw,nh=max(w,round(sw*k)),max(h,round(sh*k))
    resized=cv2.resize(src,(nw,nh),interpolation=cv2.INTER_AREA if k<1 else cv2.INTER_LINEAR)
    x=max(0,min(nw-w,round(fx*nw-w/2)))
    y=max(0,min(nh-h,round(fy*nh-h/2)))
    return resized[y:y+h,x:x+w].copy()


def clip_paste(dst,src,x,y):
    h,w=dst.shape[:2];sh,sw=src.shape[:2]
    x,y=int(x),int(y);x0=max(0,x);y0=max(0,y);x1=min(w,x+sw);y1=min(h,y+sh)
    if x1>x0 and y1>y0:dst[y0:y1,x0:x1]=src[y0-y:y1-y,x0-x:x1-x]


def safe_font(size,bold=True):
    paths=['/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Bold.ttf',
           '/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'] if bold else [
           '/usr/share/fonts/truetype/lato/Lato-Regular.ttf',
           '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
    return ImageFont.truetype(next(p for p in paths if Path(p).is_file()),size)

@lru_cache(maxsize=30)
def font(size,bold=True):return safe_font(size,bold)


def text_fits(text, maxw=1000, initial=81):
    for size in range(initial,21,-2):
        if ImageDraw.Draw(Image.new('RGB',(2,2))).textbbox((0,0),text,font=font(size))[2]<=maxw:
            return size
    raise ValueError('Title cannot fit text bounds')


def words_load(path):
    obj=json.loads(Path(path).read_text(encoding='utf-8'))
    if abs(obj['duration_sec']-14.071292517)>.03 or len(obj['words'])!=32:
        raise ValueError('Not the 32 timed words from ElevenLabs')
    arr=[(str(w[0]),float(w[1]),float(w[2])) for w in obj['words']]
    if any(b<=a or (i and a<arr[i-1][2]-.04) for i,(_,a,b) in enumerate(arr)):
        raise ValueError('Invalid word timings')
    return arr


def captions(words,t):
    groups=[(0,4),(4,12),(12,21),(21,28),(28,32)]
    for j,(a,b) in enumerate(groups):
        if words[a][1]-.10 <= t <= words[b-1][2]+.12:
            text=' '.join(w[0] for w in words[a:b]);active=next((i for i in range(a,b) if words[i][1]<=t<words[i][2]),None)
            return (j,text,words[active][0] if active is not None else '')
    return (-1,'','')


def typography_timing(shot_id, elapsed, variant):
    """Animation timing changes by meaning, not by color.

    Archive images get asymmetric unfolding; factory action gets motion along
    steel-production geometry. Final evidence gets a genuine sustained hold.
    """
    if not 0 <= shot_id < 8:raise ValueError('unknown shot')
    durations=(.92,.98,2.18,2.08,2.30,1.20,1.90,2.94)
    if elapsed<0 or elapsed>durations[shot_id]+1e-2:raise ValueError('time outside shot')
    # Which moment is reserved for a readable title, before yielding to the source?
    release=(.47,.54,.67,.64,.62,.44,.57,1.25)[shot_id]
    fade=(.20,.22,.23,.25,.22,.20,.22,.30)[shot_id]
    if variant=='measured':release=min(durations[shot_id]-.17,release+(.15 if shot_id!=7 else .25))
    opacity=1-smooth((elapsed-release)/fade)
    settle=(.16,.26,.29,.32,.30,.22,.28,.45)[shot_id]
    if variant=='measured':settle*=1.4
    progress=smooth(elapsed/max(.001,settle))
    return {'opacity':max(0.,min(1.,opacity)), 'progress':progress,
            'exposure_sec':round(release+fade,3),
            'grammar':('collision','archive_unfold','shutters','perspective','molten_wipe','counterpoint','moving_beam','rest')[shot_id]}


def typography_layer(title,st,shot_id):
    """Eight actual image transforms on the title layer, independent of color.

    The movement leaves the real photos and film untouched. No reused
    one-size-fits-all slide-in/fade; a rest beat holds the final fact longer.
    """
    t=typography_timing(shot_id,st['elapsed'],st['variant'])
    opacity=t['opacity']
    if opacity<.015:return None
    w,h=W,325
    # Create the same base graphic for both variants. Only trajectories vary.
    layer=Image.new('RGBA',(w,h),(0,0,0,0))
    d=ImageDraw.Draw(layer)
    d.rectangle((26,18,1047,155),fill=(10,17,27,230))
    f=font(text_fits(title,960,76))
    d.text((45,38),title,font=f,fill=(*YELLOW,255))
    d.rectangle((40,161,1020,168),fill=(*CORAL,255))
    pix=np.asarray(layer).copy()
    z=t['progress'];m=(1-z)*(1 if st['variant']=='kinetic' else .68)
    canvas=np.zeros_like(pix)
    mode=t['grammar']
    if mode=='collision':
        mid=170
        for sl,delta in [(slice(0,mid),-round(195*m)),(slice(mid,h),round(176*m))]:
            canvas[sl]=np.roll(pix[sl],delta,axis=1)
            if delta>0:canvas[sl,:delta]=0
            if delta<0:canvas[sl,delta:]=0
    elif mode=='archive_unfold':
        mid=540
        left=pix[:,:mid];right=pix[:,mid:]
        shrink=max(.22,z);ww=max(1,round(mid*shrink))
        canvas[:,mid-ww:mid]=cv2.resize(left,(ww,h))
        canvas[:,mid:mid+ww]=cv2.resize(right,(ww,h))
    elif mode=='shutters':
        for j,(x0,x1) in enumerate(((0,360),(360,720),(720,1080))):
            sy=round(((-1)**j)*110*m)
            aff=np.float32([[1,0,0],[0,1,sy]])
            canvas[:,x0:x1]=cv2.warpAffine(pix[:,x0:x1],aff,(x1-x0,h),borderMode=cv2.BORDER_CONSTANT)
    elif mode=='perspective':
        slant=round(130*m)
        src=np.float32([[0,0],[w,0],[w,h],[0,h]])
        dest=np.float32([[slant,0],[w,0],[w-slant,h],[0,h]])
        canvas=cv2.warpPerspective(pix,cv2.getPerspectiveTransform(src,dest),(w,h))
    elif mode=='molten_wipe':
        edge=round(-200+(w+310)*z)
        yy,xx=np.ogrid[:h,:w]
        mask=(xx+yy*.24)<=edge
        canvas[mask]=pix[mask]
    elif mode=='counterpoint':
        a=round(145*m);half=163
        canvas[:half]=np.roll(pix[:half],a,axis=1)
        canvas[half:]=np.roll(pix[half:],-a,axis=1)
        if a>0:canvas[:half,:a]=0;canvas[half:,-a:]=0
    elif mode=='moving_beam':
        edge=round(-125+(w+150)*z)
        canvas[:,:max(0,min(w,edge))]=pix[:,:max(0,min(w,edge))]
    elif mode=='rest':
        # A documentary hold without a jolt is as intentional as a fast cut.
        canvas=pix.copy()
    else:raise ValueError(mode)
    canvas[:,:,3]=np.uint8(np.clip(canvas[:,:,3].astype(float)*opacity,0,255))
    return canvas

# Keep an explicit alias for older tests while authoring scene-specific motion.
def title_layer(title,st):
    return typography_layer(title,st,STAGES.index(next(s for s in STAGES if s[6]==st['motion'])))

@lru_cache(maxsize=90)
def caption_layer(text,active):
    lay=Image.new('RGB',(W,310),DARK);d=ImageDraw.Draw(lay)
    if not text:return cv2.cvtColor(np.asarray(lay),cv2.COLOR_RGB2BGR)
    pieces=text.split();break_at=max(1,round(len(pieces)/2))
    if len(text)<32:lines=[text]
    else:
        costs=[]
        for i in range(2,len(pieces)-1):
            a,b=' '.join(pieces[:i]),' '.join(pieces[i:]);cost=abs(len(a)-len(b))+(20 if min(len(a),len(b))<9 else 0)
            costs.append((cost,i))
        k=min(costs)[1] if costs else break_at
        lines=[' '.join(pieces[:k]),' '.join(pieces[k:])]
    for j,line in enumerate(lines):
        size=text_fits(line,1030,55);f=font(size)
        bb=d.textbbox((0,0),line,font=f);ww=bb[2]-bb[0]
        left=(W-ww)//2;top=44+j*95
        d.text((left,top),line,font=f,fill=PAPER)
        if active:
            pos=line.find(active)
            if pos>=0:
                before=line[:pos]
                x0=left+d.textbbox((0,0),before,font=f)[2] if before else left
                x1=x0+d.textbbox((0,0),active,font=f)[2]
                d.line((x0,top+size+12,x1,top+size+12),fill=YELLOW,width=6)
    return cv2.cvtColor(np.asarray(lay),cv2.COLOR_RGB2BGR)

@lru_cache(maxsize=20)
def static_top(shot_num,credit,voice_embedded=False):
    lay=Image.new('RGB',(W,H),DARK);d=ImageDraw.Draw(lay)
    d.text((29,25),'VR ABANDONADA',font=font(61),fill=PAPER)
    d.text((30,105),'AÇO GRÁFICO  /  MONTAGEM E ANIMAÇÃO DOCUMENTAL',font=font(23,False),fill=YELLOW)
    d.text((955,40),f'{shot_num+1:02d}',font=font(53),fill=YELLOW)
    d.rectangle((0,1512,W,1520),fill=CORAL)
    d.rectangle((0,1850,W,1920),fill=DARK)
    f=font(21,False)
    if d.textbbox((0,0),credit,font=f)[2]>1010:raise ValueError('Credit too wide')
    d.text((29,1469),credit,font=f,fill=YELLOW)
    footer=('ESTUDO INTERNO  •  VOZ LOCAL NÃO VERIFICADA  •  NÃO PUBLICADO' if voice_embedded else
            'ESTUDO INTERNO  •  TRILHA SINTÉTICA  •  SEM NARRAÇÃO')
    d.text((29,1868),footer,font=font(20,False),fill=(173,178,183))
    return cv2.cvtColor(np.asarray(lay),cv2.COLOR_RGB2BGR)


def frame(src,companion,shot_id,t,variant,voice_embedded=False):
    s=STAGES[shot_id];st=motion_at(shot_id,t,variant)
    canvas=static_top(shot_id,s[4],voice_embedded).copy()
    # Original pixels, with no faux reenactment or AI-created industrial events.
    w=1028; h=1215
    zoom=1.01+(0.040 if variant=='kinetic' else .020)*smooth(st['progress'])
    primary=cover(src,w,h,zoom=zoom,fx=.5+(.025 if variant=='kinetic' else .012)*math.sin(st['progress']*math.pi),fy=.50)
    a=st['arrival'];m=st['magnitude'];mode=s[6];x0=26;y0=193
    if mode=='collision':
        cuts=[0,360,810,h];trans=[-1,1,-1]
        for i in range(3):
            sl=primary[cuts[i]:cuts[i+1]]
            off=round(trans[i]*170*m*(1-a) + st['vectors'][i%2]*.24)
            clip_paste(canvas,sl,x0+off,y0+cuts[i])
    elif mode=='accordion':
        partitions=[0,330,690,w]
        for i in range(3):
            im=primary[:,partitions[i]:partitions[i+1]]
            off=round((1 if i==1 else -1)*130*m*(1-a)+st['vectors'][i%2]*.32)
            clip_paste(canvas,im,x0+partitions[i]+off,y0+round((i-1)*85*m*(1-a)+st['vectors'][2+(i%2)]*.35))
    elif mode=='vertical_shutters':
        cuts=[0,400,805,h]
        for i in range(3):
            im=primary[cuts[i]:cuts[i+1]]
            off=round((1 if i%2 else -1)*190*m*(1-motion_curve(max(0,st['graphic_pose']-.10*i), s[1]-s[0],variant))+st['vectors'][i%2]*.27)
            clip_paste(canvas,im,x0,y0+cuts[i]+off)
    elif mode=='oblique_camera':
        # Camera uses an actual homography rather than only a decorative diagonal.
        sk=round(st['vectors'][0]*.35)
        pts_from=np.float32([[0,0],[w,0],[w,h],[0,h]])
        pts_to=np.float32([[max(0,sk),0],[w-max(0,-sk),max(0,-sk)//2],
                           [w-max(0,sk),h],[max(0,-sk),h-max(0,-sk)//2]])
        project=cv2.warpPerspective(primary,cv2.getPerspectiveTransform(pts_from,pts_to),(w,h),
                                    flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT101)
        clip_paste(canvas,project,x0,y0)
        x=round((W+340)*(1-a)-270)
        pts=np.array([[x,y0-12],[x+70,y0-12],[x+310,y0+h+12],[x+240,y0+h+12]],np.int32)
        cv2.fillConvexPoly(canvas,pts,(20,22,34))
        cv2.polylines(canvas,[pts],True,(74,179,250),3,cv2.LINE_AA)
    elif mode=='diagonal_reveal':
        mask=np.zeros((h,w),np.uint8)
        edge=int(-160+a*(w+400));pts=np.array([[0,0],[edge,0],[edge+220,h],[0,h]],np.int32)
        cv2.fillPoly(mask,[pts],255)
        part=np.zeros_like(primary);part[:]=(22,27,38)
        part[mask>0]=primary[mask>0]
        clip_paste(canvas,part,x0,y0)
        cv2.line(canvas,(min(W,x0+edge),y0),(min(W,x0+edge+220),y0+h),(74,179,250),6,cv2.LINE_AA)
    elif mode=='counterpoint':
        left=primary[:h//2];right=primary[h//2:]
        dx=round(100*m*(1-a)+st['vectors'][0]*.28)
        clip_paste(canvas,left,x0-dx,y0)
        clip_paste(canvas,right,x0+dx,y0+h//2)
        cv2.line(canvas,(x0,y0+h//2),(x0+w,y0+h//2),(74,179,250),6,cv2.LINE_AA)
    elif mode=='moving_beam':
        clip_paste(canvas,primary,x0,y0)
        xb=int((W+220)*(1-a)-145)
        cv2.line(canvas,(xb,y0),(xb+140,y0+h),(20,22,34),40,cv2.LINE_AA)
        cv2.line(canvas,(xb-15,y0),(xb+125,y0+h),(74,179,250),5,cv2.LINE_AA)
    elif mode=='documentary_rest':
        if companion is None:raise ValueError('comparison must use original CSN photographic context')
        ww=(w-12)//2
        left=cover(companion,ww,h,zoom=1.01+.018*smooth(st['progress']))
        right=cover(src,ww,h,zoom=1.01+.017*smooth(st['progress']))
        dx=round(65*m*(1-a)+st['vectors'][0]*.25)
        clip_paste(canvas,left,x0-dx,y0)
        clip_paste(canvas,right,x0+ww+12+dx,y0)
        cv2.rectangle(canvas,(x0+ww,y0),(x0+ww+12,y0+h),(20,22,34),-1)
    else:raise AssertionError('Unknown grammar')
    # Word-timed print-registration marks: safe header margin, not historical pixels.
    pulse=st['pulse']
    if pulse>.13:
        span=round(8+18*pulse)
        for k in range(3):
            xx=605+38*k
            cv2.line(canvas,(xx,174-span//2),(xx,174+span//2),
                (74,214,255) if variant=='kinetic' else (74,214,255),3,cv2.LINE_AA)
    overlay=typography_layer(s[3],st,shot_id)
    if overlay is not None:
        # Alpha over the top of visual region; without cropping away credit/captions.
        yy=Y0; hh=min(overlay.shape[0],H-yy)
        rgb=overlay[:hh,:,:3][:,:,::-1]
        aa=overlay[:hh,:,3:4].astype(np.float32)/255.
        region=canvas[yy:yy+hh].astype(np.float32)
        canvas[yy:yy+hh]=np.uint8(np.clip(region*(1-aa)+rgb*aa,0,255))
    return canvas


def audio_music(path):
    sr=48000; n=round(LENGTH*sr);t=np.arange(n)/sr
    # Original instrumental score; no implied original sound from CSN.
    tone=.052*np.sin(2*np.pi*(63*t+1.6*np.sin(.4*t)))+.032*np.sin(2*np.pi*87*t)
    hit=np.zeros(n,dtype=float)
    for i,sec in enumerate(sorted(set([s[0] for s in STAGES]+[t for t,w in EVENTS]))):
        ix=round(sec*sr);N=min(round(.20*sr),n-ix)
        if N<=0:continue
        tt=np.arange(N)/sr
        gain=.115 if sec in [s[0] for s in STAGES] else .085
        # One original sonic rhythm, not audio presented as actual factory sound.
        hit[ix:ix+N]+=gain*(np.sin(2*np.pi*(111+12*(i%7))*tt)+.22*np.sin(2*np.pi*61*tt))*np.exp(-24*tt)
    y=np.tanh((tone+hit)*1.1)*np.clip(np.minimum(t/.1,(LENGTH-t)/.3),0,1)
    pcm=(np.clip(y,-.8,.8)*32767).astype('<i2')
    with wave.open(str(path),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())


def inspect_local_narration(voice_file, *, expected_duration=14.071292517):
    """Read actual audio bytes, never request/generate them, reject missing/invalid audio.

    This asserts duration/stream integrity, not a person's identity. For
    a verified voice identity compare to a separately authenticated hash.
    """
    path=Path(voice_file)
    if not path.is_file() or path.stat().st_size<8000:
        raise ValueError('narration bytes missing or too small')
    obj=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams',
        '-show_format','-of','json',str(path)],text=True))
    streams=[x for x in obj['streams'] if x.get('codec_type')=='audio']
    if len(streams)!=1:raise ValueError('narration needs exactly one audio stream')
    duration=float(obj['format']['duration'])
    if abs(duration-expected_duration)>.37:
        raise ValueError(f'Audio duration {duration:.3f}s contradicts 14.071s timing')
    if int(streams[0].get('sample_rate',0))<22050:
        raise ValueError('Voice sample rate too low')
    h=hashlib.sha256(path.read_bytes()).hexdigest()
    return {'sha256':h,'duration_sec':duration,'codec':streams[0]['codec_name'],
            'identity_verified':False,'generated_here':False}


def render(photo1941,photo1969,photo2014,film,words_json,output,variant='kinetic',voice_file=None):
    validate_plan()
    words=words_load(words_json)
    narrative_events(words)
    narration=inspect_local_narration(voice_file) if voice_file is not None else None
    if sha1(film)!=FILM_SHA1:raise ValueError('Industrial video source hash does not match original')
    photo_files={'1941':(photo1941,'91d061df6f5fb7962d17c86948e656c335f1b0ca'),
                 '1969':(photo1969,'1e16caba06722d121eaf3b88b39d89be910bb2a0'),
                 '2014':(photo2014,'6a792f0fd16ddd4c8bed2ca981788c9b9accb7a4')}
    for name,(p,expected_sha) in photo_files.items():
        if sha1(p)!=expected_sha:raise ValueError(f'Unverified {name} photographic archive')
    imgs={'1941':cv2.imread(str(photo1941)),'1969':cv2.imread(str(photo1969)),'2014':cv2.imread(str(photo2014))}
    if any(x is None for x in imgs.values()):raise ValueError('Historical source could not be decoded')
    out=Path(output);out.parent.mkdir(parents=True,exist_ok=True)
    cap=cv2.VideoCapture(str(film));fps=cap.get(cv2.CAP_PROP_FPS)
    if not cap.isOpened() or fps<1:raise ValueError('Original film could not be opened')
    raw=out.with_name(out.stem+'_silent.avi')
    writer=cv2.VideoWriter(str(raw),cv2.VideoWriter_fourcc(*'MJPG'),FPS,(W,H))
    if not writer.isOpened():raise RuntimeError('Cannot initialize native Full HD encoder')
    last=-1;current=None;last_shot=-1
    try:
        for num in range(round(LENGTH*FPS)):
            t=num/FPS
            i=next(j for j,s in enumerate(STAGES) if s[0]<=t<s[1]);s=STAGES[i]
            if s[5] is not None:
                fid=max(0,round((s[5]+t-s[0])*fps))
                if i!=last_shot or fid<last:
                    cap.set(cv2.CAP_PROP_POS_FRAMES,fid);last=fid-1
                while last<fid:
                    ok,current=cap.read()
                    if not ok:raise ValueError('Truncated real film')
                    last+=1
            src=imgs[s[2]] if s[2]!='france' and s[2]!='both' else current
            if src is None:raise ValueError('Missing source film frame')
            outframe=frame(src,imgs['2014'],i,t,variant,bool(narration))
            cid,text,active=captions(words,t)
            outframe[1536:1846]=caption_layer(text,active)
            cv2.rectangle(outframe,(0,H-7),(round((num+1)/(LENGTH*FPS)*W),H-1),(74,179,250),-1)
            writer.write(outframe)
            last_shot=i
    finally:
        writer.release();cap.release()
    wav=out.with_name(out.stem+'_instrumental.wav')
    audio_music(wav)
    cmd=['ffmpeg','-hide_banner','-y','-v','error','-i',str(raw),'-i',str(wav)]
    if narration:
        cmd.extend(['-i',str(voice_file),'-filter_complex',
           '[1:a]volume=0.38[mu];[mu][2:a]sidechaincompress=threshold=0.018:ratio=8:attack=6:release=230[duck];'
           '[duck][2:a]amix=inputs=2:duration=longest:weights=0.46 1.00,'
           'loudnorm=I=-16:TP=-2.0:LRA=8[a]', '-map','0:v','-map','[a]'])
    else:
        cmd+=['-map','0:v','-map','1:a','-af','loudnorm=I=-16:TP=-2.0:LRA=8']
    cmd+=['-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',
          '-c:a','aac','-b:a','160k','-t',str(LENGTH),'-movflags','+faststart',str(out)]
    subprocess.run(cmd,check=True)
    raw.unlink(missing_ok=True);wav.unlink(missing_ok=True)
    proof=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(out)],text=True))
    v=next(s for s in proof['streams'] if s['codec_type']=='video')
    if (v['width'],v['height'],v['r_frame_rate'])!=(W,H,'30/1'):raise ValueError('Master does not meet native composition specification')
    result={'version':'v0.37','variant':variant,'fullhd_native':True,'size':f'{W}x{H}',
            'fps':FPS,'duration_sec':LENGTH,'real_film_sha1':FILM_SHA1,'film_source':'France, 2011 (NOT CSN)',
            'historical_photo_source_years':[1941,1969,2014],
            'source_sha1':{k:sha1(p) for k,p in [('1941',photo1941),('1969',photo1969),('2014',photo2014)]},
            'choreography':list(LABELS),'independent_motion_grammars':8,
            'independent_typography_grammars':8,
            'title_grammars':[typography_timing(i,0,variant)['grammar'] for i in range(8)],
            'narrative_titles':[s[3] for s in STAGES],
            'editorial_exposure_seconds':[typography_timing(i,0,variant)['exposure_sec'] for i in range(8)],
            'narrative_event_seconds':[t for t,w in EVENTS],
            'motion_plan_fingerprint':'semantic_event_driven_32_word_recording',
            'editorial_graphic_poses_fps':15,'footage_output_fps':30,
            'animation_has_semantic_anchors':True,'not_published':True,'narration_embedded':bool(narration),
            'narration_sha256':narration['sha256'] if narration else None,
            'narration_identity_verified':False,
            'local_audio_pipeline_testable_without_new_TTS':True,
            'archive_and_film_not_altered':True,
            'narrative_titles_aligned_to_real_source':True,
            'timing_based_on_real_Alexandre_recording':True,'synchronized_spoken_audio_verified':False,
            'audio':'mix with supplied local audio' if narration else 'original synthesized instrumental only',
            'artistic_score_certified':False,'publication_approved':False,'human_reviewed':False}
    out.with_suffix('.json').write_text(json.dumps(result,indent=2,ensure_ascii=False))
    return result


def contact(video,out):
    cap=cv2.VideoCapture(str(video));imgs=[]
    for s in STAGES:
        cap.set(cv2.CAP_PROP_POS_MSEC,(s[0]+s[1])*500)
        ok,f=cap.read()
        if not ok:raise ValueError('Cannot sample review frame')
        imgs.append(cv2.resize(f,(270,480)))
    cap.release();board=np.zeros((960,1080,3),dtype='uint8')
    for i,f in enumerate(imgs):board[(i//4)*480:(i//4+1)*480,(i%4)*270:(i%4+1)*270]=f
    cv2.imwrite(str(out),board)



def export_srt(words, out):
    """Readable cue grouping preserving actual recording starts and ends."""
    def fmt(seconds):
        ms=round(seconds*1000)
        h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);sec,ms=divmod(ms,1000)
        return f'{h:02}:{m:02}:{sec:02},{ms:03}'
    groups=((0,4),(4,12),(12,21),(21,28),(28,32))
    pieces=[]
    for n,(first,last) in enumerate(groups,1):
        text=' '.join(x[0] for x in words[first:last])
        pieces.append(f'{n}\n{fmt(words[first][1])} --> {fmt(words[last-1][2])}\n{text}\n')
    Path(out).write_text('\n'.join(pieces),encoding='utf-8')
    return out


def main():
    p=argparse.ArgumentParser()
    for key in ('photo1941','photo1969','photo2014','film','words','out'):
        p.add_argument('--'+key,required=True,type=Path)
    p.add_argument('--variant',choices=('kinetic','measured'),default='kinetic')
    p.add_argument('--voice',type=Path,help='Existing MP3/WAV bytes; no generation or download')
    a=p.parse_args()
    result=render(a.photo1941,a.photo1969,a.photo2014,a.film,a.words,a.out,a.variant,a.voice)
    contact(a.out,a.out.with_suffix('.jpg'))
    export_srt(words_load(a.words),a.out.with_suffix('.srt'))
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':main()