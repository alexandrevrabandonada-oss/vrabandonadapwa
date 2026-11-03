"""Aço Gráfico 0.29: native 1080p/30 original documentary-comic montage.

Source footage remains unaltered beyond virtual-camera cropping in labelled
editorial layouts. No fake footage, no TTS synthesis and no auto-publication.
All public use requires a separate editorial approval gate.
"""
from __future__ import annotations
import argparse, hashlib, json, math, wave, subprocess, os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W,H,FPS,DUR=1080,1920,30,14.5
START,BOTTOM=150,1480
DARK=(18,16,32)  # RGB
CREAM=(246,239,222)
MAGENTA=(228,45,113)
YELLOW=(253,213,61)
CYAN=(86,222,245)
FONT='/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Bold.ttf'
BODY='/usr/share/fonts/truetype/lato/Lato-Bold.ttf'
HEAVY='/usr/share/fonts/truetype/lato/Lato-Heavy.ttf'

@dataclass(frozen=True)
class Shot:
    start:float
    end:float
    role:str
    frame_mode:str
    headline:str
    credit:str
    film_at:float|None=None
    focus:float=.5

SHOTS=(
 Shot(0,1.90,'photo','poster','A CIDADE TEM MEMÓRIA','CSN · VOLTA REDONDA · FOTOGRAFIA DE 2014'),
 Shot(1.90,4.08,'photo','archive','A USINA / 2014','CSN · VOLTA REDONDA · FOTOGRAFIA DE 2014'),
 Shot(4.08,6.16,'photo','strips','O PESO DA IMAGEM','CSN · VOLTA REDONDA · FOTOGRAFIA DE 2014'),
 Shot(6.16,8.46,'film','molten','SIDERURGIA EM MOVIMENTO','FRANÇA · FILMAGEM INDUSTRIAL DE 2011',2.6,.43),
 Shot(8.46,9.66,'film','worker','TRABALHO REAL','FRANÇA · FILMAGEM INDUSTRIAL DE 2011',7.8,.77),
 Shot(9.66,11.56,'film','furnace','OUTRA ORIGEM','FRANÇA · FILMAGEM INDUSTRIAL DE 2011',27.8,.52),
 Shot(11.56,14.5,'both','comparison','NÃO MISTURAR ORIGENS','CSN 2014 / FRANÇA 2011 · FONTES DIFERENTES',22.4,.55),
)


def check_plan(shots=SHOTS):
    if not shots or abs(shots[0].start)>.00001 or abs(shots[-1].end-DUR)>.00001:
        raise ValueError('incomplete edit')
    for i,s in enumerate(shots):
        if s.start>=s.end or (i and abs(s.start-shots[i-1].end)>.00001):
            raise ValueError('gap, overlap or empty shot')
        if s.role not in ('photo','film','both') or (s.role!='photo' and s.film_at is None):
            raise ValueError('invalid source role or missing video window')
        if s.credit.startswith('CSN') and s.role=='film':
            raise ValueError('do not misidentify foreign footage as CSN')
    return {'shots':len(shots),'duration':DUR,'film_windows':sum(x.film_at is not None for x in shots)}


def read_words(path:Path):
    d=json.loads(path.read_text(encoding='utf-8'))
    words=d.get('words',[])
    if not words:raise ValueError('no spoken word times')
    result=[];last=-1.
    for entry in words:
        if isinstance(entry,list):w,s,e=entry
        else:w,s,e=entry['text'],entry['start'],entry['end']
        if not w or not (0<=s<e<=14.15) or s<last:raise ValueError('invalid original word timestamps')
        result.append({'text':str(w),'start':float(s),'end':float(e)})
        last=e
    if len(result)!=32 or abs(result[-1]['end']-14.071)>.15:
        raise ValueError('wrong Alexandre word sequence for this edit')
    return result


def hashcheck(path,sha1=None):
    if not Path(path).is_file():raise FileNotFoundError(path)
    h=hashlib.sha1(Path(path).read_bytes()).hexdigest()
    if sha1 and h!=sha1:raise ValueError('source checksum mismatch')
    return h


def cover(image,w,h,cx=.5,cy=.5,zoom=1.):
    ih,iw=image.shape[:2]
    k=max(w/iw,h/ih)*zoom
    rw=max(w,round(iw*k));rh=max(h,round(ih*k))
    img=cv2.resize(image,(rw,rh),interpolation=cv2.INTER_AREA if k<1 else cv2.INTER_LINEAR)
    sx=int(np.clip(cx*rw-w/2,0,rw-w));sy=int(np.clip(cy*rh-h/2,0,rh-h))
    return img[sy:sy+h,sx:sx+w].copy()


def contain(image,w,h):
    ih,iw=image.shape[:2];k=min(w/iw,h/ih)
    iw2,ih2=max(1,round(iw*k)),max(1,round(ih*k))
    return cv2.resize(image,(iw2,ih2),interpolation=cv2.INTER_AREA if k<1 else cv2.INTER_LINEAR)


def gradient_background(variant):
    y=np.linspace(0,1,H,dtype=np.float32)[:,None,None]
    base=np.array([DARK[2],DARK[1],DARK[0]],np.float32)[None,None,:]
    m=np.array([34,20,25] if variant=='graphic' else [34,25,14],np.float32)[None,None,:]
    return np.uint8(np.clip(np.broadcast_to(base+(m-base)*y*.4,(H,W,3)),0,255)).copy()


def frame_image(photo,film,shot,elapsed,variant):
    t=min(1,elapsed/max(.01,shot.end-shot.start))
    canvas=gradient_background(variant)
    ac=YELLOW if variant=='graphic' else CYAN
    accent=(ac[2],ac[1],ac[0]);ink=(14,12,27)
    if shot.frame_mode=='poster':
        bg=cover(photo,W,BOTTOM-START,cx=.34+.13*t,cy=.51,zoom=1.06+.04*t)
        canvas[START:BOTTOM]=bg
        # Photographic slices move at distinct velocities; no fabricated contents.
        for j in range(4):
            seg=cover(photo,960,215,cx=.29+.14*j+.04*t,cy=.26+.15*j,zoom=1.09)
            x=round(60+(1-min(1,elapsed/.32))*(160 if j%2 else -160))
            yy=230+j*286
            l=max(0,x);r=min(W,x+960)
            if l<r:canvas[yy:yy+215,l:r]=seg[:,l-x:r-x]
            cv2.line(canvas,(0,yy+219),(W,yy+219),accent,5,cv2.LINE_AA)
    elif shot.frame_mode=='archive':
        canvas[START:BOTTOM]=cover(photo,W,BOTTOM-START,.55-.05*t,.51,zoom=1.18)
        original=contain(photo,992,688)
        x=(W-original.shape[1])//2;y=380+round(16*math.sin(t*math.pi))
        cv2.rectangle(canvas,(x-12,y-12),(x+original.shape[1]+12,y+original.shape[0]+12),ink,-1)
        canvas[y:y+original.shape[0],x:x+original.shape[1]]=original
        cv2.rectangle(canvas,(x-12,y-12),(x+original.shape[1]+12,y+original.shape[0]+12),accent,9,cv2.LINE_AA)
        cv2.line(canvas,(52,1135),(1027,1135),(62,115,221),8,cv2.LINE_AA)
    elif shot.frame_mode=='strips':
        raw=cover(photo,W,BOTTOM-START,.45+.07*t,.50,1.09)
        canvas[START:BOTTOM]=cv2.addWeighted(raw,.50,np.full_like(raw,ink),.5,0)
        for j in range(3):
            patch=cover(photo,1000,300,cx=.28+.23*j+.06*t,cy=.28+.22*j,zoom=1.07)
            x=40+round((1-min(1,elapsed/.34))*(-140 if j%2 else 140))
            y=280+j*350
            l=max(0,x);r=min(W,x+1000)
            if l<r:canvas[y:y+300,l:r]=patch[:,l-x:r-x]
            cv2.line(canvas,(20,y+306),(W-20,y+306),accent,7,cv2.LINE_AA)
    elif shot.frame_mode in ('molten','worker','furnace'):
        raw=cover(film,W,BOTTOM-START,cx=shot.focus+.022*math.sin(t*math.pi),cy=.52,zoom=1.02+.025*t)
        canvas[START:BOTTOM]=raw
        if shot.frame_mode=='worker':
            cv2.line(canvas,(20,180),(20,1390),accent,8,cv2.LINE_AA)
            cv2.line(canvas,(1060,180),(1060,1390),accent,8,cv2.LINE_AA)
        elif shot.frame_mode=='furnace':
            cv2.line(canvas,(80,1380),(1000,1380),(49,76,239),10,cv2.LINE_AA)
    else:
        # Explicit two-source comparison rather than pretending they are one location.
        pic=cover(photo,W,612,.48+.03*t,.49,zoom=1.08)
        movie=cover(film,W,660,shot.focus,.52,zoom=1.03)
        canvas[START:START+612]=pic
        canvas[START+642:START+642+660]=movie
        cv2.rectangle(canvas,(0,START+614),(W,START+640),accent,-1)
    # Documentary graphics at perimeters only; raw imagery not tinted.
    for i in range(0,96,12):
        if i%24==0:
            cv2.line(canvas,(i,START),(i+90,START),(35,34,228) if variant=='graphic' else accent,3)
    return canvas


@lru_cache(maxsize=32)
def font(size,kind='heavy'):
    return ImageFont.truetype(FONT if kind=='cond' else BODY if kind=='body' else HEAVY,size)


def lines_fit(draw,text,max_width,max_size=130,max_lines=2):
    words=text.split();size=max_size
    while size>=18:
        f=font(size,'cond');rows=[];cur=''
        for word in words:
            proposed=(cur+' '+word).strip()
            if cur and draw.textbbox((0,0),proposed,font=f)[2]>max_width:
                rows.append(cur);cur=word
            else:cur=proposed
        if cur:rows.append(cur)
        if len(rows)<=max_lines and all(draw.textbbox((0,0),x,font=f)[2]<=max_width for x in rows):return rows,f,size
        size-=4
    raise ValueError('unreadable headline')


def static_overlay(shot,variant,idx,phase,voice_embedded=False):
    """Original native-resolution typography cached per scene, not upscaled artwork."""
    ac=YELLOW if variant=='graphic' else CYAN
    canvas=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(canvas)
    d.polygon([(0,0),(W,0),(W,150),(0,165)],fill=(11,14,23,250))
    d.text((40,38),'VR ABANDONADA',font=font(66,'cond'),fill=CREAM)
    d.text((41,110),'AÇO GRÁFICO  /  DOCUMENTÁRIO EM CAMADAS',font=font(23,'body'),fill=ac)
    d.text((892,55),f'{idx+1:02d} / {len(SHOTS):02d}',font=font(36,'heavy'),fill=ac)
    d.line([(0,162),(W,148)],fill=(*ac,240),width=7)
    if phase=='impact':
        d.polygon([(0,245),(W,200),(W,545),(0,588)],fill=(9,12,25,215))
        rows,ft,sz=lines_fit(d,shot.headline,976,max_size=128,max_lines=2)
        for j,row in enumerate(rows):
            y=278+j*(sz+8)
            d.text((42+5,y+4),row,font=ft,fill=(*MAGENTA,235))
            d.text((42,y),row,font=ft,fill=CREAM)
        d.line([(0,607),(W,580)],fill=(*ac,255),width=10)
    else:
        d.polygon([(0,185),(W-180,178),(W-197,258),(0,270)],fill=(9,12,25,215))
        rows,ft,sz=lines_fit(d,shot.headline,825,max_size=61,max_lines=1)
        d.text((44,198),rows[0],font=ft,fill=ac)
    # Short, correct attribution, not overlaid on unaltered historical documents.
    d.rectangle((0,1805,W,1920),fill=(9,13,24,253))
    credit=shot.credit
    rows,ft,_=lines_fit(d,credit,1012,max_size=29,max_lines=2)
    for j,row in enumerate(rows): d.text((40,1810+j*31),row,font=ft,fill=ac)
    d.text((40,1879),'ESTUDO INTERNO  ·  '+('VOZ ALEXANDRE EMBUTIDA' if voice_embedded else 'VOZ ALEXANDRE NÃO EMBUTIDA'),font=font(24,'body'),fill=CREAM)
    for i in range(6):
        cx=70+i*170
        cy=1726+(i%2)*7
        d.ellipse((cx,cy,cx+6,cy+6),fill=(*ac,120))
    return np.array(canvas)


def alpha_composite(dst,overlay,opacity=1.,y_offset=0):
    # Render RGBA in original 1080p coordinate space and composite only populated bounds.
    if opacity<=0:return dst
    if y_offset:
        overlay=np.roll(overlay,int(y_offset),axis=0)
    alpha=overlay[:,:,3:4].astype(np.float32)*(opacity/255.)
    return np.uint8(np.clip(dst.astype(np.float32)*(1-alpha)+overlay[:,:,:3][:,:,::-1].astype(np.float32)*alpha,0,255))


def cue_groups(words):
    # User speech timing, not synthetic time estimates.
    groups=[];current=[]
    for i,w in enumerate(words):
        current.append(i)
        chars=sum(len(words[j]['text'])+1 for j in current)
        span=words[current[-1]]['end']-words[current[0]]['start']
        if (len(current)>=5 or chars>42 or span>2.45 or w['text'].endswith(('.',',',';','!','?'))):
            groups.append(current);current=[]
    if current:groups.append(current)
    return groups


def caption_draw(words,at,variant):
    groups=cue_groups(words)
    active=next((i for i,w in enumerate(words) if w['start']<=at<w['end']),None)
    gid=next((i for i,indices in enumerate(groups) if indices[0]<=active<=indices[-1]),None) if active is not None else None
    if gid is None:
        # Keep previous group in short word gaps, but no fabricated speech outside its duration.
        for i,idx in enumerate(groups):
            if words[idx[0]]['start']<=at<words[idx[-1]]['end']+.18:
                gid=i;break
    if gid is None:return None
    return gid,active


@lru_cache(maxsize=128)
def caption_region(serialized, gid, active, variant, voice_embedded=False):
    words=json.loads(serialized);idx=cue_groups(words)[gid]
    ac=YELLOW if variant=='graphic' else CYAN
    img=Image.new('RGBA',(W,318),(12,16,27,244));d=ImageDraw.Draw(img)
    d.line([(34,5),(W-34,5)],fill=(*ac,230),width=7)
    phrase=[words[i]['text'] for i in idx]
    # Two balanced rows with word emphasis; punctuation always preserved.
    split=math.ceil(len(idx)/2) if len(' '.join(phrase))>28 else len(idx)
    rows=[idx[:split]] + ([idx[split:]] if split<len(idx) else [])
    y0=49 if len(rows)==2 else 90
    for n,row in enumerate(rows):
        text=' '.join(words[i]['text'] for i in row)
        f=font(64 if len(text)<35 else 56,'cond')
        width=sum(d.textlength(words[i]['text']+(' ' if i!=row[-1] else ''),font=f) for i in row)
        scale=1.0
        while width>1000 and f.size>=37:
            f=font(f.size-3,'cond')
            width=sum(d.textlength(words[i]['text']+(' ' if i!=row[-1] else ''),font=f) for i in row)
        x=(W-width)/2
        for i in row:
            txt=words[i]['text']; ww=d.textlength(txt+' ',font=f)
            if active==i:
                d.rounded_rectangle((x-7,y0+n*82-2,x+ww-3,y0+n*82+68),radius=5,fill=(*ac,235))
                fill=(10,17,28)
            else:fill=CREAM
            d.text((x,y0+n*82),txt,font=f,fill=fill,stroke_width=1)
            x+=ww
    d.text((42,264),'TRANSCRIÇÃO CRONOMETRADA · '+('VOZ ORIGINAL EMBUTIDA' if voice_embedded else 'VOZ ORIGINAL NÃO INCLUÍDA'),font=font(21,'body'),fill=(*ac,250))
    return np.array(img)


def soundtrack(path,shots=SHOTS,seconds=DUR,sr=48000):
    """Original abstract score: not location audio; cue hits precisely on edits."""
    t=np.arange(round(seconds*sr),dtype=np.float32)/sr
    # Industrial drone and syncopated synth. Never presented as footage sound.
    drone=np.sin(2*np.pi*(58*t+2*np.sin(.2*t)))*.17
    grit=np.sin(2*np.pi*111*t)*.025
    percussive=np.zeros_like(t)
    rng=np.random.default_rng(829)
    for shot in shots:
        a=round(shot.start*sr)
        n=min(len(percussive)-a,round(.19*sr))
        if n<=0:continue
        tick=np.arange(n)/sr
        percussive[a:a+n]+=(.23*np.sin(2*np.pi*(68-18*tick)*tick)+.08*rng.standard_normal(n))*np.exp(-28*tick)
    envelope=np.minimum(1.,t/.28)*np.minimum(1.,(seconds-t)/.55)
    sig=np.tanh((drone+grit+percussive)*1.5)*np.clip(envelope,0,1)
    pcm=(sig*32767).astype('<i2')
    with wave.open(str(path),'wb') as wavefile:
        wavefile.setnchannels(1);wavefile.setsampwidth(2);wavefile.setframerate(sr);wavefile.writeframes(pcm.tobytes())
    return path


def inspect_audio(path,expected=14.071292517):
    """Do not mark a master voiced if audio was not actually decoded and checked."""
    out=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(path)],text=True)
    duration=float(json.loads(out)['format']['duration'])
    if abs(duration-expected)>.42:
        raise ValueError('voice duration differs from aligned original voice')
    return {'duration_sec':duration,'sha256':hashlib.sha256(Path(path).read_bytes()).hexdigest()}


def render(photo_path,film_path,words_path,out,variant='graphic',voice_path=None,quality='master'):
    if variant not in ('graphic','cinema'):raise ValueError('unknown variant')
    check_plan();words=read_words(words_path)
    # An explicit local audio file is the only way to mark the movie as voiced.
    voice=inspect_audio(voice_path) if voice_path else None
    photo_hash=hashcheck(photo_path,'6a792f0fd16ddd4c8bed2ca981788c9b9accb7a4')
    film_hash=hashcheck(film_path,'c1129cac8654866856c7bec31196206f16eac6c7')
    img=cv2.imread(str(photo_path));cap=cv2.VideoCapture(str(film_path))
    if img is None or not cap.isOpened():raise ValueError('source unreadable')
    source_fps=cap.get(cv2.CAP_PROP_FPS)
    out=Path(out);out.parent.mkdir(parents=True,exist_ok=True)
    silent=out.with_name(out.stem+'_silent.avi')
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*'MJPG'),FPS,(W,H))
    if not writer.isOpened():raise RuntimeError('native output video writer unavailable')
    overlays={(i,phase):static_overlay(s,variant,i,phase,voice_embedded=voice is not None) for i,s in enumerate(SHOTS) for phase in ('impact','quiet')}
    doc=json.dumps(words,ensure_ascii=False,separators=(',',':'))
    active_film_index=-1;last_frame_id=-1;movie=None
    try:
        for f in range(round(DUR*FPS)):
            t=f/FPS
            idx=next(i for i,s in enumerate(SHOTS) if s.start<=t<s.end)
            shot=SHOTS[idx];elapsed=t-shot.start
            if shot.film_at is not None:
                frame_id=round((shot.film_at+elapsed)*source_fps)
                if idx!=active_film_index or frame_id<last_frame_id:
                    cap.set(cv2.CAP_PROP_POS_FRAMES,frame_id);last_frame_id=frame_id-1
                while last_frame_id<frame_id:
                    ok,movie=cap.read()
                    if not ok:raise ValueError('film ends during selected shot')
                    last_frame_id+=1
                active_film_index=idx
            elif movie is None:
                movie=img
            base=frame_image(img,movie,shot,elapsed,variant)
            # After 0.65 sec, title retreats; native graphics re-composed at 1080.
            phase='impact' if elapsed<.38 else 'quiet'
            base=alpha_composite(base,overlays[(idx,phase)])
            current=caption_draw(words,t,variant)
            if current:
                gid,active=current
                sub=caption_region(doc,gid,active,variant,voice_embedded=voice is not None)
                alpha=sub[:,:,3:4].astype('float32')/255
                region=base[1470:1788].astype('float32')
                base[1470:1788]=np.uint8(np.clip(region*(1-alpha)+sub[:,:,:3][:,:,::-1]*alpha,0,255))
            # A minimalist moving beat position; must not cover captions or image.
            pos=round((f/max(1,round(DUR*FPS)-1))*W)
            ac=YELLOW if variant=='graphic' else CYAN
            cv2.rectangle(base,(0,H-9),(pos,H-1),(ac[2],ac[1],ac[0]),-1)
            writer.write(base)
    finally:
        writer.release();cap.release()
    music=out.with_suffix('.wav');soundtrack(music)
    audio_inputs=['-i',str(silent),'-i',str(music)]
    if voice:
        # Voice stays at original pitch and speed; background ducks to the voice.
        audio_inputs+=['-i',str(voice_path)]
        filtera='[1:a]volume=0.32[m];[m][2:a]sidechaincompress=threshold=0.015:ratio=8:attack=8:release=220[du];[du][2:a]amix=inputs=2:duration=longest:weights=0.48 1.0,loudnorm=I=-16:TP=-2:LRA=8[a]'
        maps=['-filter_complex',filtera,'-map','0:v:0','-map','[a]']
    else:
        maps=['-map','0:v:0','-map','1:a:0','-af','loudnorm=I=-16:TP=-2.4:LRA=7']
    cmd=['ffmpeg','-hide_banner','-y','-v','error',*audio_inputs,*maps,'-c:v','libx264','-preset','fast' if quality=='master' else 'ultrafast','-crf','18' if quality=='master' else '23','-pix_fmt','yuv420p','-r',str(FPS),'-c:a','aac','-b:a','192k','-t',str(DUR),'-movflags','+faststart',str(out)]
    subprocess.run(cmd,check=True)
    # True property comes from the actual encoded media, not request parameters.
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(out)],text=True))
    vs=next(s for s in probe['streams'] if s['codec_type']=='video')
    if (int(vs['width']),int(vs['height']))!=(W,H) or vs.get('r_frame_rate')!='30/1':raise ValueError('failed true native master dimensions')
    info={'version':'v0.29','variant':variant,'file':str(out),'resolution':f'{W}x{H}',
          'native_composition':True,'upscaled_old_video':False,'fps':FPS,'duration_sec':DUR,
          'shots':[vars(s) for s in SHOTS],'different_film_windows':len(set(s.film_at for s in SHOTS if s.film_at is not None)),
          'historical_contexts':['CSN Volta Redonda photo 2014','France metallurgy documentary 2011'],
          'voice_embedded':voice is not None,'voice_sha256':voice['sha256'] if voice else None,
          'word_timings_from_voice':True,'aesthetic_score':None,'publication_approved':False,
          'source_sha1':{'photo':photo_hash,'film':film_hash},'human_editorial_review':False}
    out.with_suffix('.json').write_text(json.dumps(info,indent=2,ensure_ascii=False),encoding='utf-8')
    silent.unlink(missing_ok=True);music.unlink(missing_ok=True)
    return info


def main():
    ap=argparse.ArgumentParser()
    for a in ('photo','film','words','out'):ap.add_argument('--'+a,required=True,type=Path)
    ap.add_argument('--variant',default='graphic',choices=['graphic','cinema'])
    ap.add_argument('--voice',type=Path)
    ap.add_argument('--quality',default='master',choices=['master','draft'])
    opts=ap.parse_args()
    result=render(opts.photo,opts.film,opts.words,opts.out,opts.variant,opts.voice,opts.quality)
    print(json.dumps({k:result[k] for k in ('resolution','fps','duration_sec','voice_embedded','different_film_windows')},indent=2))

if __name__=='__main__':main()