"""Aço Gráfico v0.25: original industrial-comic brutalist kinetic renderer.

Art direction borrows general printmaking/motion techniques, not character art.
Source still/video are real and separately labelled. This module does not
fetch media, invent documentary scenes, call ElevenLabs, or publish.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import subprocess
import wave
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
try:
    from .voice_timed_v24 import load_words, cues
except ImportError:
    try:
        from reel_voice_sync_v24 import load_words, cues
    except ImportError:
        from voice_timed_v24 import load_words, cues

W,H,FPS=540,960,24
DURATION=14.5
BG=(10,14,29)
CREAM=(245,239,215)
ORANGE=(255,100,54)
MAGENTA=(252,48,119)
CYAN=(47,224,244)
YELLOW=(249,218,59)
TINT=(16,29,48)
FONT_COND='/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Bold.ttf'
FONT_HEAVY='/usr/share/fonts/truetype/lato/Lato-Heavy.ttf'
FONT_BOLD='/usr/share/fonts/truetype/lato/Lato-Bold.ttf'

@dataclass(frozen=True)
class Beat:
    start:float
    end:float
    name:str
    source:str
    title:str
    tag:str

BEATS=(
    Beat(0,1.9,'imprint','photo','VOLTA REDONDA','CIDADE DE AÇO'),
    Beat(1.9,4.1,'monument','photo','C S N','ARQUIVO LOCAL / 2014'),
    Beat(4.1,6.22,'printer','photo','2014','UMA CIDADE, MUITAS CAMADAS'),
    Beat(6.22,7.94,'furnace','film','SIDERURGIA','FILME REAL / FRANÇA'),
    Beat(7.94,9.55,'filmstrip','film','FRANÇA','DOCUMENTO EM MOVIMENTO / 2011'),
    Beat(9.55,11.65,'collision','both','IMAGENS','DOIS ARQUIVOS / ORIGENS DISTINTAS'),
    Beat(11.65,14.5,'resolution','both','A ORIGEM','É PARTE DA HISTÓRIA'),
)

@lru_cache(maxsize=45)
def font(size:int,kind='cond'):
    return ImageFont.truetype({'cond':FONT_COND,'heavy':FONT_HEAVY,'body':FONT_BOLD}[kind],size)

def rgb_to_bgr(col):return (col[2],col[1],col[0])
def smoothstep(p):
    q=max(0.,min(1.,p));return q*q*(3-2*q)

def cover(image,w,h,cx=.5,cy=.5,zoom=1.):
    if image is None or image.ndim!=3 or image.shape[2]!=3:
        raise ValueError('source must be BGR image')
    if w<=0 or h<=0 or not (1<=zoom<=1.75):raise ValueError('invalid crop')
    ih,iw=image.shape[:2]
    ratio=w/h
    if iw/ih>ratio:
        crop_h=ih/zoom;crop_w=crop_h*ratio
    else:
        crop_w=iw/zoom;crop_h=crop_w/ratio
    cw=max(1,int(crop_w));ch=max(1,int(crop_h))
    x=int(np.clip(cx*iw-cw*.5,0,iw-cw));y=int(np.clip(cy*ih-ch*.5,0,ih-ch))
    roi=image[y:y+ch,x:x+cw]
    return cv2.resize(roi,(w,h),interpolation=cv2.INTER_AREA if cw>w and ch>h else cv2.INTER_LINEAR)

@lru_cache(maxsize=3)
def texture(seed=19):
    # Industrial paper/screenprint patterns are procedural and original.
    rng=np.random.default_rng(seed)
    grain=rng.integers(-12,13,size=(H,W,1),dtype=np.int16)
    dots=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(dots)
    for y in range(0,H,12):
        for x in range(0,W,12):
            yy=y+(6 if (x//12)%2 else 0)
            r=2 if (x//12+y//12)%5 else 3
            d.ellipse((x-r,yy-r,x+r,yy+r),fill=(6,10,28,55))
    return grain,np.asarray(dots).copy()

def film_treatment(img,variant='zine',intensity=.10):
    # Print grain only: documentary image content remains recognizable.
    grain,_=texture()
    shade=np.asarray(img,dtype=np.int16)
    if variant=='zine':
        shade=shade*np.array([.94,1.0,1.055])[None,None,:]
    else:
        shade=shade*np.array([1.03,1.01,.96])[None,None,:]
    shade+=grain*intensity
    return np.uint8(np.clip(shade,0,255))

def polygon_img(canvas,layer,points):
    mask=np.zeros((H,W),np.uint8)
    cv2.fillPoly(mask,[np.asarray(points,np.int32)],255)
    canvas[mask>0]=layer[mask>0]

def scene_background(photo,moving,beat:Beat,p,variant='zine'):
    canvas=np.empty((H,W,3),np.uint8);canvas[:]=rgb_to_bgr(BG)
    image=photo if beat.source=='photo' else moving
    if beat.name=='imprint':
        full=cover(photo,W,H,.46+.065*p,.51,1.13+.08*p)
        canvas[:]=full
    elif beat.name=='monument':
        full=cover(photo,W,H,.46+.07*p,.50,1.10+.12*p)
        canvas[:]=full
    elif beat.name=='printer':
        back=cover(photo,W,H,.49+.04*p,.50,1.13)
        canvas[:]=cv2.addWeighted(back,.49,np.full_like(back,rgb_to_bgr(TINT)),.51,0)
        for j,off in enumerate((0,1,2)):
            sx=round(((-1)**j)*(7+12*p));ww=480
            crop=cover(photo,ww,185,.20+.29*j+.03*p,.40+.08*j,1.15)
            y=168+j*189;x=28+sx
            canvas[y:y+185,x:x+ww]=crop
    elif beat.name=='furnace':
        full=cover(moving,W,H,.50,.53,1.13+.085*p)
        canvas[:]=full
    elif beat.name=='filmstrip':
        full=cover(moving,W,H,.52-.06*p,.50,1.12)
        canvas[:]=cv2.addWeighted(full,.7,np.full_like(full,rgb_to_bgr(TINT)),.3,0)
        panel=cover(moving,488,345,.58+.03*p,.51,1.04)
        canvas[258:603,26:514]=panel
    elif beat.name=='collision':
        a=cover(photo,W,H,.40+.08*p,.51,1.13+.1*p)
        b=cover(moving,W,H,.62-.05*p,.5,1.1)
        canvas[:]=a
        diagonal=round(205+40*smoothstep(p))
        polygon_img(canvas,b,[(diagonal+70,0),(W,0),(W,H),(diagonal-90,H)])
        cv2.line(canvas,(diagonal+70,0),(diagonal-90,H),rgb_to_bgr(YELLOW),9,cv2.LINE_AA)
    else:
        full=cover(photo,W,H,.52,.48,1.20+.025*p)
        canvas[:]=cv2.addWeighted(full,.30,np.full_like(full,rgb_to_bgr(BG)),.70,0)
        fg=cover(moving,W,H,.51+.05*p,.52,1.18)
        polygon_img(canvas,fg,[(180,246),(W,166),(W,650),(88,705)])
        cv2.polylines(canvas,[np.array([[180,246],[W,166],[W,650],[88,705],[180,246]],np.int32)],True,rgb_to_bgr(YELLOW),8,cv2.LINE_AA)
    return film_treatment(canvas,variant)


def put(draw,xy,text,sz,color=CREAM,kind='cond',max_w=498,misprint=2,anchor=None):
    s=sz
    while s>24 and draw.textbbox((0,0),text,font=font(s,kind))[2]>max_w:
        s-=2
    x,y=xy
    if misprint:
        draw.text((x+misprint,y),text,font=font(s,kind),fill=MAGENTA)
        draw.text((x-misprint,y+1),text,font=font(s,kind),fill=CYAN)
    draw.text((x,y),text,font=font(s,kind),fill=color)
    return s


def _wrap_words(words,draw,fs=40,max_w=478):
    texts=[];line=[]
    for w in words:
        proposal=' '.join(x['text'] for x in line+[w])
        if line and draw.textbbox((0,0),proposal,font=font(fs,'heavy'))[2]>max_w:
            texts.append(line);line=[]
        line.append(w)
    if line:texts.append(line)
    return texts


def caption(draw,cs,t,accent=YELLOW):
    current=next((item for item in cs if item['start']-.03<=t<=item['end']+.055),None)
    if current is None:return {'active':False,'safe':True}
    words=current['words']
    # Responsive editorial caption strips; 2 lines maximum, not one wide cutoff.
    fs=38
    lines=_wrap_words(words,draw,fs=fs)
    while len(lines)>2 and fs>24:
        fs-=2;lines=_wrap_words(words,draw,fs=fs)
    if len(lines)>2:raise ValueError('caption overflow cannot be hidden')
    # centered near y=695; safe away from Instagram bottom controls
    y=691 if len(lines)==1 else 667
    line_rects=[]
    for li,row in enumerate(lines):
        rowtext=' '.join(w['text'] for w in row)
        widths=[draw.textbbox((0,0),w['text']+' ',font=font(fs,'heavy'))[2] for w in row]
        total=sum(widths)
        x=max(20,(W-total)//2)
        rect=(max(12,x-12),y-5,min(526,x+total+12),y+fs+17)
        draw.polygon([(rect[0]-7,rect[1]),(rect[2],rect[1]),(rect[2]+7,rect[3]),(rect[0],rect[3])],fill=(9,13,29,240))
        draw.line((rect[0]-6,rect[3],rect[2]+7,rect[3]),fill=accent,width=3)
        for word,dx in zip(row,widths):
            active=word['start']<=t<=word['end']+.04
            done=word['end']<t
            col=accent if active else CREAM if done else (203,208,209)
            draw.text((x,y),word['text'],font=font(fs,'heavy'),fill=col)
            x+=dx
        line_rects.append(rect)
        y+=fs+17
    return {'active':True,'safe':all(14<=r[0] and r[2]<=526 and 620<=r[1] and r[3]<=820 for r in line_rects),
            'lines':len(lines),'font':fs,'rects':line_rects}


def _speedlines(draw,t,beat,accent,scale=1):
    # All motion graphics held on twos to produce sharp comics timing.
    held=int(t*FPS)//2
    for j in range(7):
        x=370+j*34+(held%3)*2
        y=90+j*20
        draw.line((x,y,x+80+j*2,y-28+j*2),fill=(*accent,136),width=2 if j%2 else 4)


def graphic_layer(base,beat:Beat,idx:int,p:float,t:float,cs:list,variant='zine'):
    accent=YELLOW if variant=='zine' else CYAN
    intensity=1 if variant=='zine' else .55
    im=Image.fromarray(cv2.cvtColor(base,cv2.COLOR_BGR2RGB)).convert('RGBA')
    overlay=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(overlay)
    _,dottex=texture()
    # Offset screen tones move as separate print layers: NOT altering source pixels.
    dotlayer=Image.fromarray(dottex,'RGBA')
    if variant=='zine':overlay.alpha_composite(dotlayer,((int(t*7)%12)-6,0))
    # top/info and editorial header, not a flat block over full frame
    d.polygon([(0,0),(W,0),(W,126),(0,160)],fill=(10,14,29,231))
    d.line([(0,160),(W,126)],fill=(*accent,255),width=6)
    d.text((25,37),'VR ABANDONADA   //   AÇO GRÁFICO',font=font(17,'heavy'),fill=CREAM)
    d.text((424,36),f'{idx+1:02d} / 07',font=font(17,'heavy'),fill=accent)
    d.text((25,84),beat.tag,font=font(19,'body'),fill=accent)
    d.rectangle((20,116,32,124),fill=(*MAGENTA,255))
    d.rectangle((35,116,47,124),fill=(*CYAN,255))
    _speedlines(d,t,beat,accent)
    # Brutalist geometry must be attached to the meaning of each shot.
    if beat.name=='imprint':
        d.polygon([(-15,240),(W-30,205),(W,415),(-8,455)],fill=(7,13,27,170))
        shock=(1-smoothstep(min(1,p/.2)))*24
        put(d,(16,222+int(shock)),'VOLTA',118,CREAM,max_w=500,misprint=3)
        put(d,(16,331),'REDONDA',105,accent,max_w=505,misprint=4)
        d.line((22,445,438,416),fill=MAGENTA,width=11)
        d.text((28,475),'A CIDADE TEM MEMÓRIA',font=font(26,'heavy'),fill=CREAM)
    elif beat.name=='monument':
        # oversized industrial typography following the central chimney
        d.polygon([(5,288),(530,239),(530,461),(5,508)],fill=(8,14,29,195))
        put(d,(22,258),'C S N',154,CREAM,max_w=510,misprint=4)
        put(d,(19,430),'VOLTA REDONDA',51,accent,max_w=510,misprint=2)
        d.text((26,533),'FOTOGRAFIA AUTÊNTICA',font=font(21,'heavy'),fill=accent)
    elif beat.name=='printer':
        d.polygon([(9,150),(280,129),(295,284),(10,293)],fill=(249,218,59,234))
        put(d,(20,161),'2014',121,BG,max_w=270,misprint=0)
        d.text((35,585),'AÇO  /  CIDADE  /  TRABALHO',font=font(26,'heavy'),fill=CREAM)
        d.line((24,625,514,625),fill=accent,width=6)
    elif beat.name=='furnace':
        d.polygon([(5,182),(535,160),(534,328),(4,363)],fill=(8,12,25,212))
        put(d,(14,184),'SIDERURGIA',81,CREAM,max_w=514,misprint=3)
        put(d,(18,272),'FRANÇA / 2011',47,accent,max_w=490,misprint=2)
        d.polygon([(0,435),(16,411),(25,429),(36,396),(50,430),(68,408),(74,450)],fill=(*MAGENTA,221))
    elif beat.name=='filmstrip':
        d.polygon([(4,183),(W,168),(W,264),(4,273)],fill=(8,12,25,226))
        put(d,(25,186),'ARQUIVO FRANCÊS',56,accent,max_w=495,misprint=2)
        for j in range(9):
            x=18+j*61
            d.rectangle((x,287,x+25,302),fill=(*BG,248))
            d.rectangle((x,561,x+25,576),fill=(*BG,248))
        d.line((23,616,514,616),fill=accent,width=6)
    elif beat.name=='collision':
        d.polygon([(0,167),(W,151),(W,275),(0,288)],fill=(8,13,25,208))
        put(d,(22,190),'2 ARQUIVOS',78,CREAM,max_w=490,misprint=3)
        d.polygon([(10,504),(263,491),(258,550),(10,568)],fill=(10,14,29,231))
        d.polygon([(280,486),(535,476),(530,539),(280,548)],fill=(10,14,29,231))
        d.text((23,510),'CSN / 2014',font=font(25,'heavy'),fill=accent)
        d.text((293,503),'FRANÇA / 2011',font=font(23,'heavy'),fill=CYAN)
    else:
        d.polygon([(0,156),(W,131),(W,310),(0,349)],fill=(9,14,29,229))
        put(d,(19,166),'A ORIGEM',104,CREAM,max_w=511,misprint=3)
        put(d,(19,267),'IMPORTA.',99,accent,max_w=510,misprint=3)
        d.line((20,351,513,351),fill=MAGENTA,width=8)
        # kinetic on-twos final emphasis, not a bland static closing slide
        if int(t*FPS)//2%6==0:
            d.polygon([(465,349),(494,318),(489,356),(526,355),(477,400)],fill=(*accent,216))
    # short source label inside safe middle area (NOT as if French film were CSN)
    credit={'photo':'FOTO 2014  /  CSN — VOLTA REDONDA',
            'film':'FILME 2011  /  SIDERURGIA — FRANÇA',
            'both':'FONTES: CSN 2014  +  FRANÇA 2011'}[beat.source]
    d.polygon([(8,575),(W-9,560),(W-9,619),(8,635)],fill=(5,12,23,214))
    d.text((24,584),credit,font=font(18,'heavy'),fill=accent)
    # Karaoke subtitle callouts use the true aligned word start/end from ElevenLabs.
    capreport=caption(d,cs,t,accent)
    # No central story UI text in the lower 140px, reserved for app chrome.
    d.text((23,830),'TEXTO MEDIDO PELA VOZ / ALEXANDRE',font=font(16,'heavy'),fill=CREAM)
    d.text((23,861),'PREVIEW SEM MP3 EMBUTIDO  /  NÃO PUBLICADO',font=font(13,'body'),fill=(205,212,220))
    d.line((22,884,516,884),fill=(*accent,160),width=4)
    if variant=='zine':
        # Original paper scratches on non-sensitive outskirts; deliberate 12fps hold.
        for k in range(6):
            yy=401+k*23
            d.line((6,yy,13+k%3*4,yy-13),fill=(245,239,215,110),width=2)
    result=Image.alpha_composite(im,overlay)
    return cv2.cvtColor(np.asarray(result.convert('RGB')),cv2.COLOR_RGB2BGR),capreport


def frame_draw(photo,moving,t,cs,variant='zine'):
    if not 0<=t<DURATION:raise ValueError('time out of edit')
    if variant not in ('zine','documental'):raise ValueError('unknown visual direction')
    index=next(i for i,b in enumerate(BEATS) if b.start<=t<b.end)
    beat=BEATS[index];p=(t-beat.start)/(beat.end-beat.start)
    return *graphic_layer(scene_background(photo,moving,beat,p,variant),beat,index,p,t,cs,variant),index


def validate_story(word_data:Path,*,enforce_semantics=True):
    record,words=load_words(word_data)
    if len(BEATS)!=7 or abs(BEATS[0].start)>1e-6 or abs(BEATS[-1].end-DURATION)>1e-6:
        raise ValueError('invalid scene timeline')
    for a,b in zip(BEATS,BEATS[1:]):
        if abs(a.end-b.start)>1e-6:raise ValueError('gapped scene timeline')
    if words[-1]['end']>DURATION-.28:raise ValueError('narration tail truncated')
    if enforce_semantics:
        france=next(x for x in words if x['text'].lower().startswith('siderurgia'))
        firstfilm=next(b for b in BEATS if b.source=='film')
        if firstfilm.start>france['start']+.12:raise ValueError('film arrives too late for semantically labelled image')
        lastlocal=next(x for x in words if x['text'].lower().startswith('quatorze'))
        if BEATS[2].end<lastlocal['end']-.10:raise ValueError('CSN 2014 disappears before date completes')
    return {'edit_seconds':DURATION,'shot_count':len(BEATS),'word_count':len(words),
            'real_word_timings':True,'voice_embedded':False,'publication_approved':False,
            'source_geography_disclosed':True,'safe_design_status':'requires full render inspection'}


def verify_source(file:Path):
    meta=json.loads(file.with_suffix('.json').read_text(encoding='utf8'))
    sha=hashlib.sha1(file.read_bytes()).hexdigest()
    if sha!=meta.get('sha1') or file.stat().st_size!=int(meta.get('size_bytes',-1)):
        raise ValueError('source integrity mismatch')
    return meta


def soundtrack(path:Path,duration=DURATION,sr=32000):
    # Entirely original instrumental scoring, no faux historical on-site audio.
    t=np.arange(round(duration*sr),dtype=np.float64)/sr
    bass=np.sin(2*np.pi*(62*t+4*np.sin(.25*t)))*.095
    pulse=np.sin(2*np.pi*130*t)*np.maximum(0,np.sin(2*np.pi*2*t))**14*.065
    hiss=np.zeros_like(t)
    for j,beat in enumerate(BEATS):
        a=round(beat.start*sr);b=min(len(t),a+round(.17*sr));xx=np.arange(b-a)/sr
        hiss[a:b]+=np.sin(2*np.pi*(190+250*xx)*xx)*np.exp(-xx*20)*.27
    mix=(bass+pulse+hiss)*np.minimum(np.minimum(t/.25,(duration-t)/.35),1).clip(0,1)
    out=np.clip(mix,-.7,.7)
    with wave.open(str(path),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((out*32767).astype('<i2').tobytes())
    return path


def render(photo:Path,film:Path,words:Path,out:Path,variant='zine'):
    v=validate_story(words)
    pmeta,fmeta=verify_source(photo),verify_source(film)
    if pmeta.get('date_label')!=2014 or fmeta.get('date_label')!=2011:
        raise ValueError('required actual source years mismatch')
    if pmeta['id']!='csn_2014' or fmeta['id']!='france_2011':
        raise ValueError('demo footage identity changed')
    src=cv2.imread(str(photo));cap=cv2.VideoCapture(str(film))
    if src is None or not cap.isOpened():raise ValueError('failed to decode real imagery')
    # Source motion at correct elapsed-time; no pose holds except when film ends.
    f_fps=float(cap.get(cv2.CAP_PROP_FPS))
    if f_fps<=0:raise ValueError('film timebase missing')
    rec,wordlist=load_words(words);cs=cues(wordlist)
    out.parent.mkdir(parents=True,exist_ok=True)
    silent=out.with_name(out.stem+'_silent.mp4')
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*'mp4v'),FPS,(W,H))
    if not writer.isOpened():raise ValueError('silent video encoder unavailable')
    current=-1;moving=None;caps=[]
    try:
        for i in range(round(DURATION*FPS)):
            target=round(i*f_fps/FPS)
            while current<target:
                ok,frame=cap.read()
                if not ok:raise ValueError('original film ends before end of edit')
                moving=frame;current+=1
            t=i/FPS
            result,c,scene=frame_draw(src,moving,t,cs,variant)
            caps.append(c)
            writer.write(result)
    finally:
        writer.release();cap.release()
    if not all(c['safe'] for c in caps):raise ValueError('subtitle shape outside preferred safe area')
    music=out.with_suffix('.wav');soundtrack(music)
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(silent),'-i',str(music),
                    '-map','0:v','-map','1:a','-af','loudnorm=I=-17:TP=-2.4:LRA=7,alimiter=limit=0.70:level=false',
                    '-c:v','libx264','-crf','19','-preset','fast','-pix_fmt','yuv420p',
                    '-c:a','aac','-b:a','160k','-t',str(DURATION),'-movflags','+faststart',str(out)],check=True)
    return {'version':'0.25','style':'Aranhaverso-brutalista autoral','variant':variant,
            'duration':DURATION,'fps':FPS,'size':[W,H],
            'scenes':len(BEATS),'words':len(wordlist),'caption_layout_failures':0,
            'real_movie_source':'Damien Vicart, França 2011','real_photo_source':'HenriqueBarraMansa, CSN Volta Redonda 2014',
            'original_voice_embedded':False,'voice_only_caption_times':True,'publication_approved':False,
            'technical_quality_not_artistic_score':True}


def contact(video:Path,out:Path):
    cap=cv2.VideoCapture(str(video));frames=[]
    if not cap.isOpened():raise ValueError('cannot read preview')
    for beat in BEATS:
        s=beat.start+.54*(beat.end-beat.start)
        cap.set(cv2.CAP_PROP_POS_MSEC,s*1000)
        ok,f=cap.read()
        if not ok:raise ValueError('contact frame failed')
        frames.append(cv2.resize(f,(270,480)))
    cap.release()
    image=np.full((960,1080,3),rgb_to_bgr(BG),np.uint8)
    for i,f in enumerate(frames):
        x=(i%4)*270;y=(i//4)*480
        image[y:y+480,x:x+270]=f
    if not cv2.imwrite(str(out),image):raise ValueError('contact save failed')
    return out


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--photo',type=Path,required=True)
    ap.add_argument('--film',type=Path,required=True)
    ap.add_argument('--words',type=Path,required=True)
    ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--variant',choices=('zine','documental'),default='zine')
    args=ap.parse_args()
    report=render(args.photo,args.film,args.words,args.out,args.variant)
    report['contact']=str(contact(args.out,args.out.with_suffix('.jpg')))
    args.out.with_suffix('.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':main()