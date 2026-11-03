"""v0.26 variable-scene kinetic industrial-documentary renderer.

Real historical sources remain distinct, named, and hash-checked. Internal
preview only. Produces 540x960 H.264/AAC with word-timed captions; voice is
used only if an original local recording is actually supplied and verified.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import subprocess
import wave
from pathlib import Path
import cv2
import numpy as np
from PIL import Image,ImageDraw
from . import spider_brutalist_v25 as core
from .director_v26 import auto_plan,scan_motion_windows,schedule_source_windows,parse_words
from .voice_timed_v24 import load_words,cues

W,H,FPS=core.W,core.H,core.FPS
COLOR={'graphic':core.YELLOW,'cinema':core.CYAN}

def fit_title(draw,txt,maxwidth=485,largest=96):
    size=largest
    while size>=44:
        lines=[];cur=[]
        for word in txt.split():
            test=' '.join(cur+[word])
            if cur and draw.textbbox((0,0),test,font=core.font(size,'cond'))[2]>maxwidth:
                lines.append(' '.join(cur));cur=[]
            cur.append(word)
        if cur:lines.append(' '.join(cur))
        if len(lines)<=2 and all(draw.textbbox((0,0),x,font=core.font(size,'cond'))[2]<=maxwidth for x in lines):
            return lines,size
        size-=2
    raise ValueError('oversized title cannot be drawn without clipping')

def graphic_overlay(base,shot,t,progress,index,count,timed,variant):
    ink=COLOR[variant];layout=shot['layout']
    back=Image.fromarray(cv2.cvtColor(base,cv2.COLOR_BGR2RGB)).convert('RGBA')
    overlay=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(overlay)
    held=int(t*FPS)//2
    if variant=='graphic':
        for y in range(145,810,57):
            for x in range(18+held%5,W-16,57):
                d.ellipse((x,y,x+3,y+3),fill=(8,12,30,75))
    d.polygon([(0,0),(W,0),(W,122),(0,154)],fill=(8,13,29,242))
    d.line([(0,155),(W,124)],fill=(*ink,235),width=6)
    d.text((21,24),'VR ABANDONADA / AÇO GRÁFICO',font=core.font(19,'heavy'),fill=core.CREAM)
    d.text((430,24),f'{index+1:02d}/{count:02d}',font=core.font(20,'body'),fill=ink)
    d.text((22,81),shot['eyebrow'][:34],font=core.font(19,'body'),fill=ink)
    d.rectangle((20,114,20+int((W-42)*t/14.5),119),fill=ink)
    for k in range(6):
        x=380+k*27+held%4*2+(65 if layout in ('furnace','filmstrip') else 0)
        y=176+k*20
        d.line((x,y,x+85,y-27),fill=(*ink,100),width=3)
    if layout in ('imprint','monument','resolution','collision'):
        y=220 if layout=='imprint' else 227 if layout=='monument' else 215
        height=244 if layout=='imprint' else 205
        direction=-1 if layout=='collision' else 1
        move=int((1-core.smoothstep(min(1,progress/.16)))*48*direction)
        d.polygon([(move,y-14),(W-32+move,y-39),(W+move,y+height-25),(-5+move,y+height)],
                  fill=(8,13,29,180))
        rows,size=fit_title(d,shot['headline'],largest=99 if layout!='collision' else 86)
        for j,line in enumerate(rows):
            core.put(d,(19+move,y+j*(size+8)),line,size,core.CREAM if j==0 else ink,
                     kind='cond',misprint=3 if variant=='graphic' else 1)
        d.line((18,y+height-2,W-45,y+height-22),fill=(*core.MAGENTA,238),width=7)
    elif layout=='printer':
        d.polygon([(22,190),(W-45,177),(W-18,275),(14,293)],fill=(*core.YELLOW,245))
        rows,size=fit_title(d,shot['headline'],largest=82)
        d.text((29,189),rows[0],font=core.font(size,'cond'),fill=core.BG)
        if len(rows)>1:d.text((29,190+size),rows[1],font=core.font(54,'cond'),fill=core.BG)
    else:
        d.polygon([(0,172),(W-38,151),(W-14,273),(-9,298)],fill=(8,13,29,212))
        rows,size=fit_title(d,shot['headline'],largest=73)
        for j,line in enumerate(rows):
            core.put(d,(19,169+j*(size+4)),line,size,ink if j==0 else core.CREAM,misprint=2)
        if layout=='filmstrip':
            for j in range(4):d.rectangle((10+j*18,325,16+j*18,342),fill=(*core.CREAM,185))
    caption=core.caption(d,timed,t,ink)
    if not caption['safe']:raise ValueError('caption infringes mobile safe area')
    d.polygon([(0,820),(W,813),(W,875),(0,882)],fill=(7,11,25,229))
    d.line((20,824,W-24,818),fill=(*core.MAGENTA,218),width=4)
    credit=shot['credit'];size=18
    while d.textbbox((0,0),credit,font=core.font(size,'body'))[2]>W-40 and size>13:size-=1
    if d.textbbox((0,0),credit,font=core.font(size,'body'))[2]>W-40:raise ValueError('credit would overflow')
    d.text((22,833),credit,font=core.font(size,'body'),fill=ink)
    d.text((22,895),'TEMPOS DA VOZ ALEXANDRE / TRILHA ORIGINAL',font=core.font(15,'body'),fill=core.CREAM)
    d.text((22,921),'ESTUDO INTERNO • VERIFIQUE A FAIXA DE VOZ',font=core.font(15,'heavy'),fill=core.CREAM)
    d.line((20,944,W-22,944),fill=(*ink,170),width=2)
    out=Image.alpha_composite(back,overlay).convert('RGB')
    return cv2.cvtColor(np.array(out),cv2.COLOR_RGB2BGR),caption

def score_music(dest,cuts,duration,sr=32000):
    ts=np.arange(round(duration*sr),dtype=np.float64)/sr
    audio=np.sin(2*np.pi*(60*ts+3*np.sin(2*np.pi*.17*ts)))*.12
    audio+=.075*np.sin(2*np.pi*119*ts)*np.maximum(np.sin(2*np.pi*2*ts),0)**18
    audio+=.02*np.sin(2*np.pi*227*ts+np.sin(ts*.7))
    for start in cuts:
        i=round(start*sr);end=min(len(ts),i+round(.24*sr))
        seg=np.arange(end-i)/sr
        if len(seg):audio[i:end]+=np.sin(2*np.pi*(145+380*seg)*seg)*np.exp(-seg*24)*.22
    env=np.minimum(np.minimum(ts/.28,(duration-ts)/.42),1).clip(0,1)
    dest.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(dest),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr)
        f.writeframes(np.int16(np.clip(audio*env,-.9,.9)*32767).tobytes())

def inspect_voice(file,doc):
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(file)],text=True))
    if not any(s.get('codec_type')=='audio' for s in info['streams']):
        raise ValueError('voice recording contains no audio stream')
    if abs(float(info['format']['duration'])-float(doc['duration_sec']))>.5:
        raise ValueError('audio and real Scribe timings disagree')
    return hashlib.sha256(file.read_bytes()).hexdigest()

def render(plan,photo,video,words_file,out,voice=None):
    shots=plan['shots'];duration=plan['duration_sec']
    if not shots or abs(shots[-1]['end']-duration)>.002:raise ValueError('incomplete edit')
    for file in (photo,video):core.verify_source(file)
    doc=json.loads(words_file.read_text(encoding='utf8'))
    timed=cues(parse_words(doc));voice_hash=inspect_voice(voice,doc) if voice else None
    out.parent.mkdir(parents=True,exist_ok=True)
    conform=out.with_name(out.stem+'_conformed.mp4')
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(video),'-an','-vf',
        'fps=24,scale=960:540:flags=lanczos','-c:v','libx264','-preset','ultrafast',
        '-crf','21',str(conform)],check=True)
    reader=cv2.VideoCapture(str(conform));fps=reader.get(cv2.CAP_PROP_FPS)
    still=cv2.imread(str(photo))
    if still is None or not reader.isOpened():raise ValueError('cannot decode real source')
    silent=out.with_name(out.stem+'_silent.mp4')
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*'mp4v'),FPS,(W,H))
    if not writer.isOpened():raise ValueError('cannot create video')
    moving=None;previous=-1;last_frame_id=-1
    try:
        for i in range(round(duration*FPS)):
            t=i/FPS
            scene=next((s for s in shots if s['start']<=t<s['end']),shots[-1])
            index=scene['index'];progress=(t-scene['start'])/(scene['end']-scene['start'])
            if scene['source_window_start'] is not None:
                frame_id=max(0,round((scene['source_window_start']+max(0,t-scene['start']))*fps))
                if index!=previous or frame_id<last_frame_id:
                    reader.set(cv2.CAP_PROP_POS_FRAMES,frame_id);last_frame_id=frame_id-1
                while last_frame_id<frame_id:
                    ok,moving=reader.read()
                    if not ok:raise ValueError('source footage ended inside selected shot')
                    last_frame_id+=1
            elif moving is None:
                reader.set(cv2.CAP_PROP_POS_FRAMES,0);ok,moving=reader.read()
                if not ok:raise ValueError('no moving footage')
            previous=index
            beat=core.Beat(scene['start'],scene['end'],scene['layout'],scene['source'],
                           scene['headline'],scene['eyebrow'])
            back=core.scene_background(still,moving,beat,progress,
                                       'zine' if plan['variant']=='graphic' else 'documental')
            frame,caption=graphic_overlay(back,scene,t,progress,index,len(shots),timed,plan['variant'])
            writer.write(frame)
    finally:reader.release();writer.release()
    score=out.with_suffix('.wav');score_music(score,[s['start'] for s in shots],duration)
    if voice:
        filt='[1:a]volume=0.36[m];[m][2:a]sidechaincompress=threshold=0.026:ratio=6:attack=10:release=160[duck];[duck][2:a]amix=inputs=2:duration=longest:weights=0.6 1.0,loudnorm=I=-16:TP=-2.0:LRA=7[a]'
        cmd=['ffmpeg','-y','-v','error','-i',str(silent),'-i',str(score),'-i',str(voice),
             '-filter_complex',filt,'-map','0:v:0','-map','[a]']
    else:
        cmd=['ffmpeg','-y','-v','error','-i',str(silent),'-i',str(score),
             '-map','0:v:0','-map','1:a:0','-af',
             'loudnorm=I=-17:TP=-2.5:LRA=7,alimiter=limit=0.7:level=false']
    cmd+=['-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',
          '-c:a','aac','-b:a','160k','-t',str(duration),'-movflags','+faststart',str(out)]
    subprocess.run(cmd,check=True)
    return {'video':str(out),'shots':len(shots),'duration':duration,'caption_safe':True,
            'voice_embedded':bool(voice),'voice_sha256':voice_hash,
            'word_timings_real':True,'publication_approved':False,
            'technical_render_only':True,'artistic_score':None}

def contact(video,plan,out):
    cap=cv2.VideoCapture(str(video));cells=[]
    for s in plan['shots']:
        cap.set(cv2.CAP_PROP_POS_MSEC,.5*(s['start']+s['end'])*1000)
        ok,img=cap.read()
        if not ok:raise ValueError('missing review frame')
        cells.append(cv2.resize(img,(216,384)))
    cap.release();cols=3;rows=(len(cells)+cols-1)//cols
    sheet=np.full((rows*384,cols*216,3),core.rgb_to_bgr(core.BG),np.uint8)
    for i,img in enumerate(cells):sheet[(i//cols)*384:(i//cols+1)*384,(i%cols)*216:(i%cols+1)*216]=img
    if not cv2.imwrite(str(out),sheet):raise IOError('contact save failed')

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--photo',required=True,type=Path)
    p.add_argument('--film',required=True,type=Path)
    p.add_argument('--words',required=True,type=Path)
    p.add_argument('--brief',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--variant',choices=('graphic','cinema'),default='graphic')
    p.add_argument('--voice',type=Path)
    a=p.parse_args()
    plan=auto_plan(json.loads(a.brief.read_text(encoding='utf8')),
                   json.loads(a.words.read_text(encoding='utf8')),a.variant)
    scan=scan_motion_windows(a.film)
    plan['motion_analysis']=scan
    plan['window_schedule']=schedule_source_windows(plan,scan)
    info=render(plan,a.photo,a.film,a.words,a.out,a.voice)
    contact(a.out,plan,a.out.with_suffix('.jpg'))
    info['plan']=plan
    a.out.with_suffix('.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'output':str(a.out),'shots':len(plan['shots']),
                      'duration':plan['duration_sec'],'voice_embedded':bool(a.voice)}))

if __name__=='__main__':main()
