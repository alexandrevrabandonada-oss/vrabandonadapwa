"""Aço Gráfico v0.28 — animated industrial editorial composition.

An original brutalist screen-print grammar: editorial typography behaves like
moving architecture and then retreats to reveal the underlying real image.
No synthetic people, archive recoloring, fake captions, or auto publication.
"""
from __future__ import annotations
import math
from functools import lru_cache
import cv2
import numpy as np
from PIL import Image, ImageDraw
from . import spider_brutalist_v25 as old
from . import kinetic_editor_v27 as previous

W,H=540,960
BG=old.rgb_to_bgr(old.BG)
COMPOSITIONS={
    'photo':('vertical_wipe','archival_print','steel_contact'),
    'film':('furnace_fullbleed','kinetic_filmstrip','forge_zoom'),
    'both':('evidence_split','dual_perspective','comparison_end')
}


def composition_for(shot):
    role=shot['source']
    if role not in COMPOSITIONS:raise ValueError('source role missing or unsupported')
    ordinal=int(shot.get('role_ordinal',shot['index']))
    if ordinal<0:raise ValueError('negative shot index')
    return COMPOSITIONS[role][ordinal%3]


def smooth(p):
    p=float(np.clip(p,0,1));return p*p*(3-2*p)


def _masked_paste(dst,src,x,y):
    h,w=src.shape[:2]
    x0,y0=max(0,x),max(0,y);x1,y1=min(W,x+w),min(H,y+h)
    if x0<x1 and y0<y1:
        dst[y0:y1,x0:x1]=src[y0-y:y1-y,x0-x:x1-x]


def image_stage(photo,moving,shot,progress,variant):
    if photo is None or moving is None or photo.ndim!=3 or moving.ndim!=3:
        raise ValueError('two valid 3-channel frame buffers are required')
    if variant not in ('graphic','cinema'):raise ValueError('unknown palette')
    mode=composition_for(shot)
    p=smooth(progress)
    frame=np.full((H,W,3),BG,np.uint8)
    accent=old.rgb_to_bgr(old.YELLOW if variant=='graphic' else old.CYAN)
    orange=old.rgb_to_bgr(old.ORANGE)
    # The field 82..754 is for the documentary image. 755..940 is reserved for
    # timecoded subtitles, factual credits and voice-state disclosure.
    if mode=='vertical_wipe':
        base=old.cover(photo,W,672,.30+.18*p,.46,1.13+.12*p)
        frame[82:754]=base
        # Displaced strips use source-image pixels only; not fabricated scenery.
        for j in range(4):
            y=112+j*137
            w=468
            stripe=old.cover(photo,w,106,.24+.17*j+.025*p,.34+.14*j,1.07)
            displacement=round((1-smooth(progress/.23))*(65 if j%2 else -58))
            _masked_paste(frame,stripe,36+displacement,y)
            cv2.line(frame,(16,y+107),(524,y+107),accent,3,cv2.LINE_AA)
    elif mode=='archival_print':
        frame[82:754]=old.cover(photo,W,672,.46+.08*p,.52,1.20)
        frame[90:748]=cv2.addWeighted(frame[90:748],.38,np.full_like(frame[90:748],BG),.62,0)
        # Print pasted to a slate board: no synthetic photographic content.
        print_photo=old.cover(photo,474,468,.52-.04*p,.47,1.04+.04*p)
        angle=-4.0+2.3*p
        M=cv2.getRotationMatrix2D((237,234),angle,1.0)
        rotated=cv2.warpAffine(print_photo,M,(474,468),borderMode=cv2.BORDER_REFLECT)
        _masked_paste(frame,rotated,33,176+int(12*p))
        cv2.rectangle(frame,(27,171+int(12*p)),(513,649+int(12*p)),accent,6,cv2.LINE_AA)
        cv2.rectangle(frame,(21,665),(521,678),orange,-1)
    elif mode=='steel_contact':
        backdrop=old.cover(photo,W,672,.50,.51,1.09)
        frame[82:754]=cv2.addWeighted(backdrop,.35,np.full_like(backdrop,BG),.65,0)
        for j in range(3):
            y=135+j*171
            crop=old.cover(photo,492,150,.25+.24*j+.04*p,.34+.16*j,1.12)
            _masked_paste(frame,crop,24+round((1-smooth(progress/.32))*(40 if j%2 else -40)),y)
            cv2.line(frame,(23,y+155),(516,y+155),accent if j!=1 else orange,4,cv2.LINE_AA)
        # Registration cross on background, away from original image.
        cv2.line(frame,(15,699),(56,699),accent,3);cv2.line(frame,(36,683),(36,716),accent,3)
    elif mode in ('furnace_fullbleed','kinetic_filmstrip','forge_zoom'):
        film=old.cover(moving,W,672,.48+.035*math.sin(math.pi*p),.50,1.015+.07*p)
        frame[82:754]=film
        if mode=='kinetic_filmstrip':
            # A secondary aperture of the SAME timecoded original frame.
            sub=old.cover(moving,324,344,.61-.08*p,.52,1.10)
            _masked_paste(frame,sub,198,325)
            cv2.rectangle(frame,(192,319),(527,674),accent,5)
            for j in range(4):
                cv2.rectangle(frame,(21+j*28,378),(35+j*28,402),BG,-1)
        elif mode=='forge_zoom':
            sub=old.cover(moving,468,212,.34+.15*p,.58,1.13)
            _masked_paste(frame,sub,34,437)
            cv2.rectangle(frame,(27,430),(510,658),orange,5)
        else:
            # Speedline travels across margin only, not documentary image pixels.
            cv2.line(frame,(0,745),(W,745),accent,8)
    elif mode in ('evidence_split','dual_perspective','comparison_end'):
        photo_full=old.cover(photo,W,672,.48+.07*p,.49,1.08)
        film_full=old.cover(moving,W,672,.57-.04*p,.50,1.04)
        if mode=='evidence_split':
            frame[82:401]=photo_full[:319];frame[416:754]=film_full[334:]
            cv2.line(frame,(0,406),(W,406),accent,10)
        elif mode=='dual_perspective':
            frame[82:754]=photo_full
            yy,xx=np.ogrid[82:754,:W]
            divider=248+50*p+(yy-82)*.24
            mask=np.broadcast_to(xx>divider,(672,W))
            frame[82:754][mask]=film_full[mask]
            cv2.line(frame,(248+round(50*p),82),(409+round(50*p),754),accent,7,cv2.LINE_AA)
        else:
            frame[82:754]=film_full
            frame[82:754]=cv2.addWeighted(frame[82:754],.70,np.full_like(film_full,BG),.30,0)
            window=old.cover(photo,454,265,.46,.48,1.04)
            _masked_paste(frame,window,44,390)
            cv2.rectangle(frame,(38,384),(504,660),accent,6)
    else:raise ValueError('composition not recognized')
    return frame


def _text_fit(d,txt,maxw,maxsize=84,kind='cond'):
    txt=txt.upper()
    for size in range(maxsize,11,-2):
        f=old.font(size,kind)
        if d.textbbox((0,0),txt,font=f)[2]<=maxw:return f,size
    raise ValueError('headline too wide for readable mobile typography')


def _paper_texture(d,variant,time_step,region):
    """Procedural marks on the magazine margins only, never on archive footage."""
    ac=old.YELLOW if variant=='graphic' else old.CYAN
    x0,y0,x1,y1=region
    for y in range(y0,y1,13):
        for x in range(x0+((y//13)%2)*6,x1,13):
            radius=1+((x//13+y//13+time_step//4)%9==0)
            d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=(*ac,65))


def overlay(base,shot,t,p,idx,total,cues,variant,voice_embedded=False):
    """Dynamic high-impact title collapses into a legible edge label.

    At most ~.58 s of heavy headline over imagery. The source remains full
    size for the body of the shot, solving v27 permanent title occlusion.
    """
    if variant not in ('graphic','cinema'):raise ValueError('unsupported variant')
    mode=composition_for(shot)
    accent=old.YELLOW if variant=='graphic' else old.CYAN
    paper=old.CREAM
    full=Image.fromarray(cv2.cvtColor(base,cv2.COLOR_BGR2RGB)).convert('RGBA')
    layer=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(layer)
    tick=int(t*24)//2
    # Black masthead is a *narrow* 82px editorial ribbon.
    d.polygon([(0,0),(W,0),(W,73),(0,87)],fill=(*old.BG,252))
    d.text((18,11),'VR ABANDONADA',font=old.font(23,'heavy'),fill=paper)
    d.text((18,48),'AÇO GRÁFICO / ARQUIVO EM MOVIMENTO',font=old.font(13,'body'),fill=accent)
    d.text((457,22),f'{idx+1:02d}/{total:02d}',font=old.font(20,'heavy'),fill=accent)
    d.line((0,88,W,74),fill=(*accent,250),width=3)
    _paper_texture(d,variant,tick,(14,883,528,932))
    # Short-lived monumental headline, then quiet factual identifier.
    shot_time=float(shot['end']-shot['start']);elapsed=float(np.clip(p*shot_time,0,shot_time))
    title=shot['headline']
    if elapsed<.62:
        fade=1-smooth(max(0,elapsed-.26)/.36)
        opacity=int(224*fade)
        xx=round((1-smooth(min(1,elapsed/.20)))*(-38 if idx%2 else 38))
        y=160 if shot['source']=='photo' else 134
        # Shape pulled from screenprinting / architecture, not film frames.
        d.polygon([(0+xx,y-20),(W-17+xx,y-40),(W+xx,y+149),(0+xx,y+177)],fill=(*old.BG,opacity))
        size=84
        # Shorter phrasing to respect 540px mobile.
        if len(title)>18:title=title.replace(' / ','/')
        words=title.upper().split();rows=[];row=''
        for word in words:
            trial=(row+' '+word).strip()
            if row and d.textbbox((0,0),trial,font=old.font(size,'cond'))[2]>482:
                rows.append(row);row=word
            else:row=trial
        if row:rows.append(row)
        while len(rows)>2 or any(d.textbbox((0,0),r,font=old.font(size,'cond'))[2]>482 for r in rows):
            size-=4;rows=[];row=''
            for word in words:
                trial=(row+' '+word).strip()
                if row and d.textbbox((0,0),trial,font=old.font(size,'cond'))[2]>482:
                    rows.append(row);row=word
                else:row=trial
            if row:rows.append(row)
            if size<34:raise ValueError('headline unreadable')
        for j,r in enumerate(rows):
            # Misregistration is a subtle typographic shadow, never shifted document pixels.
            d.text((19+xx+2,y+6+j*(size+4)),r,font=old.font(size,'cond'),fill=(*old.MAGENTA,int(160*fade)))
            d.text((19+xx,y+4+j*(size+4)),r,font=old.font(size,'cond'),fill=(*paper,int(245*fade)))
    else:
        # Reduced headline remains readable but reveals substantially more footage.
        d.polygon([(0,97),(W-46,90),(W-55,134),(0,143)],fill=(*old.BG,190))
        f,size=_text_fit(d,title,465,31,kind='heavy')
        d.text((19,99),title.upper(),font=f,fill=accent)
    # Only first 80ms holds a swoosh registration over the image.
    transient=max(0,1-elapsed/.26)
    if transient:
        for j in range(6):
            a=round(W-(j*30+20)-42*transient)
            y=430+j*31
            d.line((a,y,a+70,y-25),fill=(*accent,round(transient*190)),width=2)
    # Timecoded captions between y=679 and 815. The footage remains visible above.
    cap=previous.balanced_caption(d,cues,t,accent)
    if not cap.get('safe') or cap.get('single_word_orphan'):raise ValueError('caption unsafe or orphaned')
    d.line([(20,819),(W-20,819)],fill=(*accent,230),width=3)
    d.polygon([(0,823),(W,823),(W,870),(0,877)],fill=(*old.BG,249))
    credit=shot['credit']
    font,size=_text_fit(d,credit,499,19,kind='body')
    d.text((20,835),credit,font=font,fill=accent)
    # An original line of sound-state disclosure is required in all previews.
    d.text((20,893),'LEGENDAS TEMPORIZADAS / VOZ ALEXANDRE',font=old.font(14,'body'),fill=paper)
    disclosure='VOZ NO MP4 • ESTUDO INTERNO' if voice_embedded else 'SEM VOZ NO MP4 • ESTUDO INTERNO'
    d.text((20,923),disclosure,font=old.font(15,'heavy'),fill=paper)
    d.rectangle((20,947,20+round(500*t/14.5),952),fill=(*accent,230))
    composed=Image.alpha_composite(full,layer).convert('RGB')
    return cv2.cvtColor(np.asarray(composed),cv2.COLOR_RGB2BGR),dict(cap,headline_hidden_after_sec=.62,
                           visual_mode=mode,credit_verified_by_renderer=True,
                           voice_audio_embedded=bool(voice_embedded))


def compose(photo,moving,shot,t,p,idx,count,cues,variant):
    base=image_stage(photo,moving,shot,p,variant)
    return overlay(base,shot,t,p,idx,count,cues,variant)

