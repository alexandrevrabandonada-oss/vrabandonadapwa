"""Aço Gráfico v0.27 — image-forward motion-design system.

Six+ independent compositions selected by source role, not a fixed project ID.
General print-depth/halftone language in an original industrial documentary grammar.
This module never calls TTS, fetches media, or claims evidence from illustrative shots.
"""
from __future__ import annotations
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw

try:
    from . import spider_brutalist_v25 as old
except ImportError:
    import spider_brutalist_v25 as old

W,H=540,960
GRAPHIC={'graphic':old.YELLOW,'cinema':old.CYAN}
DARK=old.rgb_to_bgr(old.BG)


def composition_for(shot):
    """Source-role aware, stable and reusable across unrelated editorial briefs."""
    role=shot['source']; idx=int(shot['index']);
    if role not in {'photo','film','both'}:raise ValueError('unknown source role')
    palettes={
      'photo':('impact_reveal','architecture','contact_triptych'),
      'film':('furnace_bleed','industrial_diptych','moving_crop'),
      'both':('diagonal_duel','dossier_final','photo_film_field')}
    return palettes[role][idx%3]


def _visible_photo(photo,moving,shot,p):
    """A wide photo remains source photo; moving source never mislabelled."""
    layout=composition_for(shot)
    base=np.full((H,W,3),DARK,np.uint8)
    if layout=='impact_reveal':
        full=old.cover(photo,W,638,.43+.07*p,.48,1.07+.08*p)
        base[92:730]=full
        # Independent advancing strips. They are all crops of the same real photo.
        for i in range(4):
            strip_y=132+i*133
            strip=old.cover(photo,W,134,.33+.14*i+.04*p,.43+.08*i,1.15)
            shift=round((1-old.smoothstep(min(1,p/.22)))*(30 if i%2 else -32))
            x=max(0,shift)
            if shift>=0:base[strip_y:strip_y+134,x:]=strip[:,:W-x]
            else:base[strip_y:strip_y+134,:W+shift]=strip[:,-shift:]
    elif layout=='architecture':
        base[95:743]=old.cover(photo,W,648,.55-.1*p,.48,1.01+.13*p)
        x=round(113+12*p)
        # Architectural editorial margin, not an inserted or synthesized machine.
        base[115:715,18:25]=old.rgb_to_bgr(old.MAGENTA)
        base[125:700,x:x+4]=old.rgb_to_bgr(old.YELLOW)
    elif layout=='contact_triptych':
        under=old.cover(photo,W,647,.44,.49,1.12)
        base[94:741]=cv2.addWeighted(under,.42,np.full_like(under,DARK),.58,0)
        for j in range(3):
            y=150+j*183
            if y+165>743:break
            frame=old.cover(photo,490,164,.24+.28*j+.025*p,.34+j*.15,1.08)
            x=23+int((1-old.smoothstep(min(1,p/.21)))*(-31 if j%2 else 31))
            base[y:y+164,max(x,0):min(x+490,W)]=frame[:,max(-x,0):490-max(0,x+490-W)]
            cv2.line(base,(22,y+168),(520,y+168),old.rgb_to_bgr(old.CYAN if j==1 else old.YELLOW),4)
    elif layout in {'furnace_bleed','industrial_diptych','moving_crop'}:
        base[95:738]=old.cover(moving,W,643,.53+.02*math.sin(p*math.pi),.51,1.04+.08*p)
        if layout=='industrial_diptych':
            frame=old.cover(moving,206,380,.64-.09*p,.50,1.1)
            base[332:712,20:226]=frame
            cv2.line(base,(236,316),(236,723),old.rgb_to_bgr(old.YELLOW),6)
        elif layout=='moving_crop':
            frame=old.cover(moving,472,218,.33+.13*p,.55,1.2)
            base[447:665,34:506]=frame
            cv2.rectangle(base,(30,442),(510,669),old.rgb_to_bgr(old.MAGENTA),4)
    elif layout in {'diagonal_duel','dossier_final','photo_film_field'}:
        base[95:741]=old.cover(photo,W,646,.42+.09*p,.5,1.05+.08*p)
        film=old.cover(moving,W,646,.61-.08*p,.51,1.09)
        yy,xx=np.mgrid[95:741,0:W]
        if layout=='diagonal_duel':
            dividing=220+90*(1-(yy-95)/646)+int(38*p)
            mask=xx>=dividing
            base[95:741][mask]=film[mask]
            cv2.line(base,(310+int(38*p),95),(220+int(38*p),740),old.rgb_to_bgr(old.YELLOW),9,cv2.LINE_AA)
        elif layout=='dossier_final':
            base[95:741]=cv2.addWeighted(base[95:741],.40,np.full_like(film,DARK),.60,0)
            mask=(xx>90+np.abs(yy-435)*.26)&(xx<516-np.abs(yy-435)*.10)
            base[95:741][mask]=film[mask]
            cv2.polylines(base,[np.array([(173,180),(520,215),(465,695),(120,713)],np.int32)],True,old.rgb_to_bgr(old.YELLOW),6)
        else:
            base[95:419]=old.cover(photo,W,324,.58,.48,1.05)
            base[428:740]=old.cover(moving,W,312,.57,.51,1.03)
            cv2.line(base,(0,422),(540,422),old.rgb_to_bgr(old.MAGENTA),9)
    else:raise ValueError('unknown layout')
    return base


def _short_title(draw, text, x, y, accent, maxw, maxlines=2, size=100):
    chunks=[]; line=''
    for word in text.upper().split():
        test=(line+' '+word).strip()
        if line and draw.textbbox((0,0),test,font=old.font(size,'cond'))[2]>maxw:
            chunks.append(line);line=word
        else:line=test
    if line:chunks.append(line)
    while (len(chunks)>maxlines or any(draw.textbbox((0,0),s,font=old.font(size,'cond'))[2]>maxw for s in chunks)) and size>38:
        size-=3;chunks=[];line=''
        for word in text.upper().split():
            test=(line+' '+word).strip()
            if line and draw.textbbox((0,0),test,font=old.font(size,'cond'))[2]>maxw:
                chunks.append(line);line=word
            else:line=test
        if line:chunks.append(line)
    if len(chunks)>maxlines:raise ValueError('unreadable headline')
    for j,chunk in enumerate(chunks):
        old.put(draw,(x,y+j*(size+2)),chunk,size,old.CREAM if j==0 else accent,max_w=maxw,misprint=2)
    return size,len(chunks)


def balanced_caption(draw, grouped_cues, t, accent):
    """Word-synchronized captions with balanced line breaks; avoid one-word orphans."""
    cue=next((x for x in grouped_cues if x['start']-.03<=t<=x['end']+.055),None)
    if cue is None:return {'safe':True,'active':False,'lines':0}
    words=cue['words']
    if not words:return {'safe':True,'active':False,'lines':0}
    max_w=502
    def width(a,sz):return draw.textbbox((0,0),' '.join(w['text'] for w in a),font=old.font(sz,'heavy'))[2]
    font_size=36
    if width(words,font_size)<=max_w:
        rows=[words]
    else:
        candidates=[]
        for cut in range(1,len(words)):
            a,b=words[:cut],words[cut:]
            for fs in range(36,25,-2):
                aw,bw=width(a,fs),width(b,fs)
                if aw<=max_w and bw<=max_w:
                    orphan_penalty=350 if min(len(a),len(b))==1 and len(words)>3 else 0
                    balance_penalty=abs(aw-bw)*.6
                    candidates.append((orphan_penalty+balance_penalty-(fs-26)*.4,fs,cut))
                    break
        if not candidates:raise ValueError('subtitle exceeds mobile width')
        _,font_size,cut=min(candidates)
        rows=[words[:cut],words[cut:]]
    y=679 if len(rows)==2 else 703
    boxes=[]
    for line in rows:
        # Match PIL's actual space geometry instead of measuring each word+space separately.
        chars=' '.join(w['text'] for w in line)
        line_width=width(line,font_size)
        x=(W-line_width)//2
        if x<16 or x+line_width>524:raise ValueError('caption bbox outside safe mobile width')
        bbox=(x-10,y-7,x+line_width+10,y+font_size+18)
        draw.polygon([(bbox[0]-4,bbox[1]),(bbox[2],bbox[1]),(bbox[2]+4,bbox[3]),(bbox[0],bbox[3])],fill=(*old.BG,242))
        draw.line((bbox[0]-4,bbox[3],bbox[2]+4,bbox[3]),fill=accent,width=3)
        for i,word in enumerate(line):
            text=word['text']
            col=accent if word['start']<=t<=word['end']+.04 else old.CREAM if t>word['end'] else (205,204,200)
            draw.text((x,y),text,font=old.font(font_size,'heavy'),fill=col)
            x+=draw.textbbox((0,0),text+(' ' if i<len(line)-1 else ''),font=old.font(font_size,'heavy'))[2]
        boxes.append(bbox)
        y+=font_size+21
    safe=all(12<=b[0] and b[2]<=528 and 650<=b[1] and b[3]<=815 for b in boxes)
    return {'active':True,'safe':safe,'lines':len(rows),'font':font_size,'boxes':boxes,
            'single_word_orphan':any(len(r)==1 for r in rows) and len(words)>3}

def _draw_overlay(base,shot,t,p,idx,count,cues,variant):
    accent=GRAPHIC[variant]
    layout=composition_for(shot)
    canvas=Image.fromarray(cv2.cvtColor(base,cv2.COLOR_BGR2RGB)).convert('RGBA')
    overlay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(overlay)
    held=int(t*24)//2
    # Dynamic registration marks *in margins only*; keep photographic action visible.
    for j in range(10):
        x=19+j*55; yy=96+(held+j)%8
        d.ellipse((x-1,yy-1,x+2,yy+2),fill=(*accent,140))
    d.polygon([(0,0),(W,0),(W,94),(0,104)],fill=(*old.BG,248))
    d.text((21,18),'VR ABANDONADA',font=old.font(25,'heavy'),fill=old.CREAM)
    d.text((21,56),'AÇO GRÁFICO / DIREÇÃO AUTOMÁTICA',font=old.font(15,'body'),fill=accent)
    d.text((W-91,22),f'{idx+1:02d}/{count:02d}',font=old.font(20,'heavy'),fill=accent)
    d.line([(0,105),(W,95)],fill=(*accent,240),width=4)
    # Top typography has a brief entry and backs off; film remains majority of each frame.
    arrive=1-old.smoothstep(min(1,max(0,p)/.20))
    shift=round(arrive*(-52 if idx%2 else 53))
    if shot['source']=='photo':
        d.polygon([(-8,162),(W-20,132),(W+6,335),(-8,363)],fill=(*old.BG,192 if layout=='impact_reveal' else 175))
        title_y=163
    elif shot['source']=='film':
        d.polygon([(-10,130),(W-20,116),(W,298),(-10,311)],fill=(*old.BG,174))
        title_y=140
    else:
        d.polygon([(-10,157),(W-32,142),(W,333),(-10,353)],fill=(*old.BG,174))
        title_y=157
    title=shot['headline']
    sz,lc=_short_title(d,title,21+shift,title_y,accent,492,2,size=104 if shot['source']=='photo' else 88)
    # Explicit source identification is part of visual grammar, not small-print legalistic text.
    d.polygon([(21,356),(W-24,354),(W-37,390),(21,393)],fill=(*accent,226))
    eyebrow=str(shot['eyebrow']).upper()
    fsize=18
    while d.textbbox((0,0),eyebrow,font=old.font(fsize,'heavy'))[2]>460 and fsize>13:fsize-=1
    d.text((29,365),eyebrow,font=old.font(fsize,'heavy'),fill=old.BG)
    # Speed lines appear at the edit, not as permanent wallpaper.
    entry=max(0,1-p/.26)
    for k in range(5):
        y=409+k*17
        px=round(W-26-(50+k*25)*entry)
        d.line([(px,y),(px+115,y-19)],fill=(*accent,int(190*entry)),width=2+k%2)
    # Frame border and rhythm tick; these do not sit over footage content.
    d.line([(9,714),(W-10,714)],fill=(*accent,215),width=4)
    d.rectangle((20,721,20+round((W-40)*t/14.5),727),fill=(*old.MAGENTA,222))
    # Caption function performs real word-timing and safe-zone checks.
    status=balanced_caption(d,cues,t,accent)
    if not status['safe']:raise ValueError('mobile safe captions failed')
    d.polygon([(0,818),(W,818),(W,879),(0,890)],fill=(*old.BG,242))
    d.line([(20,823),(520,823)],fill=(*old.MAGENTA,240),width=3)
    credit=str(shot['credit'])
    fs=19
    while d.textbbox((0,0),credit,font=old.font(fs,'body'))[2]>W-42 and fs>=13:fs-=1
    if d.textbbox((0,0),credit,font=old.font(fs,'body'))[2]>W-42:raise ValueError('source credit cropped')
    d.text((22,843),credit,font=old.font(fs,'body'),fill=accent)
    d.text((22,903),'ESTUDO VISUAL / VOZ NÃO INCORPORADA',font=old.font(17,'heavy'),fill=old.CREAM)
    d.text((22,929),'CENAS REAIS COM ORIGENS IDENTIFICADAS',font=old.font(14,'body'),fill=old.CREAM)
    final=Image.alpha_composite(canvas,overlay).convert('RGB')
    return cv2.cvtColor(np.asarray(final),cv2.COLOR_RGB2BGR),status


def compose(photo,moving,shot,t,p,idx,count,cues,variant):
    if variant not in GRAPHIC:raise ValueError('unknown direction')
    if photo is None or moving is None:raise ValueError('both source media required')
    if len(photo.shape)!=3 or len(moving.shape)!=3:raise ValueError('bad source frames')
    base=_visible_photo(photo,moving,shot,p)
    return _draw_overlay(base,shot,t,p,idx,count,cues,variant)