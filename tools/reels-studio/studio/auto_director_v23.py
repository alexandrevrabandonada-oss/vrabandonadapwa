"""Aço Gráfico v0.23: beat-directed editorial reels from authenticated local media.

Generates preview variants with no network, publishing or invented footage.
The demonstration supports a CSN photo (2014) paired with local news (2017) or
separately labelled French industrial context (2011). Original synthetic soundtrack.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import subprocess
import wave
from dataclasses import dataclass
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W,H,FPS,DURATION=540,960,24,14.0
PAPER=(244,239,222)
FLAME=(255,96,53)
SKY=(61,213,242)
DARK=(10,17,27)
INK=(8,15,25)
FONT_BOLD='/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Bold.ttf'
FONT_BODY='/usr/share/fonts/truetype/lato/Lato-Bold.ttf'
BEATS=(0,1.5,3.5,5.5,7.5,9.5,11.5,14.)
LAYOUTS=('impact','photo_dossier','video_window','photo_montage','video_bold','comparative','resolution')

@dataclass(frozen=True)
class Scene:
    start:float
    end:float
    layout:str
    title:str
    subtitle:str
    source:str
    motion_strength:float=1.

SCENES=(
    Scene(0,1.5,'impact','A CIDADE','NÃO É CENÁRIO','photo',1.35),
    Scene(1.5,3.5,'photo_dossier','2014','A USINA EM VOLTA REDONDA','photo',.85),
    Scene(3.5,5.5,'video_window','2017','A RODOVIA DO CONTORNO','video',1.1),
    Scene(5.5,7.5,'photo_montage','UMA CIDADE','VÁRIOS OLHARES','photo',1.35),
    Scene(7.5,9.5,'video_bold','OUTRO TEMPO','OUTRO REGISTRO','video',1.15),
    Scene(9.5,11.5,'comparative','2014 / 2017','FONTES DIFERENTES. MESMA CIDADE.','both',1),
    Scene(11.5,14,'resolution','O ARQUIVO','É O COMEÇO DA PERGUNTA','both',1.1)
)

def validate_story(scenes=SCENES, duration=DURATION)->dict:
    errors=[]
    if not scenes or abs(scenes[0].start)>1e-6 or abs(scenes[-1].end-duration)>.01:
        errors.append('timeline does not cover the master')
    for i,scene in enumerate(scenes):
        if scene.layout not in LAYOUTS or scene.source not in ('photo','video','both'):
            errors.append(f'scene {i}: invalid composition/source')
        if i and abs(scene.start-scenes[i-1].end)>.001:
            errors.append(f'scene {i}: timeline gap/overlap')
        if scene.end-scene.start<.8 or scene.end-scene.start>4:
            errors.append(f'scene {i}: unsafe pacing')
        if any(abs(edge*2-round(edge*2))>.001 for edge in (scene.start,scene.end)):
            errors.append(f'scene {i}: edit not on rhythmic half-second grid')
        if len(scene.title)>24 or len(scene.subtitle)>48:
            errors.append(f'scene {i}: copy too long')
    if scenes and scenes[0].end>1.6:
        errors.append('hook arrives too slowly')
    if len({s.layout for s in scenes})<5:
        errors.append('visual grammar too repetitive')
    if sum(s.end-s.start for s in scenes if s.source in ('video','both'))/duration<.35:
        errors.append('not enough genuinely moving footage')
    return {'ok':not errors,'errors':errors,'scene_count':len(scenes),
            'visual_grammars':len({s.layout for s in scenes}),
            'real_moving_footage_sec':round(sum(s.end-s.start for s in scenes if s.source in ('video','both')),3),
            'hook_duration_sec':scenes[0].end if scenes else None,
            'edit_points_on_beat':not any('rhythmic' in e for e in errors),
            'automated_artistic_10_10_certification':False}

def font(size,small=False):
    return ImageFont.truetype(FONT_BODY if small else FONT_BOLD,max(10,int(size)))

def cv_rgb(rgb):
    return tuple(reversed(rgb))

def crop_cover(src,w,h,focus_x=.5,focus_y=.5,scale=1.0):
    sh,sw=src.shape[:2]
    ratio=max(w/sw,h/sh)*scale
    rw,rh=max(w,round(sw*ratio)),max(h,round(sh*ratio))
    scaled=cv2.resize(src,(rw,rh),interpolation=cv2.INTER_AREA if ratio<1 else cv2.INTER_LINEAR)
    x=int(np.clip(focus_x*rw-w/2,0,rw-w))
    y=int(np.clip(focus_y*rh-h/2,0,rh-h))
    return scaled[y:y+h,x:x+w].copy()

def film_grade(src,variant,frame_index):
    a=src.astype(np.float32)
    if variant=='expressive':
        a*=np.array([1.08,1.02,.94],np.float32)
        a=(a-115)*1.16+115
    else:
        a*=np.array([1.04,1.,.99],np.float32)
        a=(a-120)*1.08+120
    # One-pixel grain approximation, deterministic; cannot create objects/scenes.
    rng=np.random.default_rng(frame_index+71)
    noise=rng.normal(0,2 if variant=='restrained' else 3,(H//4,W//4)).astype(np.float32)
    noise=cv2.resize(noise,(W,H),interpolation=cv2.INTER_LINEAR)
    return np.uint8(np.clip(a+noise[:,:,None],0,255))

def draw_mast(draw,shot_idx,palette,variant):
    accent=palette['accent']
    draw.line((26,42,514,42), fill=accent, width=3)
    draw.text((27,15),'VR / ARQUIVO VIVO',font=font(16,True),fill=PAPER)
    draw.text((435,15),f'{shot_idx+1:02d}/07',font=font(16,True),fill=PAPER)
    draw.line((26,904,514,904),fill=accent,width=2)
    draw.text((26,916),'VR ABANDONADA  //  ESTUDO INTERNO',font=font(14,True),fill=PAPER)

def line_fit(draw,txt,y,maxw=490,initial=86,fill=PAPER):
    size=initial
    while size>28 and draw.textbbox((0,0),txt,font=font(size))[2]>maxw:
        size-=2
    draw.text((25,y),txt,font=font(size),fill=fill,stroke_width=0)

def source_credit(draw,scene, video_year=2017):
    if scene.source=='photo':txt='FOTOGRAFIA DA CSN / HENRIQUEBARRAMANSA / 2014'
    elif scene.source=='video':txt=('SIDERURGIA / DAMIEN VICART / FRANÇA 2011' if video_year==2011 else 'VIDEO DA RODOVIA / TV BRASILGOV / 2017')
    else:txt=('CSN / BRASIL 2014 + ACIERIE / FRANÇA 2011' if video_year==2011 else 'DUAS FONTES DISTINTAS / 2014 + 2017')
    draw.rectangle((20,874,520,900),fill=(12,20,30,230))
    draw.text((26,881),txt,font=font(12,True),fill=PAPER)

def layout_frame(photo,video,t,index,variant='expressive',video_year=2017,scenes=SCENES):
    scene=scenes[index]
    p=(t-scene.start)/(scene.end-scene.start)
    p=max(0.,min(1.,p))
    expressive=variant=='expressive'
    ink=np.full((H,W,3),INK,dtype=np.uint8)
    accent=FLAME if expressive else SKY
    ph=photo
    vi=video
    # Background layouts are editorially distinct, not one generic bar/slideshow.
    if scene.layout=='impact':
        ink=crop_cover(ph,W,H,.42+.025*p,.49,1.22+.10*p)
        ink=cv2.addWeighted(ink,.45,np.full_like(ink,INK),.55,0)
        cv2.rectangle(ink,(0,0),(15,H),cv_rgb(accent),-1)
        cv2.line(ink,(15,614),(W,474),cv_rgb(accent),6,cv2.LINE_AA)
    elif scene.layout=='photo_dossier':
        ink[:]=DARK
        photo_rect=crop_cover(ph,W,640,.43+.07*p,.52,1.03+.06*p)
        ink[128:768]=photo_rect
        cv2.rectangle(ink,(0,128),(W,134),cv_rgb(accent),-1)
        cv2.rectangle(ink,(0,768),(W,775),cv_rgb(accent),-1)
    elif scene.layout=='video_window':
        ink[:]=DARK
        f=crop_cover(vi,W,620,.51,.50,1.02)
        ink[154:774]=f
        cv2.rectangle(ink,(0,154),(W,158),cv_rgb(accent),-1)
        cv2.rectangle(ink,(0,774),(W,780),cv_rgb(accent),-1)
    elif scene.layout=='photo_montage':
        ink[:]=DARK
        for j in range(3):
            ypos=100+j*236
            pane=crop_cover(ph,W,224,.22+j*.29+(.02*(p-.5)),.42+.04*j,1.13+0.04*p)
            ink[ypos:ypos+224]=pane
            cv2.line(ink,(0,ypos+224),(W,ypos+224),cv_rgb(accent),4,cv2.LINE_AA)
    elif scene.layout=='video_bold':
        ink=crop_cover(vi,W,H,.52,.50,1.18+.08*p)
        shadow=np.zeros_like(ink);shadow[:]=INK
        ink=cv2.addWeighted(ink,.62,shadow,.38,0)
        cv2.rectangle(ink,(0,0),(W,172),cv_rgb(accent),-1)
    elif scene.layout=='comparative':
        left=crop_cover(ph,W//2-4,750,.50+.02*p,.50,1.03)
        right=crop_cover(vi,W//2-4,750,.53,.51,1.08)
        ink[110:860,0:W//2-4]=left
        ink[110:860,W//2+4:]=right
        cv2.rectangle(ink,(W//2-4,110),(W//2+4,860),cv_rgb(accent),-1)
    else:
        ink=crop_cover(ph,W,H,.48,.51,1.18+.08*p)
        darkoverlay=np.full_like(ink,INK)
        ink=cv2.addWeighted(ink,.49,darkoverlay,.51,0)
        # Real source moving inset, no 1962 misattribution.
        rect=crop_cover(vi,426,276,.5,.5,1.00)
        dx=57+int(4*math.sin(p*math.pi))
        ink[385:661,dx:dx+426]=rect
        cv2.rectangle(ink,(dx-4,381),(dx+430,665),cv_rgb(accent),4)
    ink=film_grade(ink,variant,round(t*FPS))
    # Antialias editorial type on RGBA layer, with restrained entrance motion.
    raw=Image.fromarray(cv2.cvtColor(ink,cv2.COLOR_BGR2RGB)).convert('RGBA')
    layer=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(layer)
    palette={'accent':accent}
    draw_mast(d,index,palette,variant)
    source_credit(d,scene,video_year)
    entrance=max(0,1-min(1,p*6))
    shift=round(55*entrance)
    if scene.layout=='impact':
        d.text((26,220+shift),'A CIDADE',font=font(82),fill=PAPER)
        d.text((26,312+shift),'NÃO É',font=font(100),fill=PAPER)
        d.text((26,414+shift),'CENÁRIO',font=font(95),fill=accent)
        d.rectangle((26,530,248,538),fill=accent)
        d.text((26,552),'UMA LINGUAGEM DE ARQUIVO',font=font(17,True),fill=PAPER)
    elif scene.layout=='photo_dossier':
        d.text((26,57+shift),'2014',font=font(92),fill=PAPER,stroke_width=1,stroke_fill=(6,10,15))
        d.rectangle((20,790,520,859),fill=(9,16,25,230))
        d.text((26,796),scene.subtitle,font=font(31),fill=PAPER)
        d.rectangle((27,764,168,772),fill=accent)
    elif scene.layout=='video_window':
        d.text((26,59+shift),str(video_year),font=font(76),fill=PAPER)
        d.rectangle((20,793,520,867),fill=(9,16,25,234))
        d.text((25,805),'SIDERURGIA NA' if video_year==2011 else 'RODOVIA DO',font=font(42),fill=PAPER)
        d.text((25,838),'FRANÇA' if video_year==2011 else 'CONTORNO',font=font(32),fill=accent)
    elif scene.layout=='photo_montage':
        d.rectangle((18,610,520,790),fill=(7,13,22,235))
        d.text((23,618+shift),'UMA CIDADE',font=font(72),fill=PAPER)
        d.text((25,696+shift),'VÁRIOS',font=font(69),fill=accent)
        d.text((25,763+shift),'OLHARES',font=font(56),fill=PAPER)
    elif scene.layout=='video_bold':
        d.text((26,53+shift),'OUTRO',font=font(82),fill=(5,15,24,255))
        d.text((26,177+shift),'TEMPO.',font=font(95),fill=PAPER)
        d.text((26,278+shift),'OUTRO',font=font(90),fill=accent)
        d.text((26,376+shift),'REGISTRO.',font=font(73),fill=PAPER)
        d.rectangle((27,788,315,793),fill=accent)
    elif scene.layout=='comparative':
        d.text((21,50+shift),'DUAS DATAS.',font=font(65),fill=PAPER)
        d.rectangle((12,696,240,746),fill=(10,16,24,215))
        d.rectangle((296,696,527,746),fill=(10,16,24,215))
        d.text((25,699),'2014 / CSN',font=font(31),fill=PAPER)
        d.text((295,699),'2011 / FR' if video_year==2011 else '2017 / VIA',font=font(31),fill=PAPER)
        d.rectangle((12,776,528,856),fill=(10,16,24,225))
        d.text((25,794),'UMA CIDADE.',font=font(61),fill=accent)
    else:
        d.text((26,158+shift),'O ARQUIVO',font=font(84),fill=PAPER)
        d.text((26,684+shift),'É O COMEÇO',font=font(67),fill=PAPER)
        d.text((26,764+shift),'DA PERGUNTA.',font=font(59),fill=accent)
    # restrained animated scan-line and source registration marks
    if expressive:
        y=int((t*73)%H)
        d.line((20,y,520,y),fill=(255,255,255,29),width=1)
    combined=Image.alpha_composite(raw,layer)
    return cv2.cvtColor(np.asarray(combined.convert('RGB')),cv2.COLOR_RGB2BGR)

def make_soundtrack(path:Path,duration=DURATION,sample_rate=48000,variant='expressive'):
    n=round(duration*sample_rate)
    t=np.arange(n,dtype=np.float64)/sample_rate
    # Original tempo-locked percussive design at 120 bpm: industrial pulse, no known melody.
    signal=np.zeros(n,dtype=np.float64)
    rng=np.random.default_rng(128)
    amp=.45 if variant=='expressive' else .28
    for beat in np.arange(0,duration,.5):
        start=int(beat*sample_rate);length=min(int(.18*sample_rate),n-start)
        if length<=0:continue
        tt=np.arange(length)/sample_rate
        # Downward FM punch and short brushed/noise hi-frequency transient.
        pulse=np.sin(2*np.pi*(82*tt+45*tt*np.exp(-32*tt)))*np.exp(-24*tt)
        noise=rng.normal(0,1,length)*np.exp(-62*tt)*.15
        signal[start:start+length]+=amp*(pulse+noise)
    # Cinematic low air, non-tonal synthetic whoosh on the edit points
    for edge in BEATS[1:-1]:
        start=max(0,round((edge-.15)*sample_rate))
        length=min(round(.37*sample_rate),n-start)
        if length<=0:continue
        tt=np.arange(length)/sample_rate
        swoosh=rng.normal(0,1,length)
        swoosh=np.convolve(swoosh,np.ones(240)/240,mode='same')
        env=np.sin(np.pi*np.clip(tt/.37,0,1))**2
        signal[start:start+length]+=.7*swoosh*env
    signal+=.033*np.sin(2*np.pi*49*t)*(0.7+0.3*np.sin(2*np.pi*.08*t))
    env=np.minimum(np.minimum(t/.27,(duration-t)/.33),1).clip(0,1)
    signal=np.tanh(signal*env*2.)*.55
    pcm=np.asarray(np.clip(signal*32767,-32768,32767),dtype='<i2')
    with wave.open(str(path),'wb') as out:
        out.setframerate(sample_rate);out.setsampwidth(2);out.setnchannels(1);out.writeframes(pcm.tobytes())

def verify_bytes(path:Path,manifest:Path):
    m=json.loads(manifest.read_text(encoding='utf8'))
    dig=hashlib.sha1(path.read_bytes()).hexdigest()
    if m.get('sha1')!=dig or int(m.get('size_bytes',-1))!=path.stat().st_size:
        raise ValueError('source does not match original manifest bytes')
    return m

def probe(path:Path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)],text=True))

def compute_voice_timeline(voice:Path|None):
    from dataclasses import replace
    if voice is None:return DURATION,SCENES,None
    p=probe(voice)
    if not any(s['codec_type']=='audio' for s in p['streams']):
        raise ValueError('provided narration has no audio stream')
    duration=float(p['format']['duration'])
    if duration<=0 or duration>DURATION+1.8:
        raise ValueError('voice cannot fit the available shot plan without a different edit')
    target=max(DURATION,math.ceil((duration+.32)*2)/2)
    shots=SCENES[:-1]+(replace(SCENES[-1],end=target),)
    return target,shots,duration

def render(photo:Path,video:Path,out:Path,variant='expressive',voice:Path|None=None):
    if variant not in ('expressive','restrained'):raise ValueError('variant not supported')
    total,scenes,voice_duration=compute_voice_timeline(voice)
    report=validate_story(scenes,total)
    if not report['ok']:raise ValueError(str(report['errors']))
    photo_m=verify_bytes(photo,photo.with_suffix('.json'))
    video_m=verify_bytes(video,video.with_suffix('.json'))
    video_year=int(video_m.get('date_label',0))
    if int(photo_m.get('date_label',0))!=2014 or video_year not in (2011,2017):
        raise ValueError('archive chronology mismatch')
    source=cv2.imread(str(photo))
    if source is None:raise ValueError('photo cannot be decoded')
    out.parent.mkdir(parents=True,exist_ok=True)
    # Conform the archive film to deterministic frame size/timebase.
    prep=out.with_name(out.stem+'_conformed.mp4')
    subprocess.run(['ffmpeg','-y','-v','error','-ss',('0' if video_year==2011 else '41'),'-i',str(video),'-t',str(total+1),
                    '-vf','fps=24,scale=960:540:flags=lanczos','-an','-c:v','libx264','-preset','veryfast',
                    '-crf','23',str(prep)],check=True)
    cap=cv2.VideoCapture(str(prep))
    if not cap.isOpened():raise ValueError('conformed archive video could not be decoded')
    silent=out.with_name(out.stem+'_silent.mp4')
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*'mp4v'),FPS,(W,H))
    if not writer.isOpened():raise ValueError('video encoder unavailable')
    try:
        for i in range(round(total*FPS)):
            t=i/FPS
            ok,moving=cap.read()
            if not ok:raise ValueError('historical video ended before the edit')
            shot=min(j for j,s in enumerate(scenes) if s.start<=t<s.end)
            frame=layout_frame(source,moving,t,shot,variant,video_year,scenes)
            writer.write(frame)
    finally:
        writer.release();cap.release()
    soundtrack=out.with_suffix('.wav');make_soundtrack(soundtrack,duration=total,variant=variant)
    if voice is not None:
        # Adapt final image hold to verified speech duration, preserve original voice pitch and speed.
        # Duck soundtrack under provided original voice, do not time-stretch the speaker.
        filt='[1:a]volume=0.30[m];[m][2:a]sidechaincompress=threshold=0.018:ratio=7:attack=8:release=200[duck];[duck][2:a]amix=inputs=2:duration=longest:weights=0.62 1.0,loudnorm=I=-16:TP=-2.0:LRA=8[a]'
        args=['ffmpeg','-y','-v','error','-i',str(silent),'-i',str(soundtrack),'-i',str(voice),'-filter_complex',filt,
              '-map','0:v','-map','[a]']
    else:
        args=['ffmpeg','-y','-v','error','-i',str(silent),'-i',str(soundtrack),'-map','0:v','-map','1:a','-af','acompressor=threshold=0.035:ratio=8:attack=8:release=190:makeup=1.8,loudnorm=I=-16:LRA=7:TP=-2.5,alimiter=limit=0.65:level=false']
    args+=['-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-c:a','aac',
           '-b:a','160k','-t',str(DURATION+1),'-movflags','+faststart',str(out)]
    subprocess.run(args,check=True)
    audio=next((s for s in probe(out)['streams'] if s['codec_type']=='audio'),None)
    return {'version':'v0.23','variant':variant,'video':str(out),'duration_sec':total,
            'fps':FPS,'width':W,'height':H,'original_sources':[photo_m['id'],video_m['id']], 'film_year':video_year,
            'real_moving_footage_sec':report['real_moving_footage_sec'],
            'narration_added':bool(voice),'narration_duration_sec':voice_duration,'word_level_sync_verified':False,
            'audio_track':bool(audio),'story_analysis':report,
            'technical_preview_only':True,'publication_approved':False,
            'artistic_score':None}

def make_contact(video:Path,dest:Path,scenes=SCENES):
    cap=cv2.VideoCapture(str(video))
    if not cap.isOpened():raise ValueError('could not open output')
    thumbs=[]
    for sc in scenes:
        cap.set(cv2.CAP_PROP_POS_MSEC,(sc.start+.5*(sc.end-sc.start))*1000)
        ok,frame=cap.read()
        if not ok:raise ValueError('could not extract contact frame')
        thumbs.append(cv2.resize(frame,(216,384)))
    cap.release()
    board=np.full((384*2,216*4,3),DARK,dtype=np.uint8)
    for i,f in enumerate(thumbs):
        y=(i//4)*384;x=(i%4)*216
        board[y:y+384,x:x+216]=f
    if not cv2.imwrite(str(dest),board):raise IOError('contact sheet failed')
    return str(dest)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--photo',type=Path,required=True)
    p.add_argument('--video',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--variant',choices=['expressive','restrained'],default='expressive')
    p.add_argument('--voice',type=Path)
    a=p.parse_args()
    result=render(a.photo,a.video,a.output,a.variant,a.voice)
    result['contact_sheet']=make_contact(a.output,a.output.with_suffix('.jpg'),compute_voice_timeline(a.voice)[1])
    a.output.with_suffix('.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()