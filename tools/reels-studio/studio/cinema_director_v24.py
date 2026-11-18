"""Aço Gráfico v0.24 — source-honest vertical film with word-active captions.

Source bytes are verified by the V23 registry. Visual order follows actual
Alexandre narration timing; media are NOT silently substituted for CSN scenes.
This module produces an internal MUSIC-ONLY preview. The audio mux lives in
voice_timed_v24 and requires real MP3 bytes; synthetic voice is never faked.
"""
from __future__ import annotations
import argparse,json,math,subprocess
from pathlib import Path
import cv2
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from . import auto_director_v23 as prior
from .voice_timed_v24 import load_words,cues

W,H,FPS=540,960,24
INK=(10,17,27)
PAPER=(244,242,230)
FLAME=(255,98,55)
SKY=(80,220,240)
FONT="/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Bold.ttf"
BODY="/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
SCENES=(
 (0,1.5,"HOOK","photo"),(1.5,3.5,"PHOTO","photo"),
 (3.5,6.,"TRIPTYCH","photo"),(6.,8.5,"FILM_WIDE","video"),
 (8.5,10.,"FILM_CLOSE","video"),(10.,12.,"SPLIT","both"),
 (12.,14.5,"FINALE","both"))
def fnt(size:int,body=False):
    return ImageFont.truetype(BODY if body else FONT,size)
def cover(im,w,h,x=.5,y=.5,zoom=1.):
    return prior.crop_cover(im,w,h,x,y,zoom)
def title(draw,xy,text,size=70,color=PAPER,maxw=490):
    while size>23 and draw.textbbox((0,0),text,font=fnt(size))[2]>maxw:
        size-=2
    draw.text(xy,text,font=fnt(size),fill=color)
def grade(im,look):
    arr=im.astype(np.float32)
    arr*=np.array([.91,1.02,1.08] if look=="molten" else [1.09,1.03,.96],np.float32)
    arr=(arr-128)*1.07+128
    y,x=np.ogrid[:H,:W]
    v=np.clip(1-.23*((x-W/2)/(W/2))**2-.12*((y-H/2)/(H/2))**2,.66,1.)
    return np.clip(arr*v[...,None],0,255).astype(np.uint8)

def frame_draw(photo,moving,t,cs,look="molten",has_voice=False):
    if look not in ("molten","cold"):raise ValueError("unknown color variant")
    scene_id=next((i for i,(a,b,_,_) in enumerate(SCENES) if a<=t<b),None)
    if scene_id is None:raise ValueError("frame outside story")
    start,end,name,kind=SCENES[scene_id];p=(t-start)/(end-start)
    accent=FLAME if look=="molten" else SKY
    canvas=np.full((H,W,3),INK[::-1],np.uint8)
    if name=="HOOK":
        im=cover(photo,W,H,.44+.035*p,.50,1.20+.11*p)
        canvas=cv2.addWeighted(im,.55,canvas,.45,0)
    elif name=="PHOTO":
        canvas[125:750]=cover(photo,W,625,.44+.055*p,.5,1.02+.09*p)
    elif name=="TRIPTYCH":
        for j in range(3):
            y=115+j*205
            canvas[y:y+197]=cover(photo,W,197,.2+j*.28+.03*p,.45+.08*j,1.19+.06*p)
    elif name=="FILM_WIDE":
        canvas[190:710]=cover(moving,W,520,.50,.5,1.03)
    elif name=="FILM_CLOSE":
        im=cover(moving,W,H,.47+.04*p,.52,1.08+.06*p)
        canvas=cv2.addWeighted(im,.77,canvas,.23,0)
    elif name=="SPLIT":
        canvas[92:762,0:260]=cover(photo,260,670,.49+.02*p,.52,1.04)
        canvas[92:762,280:540]=cover(moving,260,670,.5,.53,1.04)
    else:
        im=cover(photo,W,H,.46+.03*p,.49,1.14+.08*p)
        canvas=cv2.addWeighted(im,.36,canvas,.64,0)
        canvas[328:638,44:496]=cover(moving,452,310,.50,.51,1.02)
    canvas=grade(canvas,look)
    original=Image.fromarray(cv2.cvtColor(canvas,cv2.COLOR_BGR2RGB)).convert("RGBA")
    overlay=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(overlay)
    d.rectangle((0,0,W,47),fill=(9,16,26,225))
    d.text((24,14),"VR ABANDONADA   /   AÇO GRÁFICO",font=fnt(16,True),fill=PAPER)
    d.text((461,13),f"{scene_id+1:02d}/07",font=fnt(16,True),fill=accent)
    d.rectangle((24,47,516,51),fill=accent)
    if name=="HOOK":
        d.rectangle((0,0,12,742),fill=accent)
        title(d,(22,205),"A CIDADE",93)
        title(d,(22,298),"TEM",111)
        title(d,(22,411),"MEMÓRIA.",86,accent)
        d.line((25,515,310,515),fill=accent,width=6)
    elif name=="PHOTO":
        title(d,(25,64),"2014",118)
        d.rectangle((16,622,524,733),fill=(7,15,26,232))
        title(d,(24,634),"CSN",90)
        title(d,(196,679),"VOLTA REDONDA",33,accent)
    elif name=="TRIPTYCH":
        d.rectangle((0,55,W,113),fill=(9,17,27,235))
        title(d,(24,63),"A USINA NO ARQUIVO",53)
        d.line((22,725,517,725),fill=accent,width=5)
    elif name=="FILM_WIDE":
        title(d,(24,74),"SIDERURGIA",69)
        title(d,(25,141),"FRANÇA / 2011",32,accent)
    elif name=="FILM_CLOSE":
        d.rectangle((0,69,W,213),fill=(9,17,27,229))
        title(d,(25,85),"OUTRA",99)
        title(d,(25,163),"GEOGRAFIA.",80,accent)
    elif name=="SPLIT":
        title(d,(22,58),"DOIS ARQUIVOS.",63)
        d.rectangle((258,90,282,742),fill=accent)
        d.rectangle((15,657,243,703),fill=(9,17,27,220))
        d.rectangle((293,657,532,703),fill=(9,17,27,220))
        title(d,(23,664),"CSN · 2014",28)
        title(d,(298,664),"FRANÇA · 2011",25)
    else:
        title(d,(25,155),"A ORIGEM",85)
        title(d,(25,234),"IMPORTA.",89,accent)
        d.rectangle((40,324,500,641),outline=accent,width=4)
    # Editorially RESERVED caption bay — independent of the source picture.
    d.rectangle((0,741,W,881),fill=(6,11,20,243))
    d.rectangle((0,741,W,747),fill=accent)
    current=next((item for item in cs if item["start"]-.01<=t<item["end"]+.07),None)
    if current:
        words=current["words"];line=" ".join(w["text"] for w in words)
        fs=45
        while fs>28 and d.textbbox((0,0),line,font=fnt(fs))[2]>480:
            fs-=1
        widths=[d.textbbox((0,0),w["text"]+" ",font=fnt(fs))[2] for w in words]
        x=max(25,(W-sum(widths))//2)
        for w,ww in zip(words,widths):
            active=w["start"]<=t<=w["end"]+.03
            color=accent if active else PAPER if t>w["end"] else (168,180,185)
            d.text((x,777),w["text"],font=fnt(fs),fill=color)
            if active:d.rectangle((x,835,x+ww-7,838),fill=accent)
            x+=ww
    d.text((25,851),"TEMPOS REAIS DA NARRAÇÃO · ALEXANDRE",font=fnt(16,True),fill=(190,198,204))
    d.rectangle((0,881,W,960),fill=(8,15,24,246))
    credit=("IMAGEM: CSN / VOLTA REDONDA / FOTO 2014" if kind=="photo" else
            "IMAGEM: ACIERIE / FRANÇA / 2011" if kind=="video" else
            "FONTES DISTINTAS: CSN 2014 + FRANÇA 2011")
    d.text((24,894),credit,font=fnt(17,True),fill=accent)
    tail=("ESTUDO INTERNO / VOZ EMBUTIDA" if has_voice else
          "ESTUDO INTERNO / AUDIO DA VOZ NÃO EMBUTIDO")
    d.text((24,922),tail,font=fnt(16,True),fill=PAPER)
    d.rectangle((24,948,516,951),fill=accent)
    return cv2.cvtColor(np.asarray(Image.alpha_composite(original,overlay).convert("RGB")),cv2.COLOR_RGB2BGR)

def render(photo:Path,film:Path,words:Path,out:Path,look="molten"):
    if photo.name!="csn_2014.jpg" or film.name!="france_2011.webm":
        raise ValueError("this editorial cut only supports authenticated CSN/France sources")
    pm=prior.verify_bytes(photo,photo.with_suffix(".json"))
    vm=prior.verify_bytes(film,film.with_suffix(".json"))
    if pm["id"]!="csn_2014" or vm["id"]!="france_2011":
        raise ValueError("source registry mismatch")
    rec,wordlist=load_words(words)
    if wordlist[-1]["end"]>14.3:raise ValueError("not enough tail to avoid clipped speech")
    cs=cues(wordlist)
    source=cv2.imread(str(photo))
    cap=cv2.VideoCapture(str(film))
    if source is None or not cap.isOpened():raise ValueError("could not decode sources")
    out.parent.mkdir(parents=True,exist_ok=True)
    silent=out.with_name(out.stem+"_silent.mp4")
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*"mp4v"),FPS,(W,H))
    if not writer.isOpened():raise ValueError("video encoder unavailable")
    try:
        for i in range(round(14.5*FPS)):
            t=i/FPS
            ok,moving=cap.read()
            if not ok:raise ValueError("France footage unexpectedly ended")
            writer.write(frame_draw(source,moving,t,cs,look))
    finally:
        cap.release();writer.release()
    soundtrack=out.with_suffix(".wav")
    prior.make_soundtrack(soundtrack,duration=14.5,
                          variant="expressive" if look=="molten" else "restrained")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(silent),
                    "-i",str(soundtrack),"-map","0:v:0","-map","1:a:0",
                    "-af","acompressor=threshold=0.035:ratio=8:attack=8:release=190:makeup=1.8,loudnorm=I=-16:LRA=7:TP=-2.5,alimiter=limit=0.65:level=false",
                    "-c:v","libx264","-preset","veryfast","-crf","19",
                    "-pix_fmt","yuv420p","-c:a","aac","-b:a","160k",
                    "-movflags","+faststart",str(out)],check=True)
    return {"version":"v0.24","file":str(out),"duration_sec":14.5,
            "fps":FPS,"resolution":[W,H],"sources":[pm["id"],vm["id"]],
            "scenes":7,"word_count":len(wordlist),"captions_from_real_word_times":True,
            "voice_embedded":False,"publication_approved":False,
            "human_artistic_score":None,"honest_status":"INSTRUMENTAL_WITH_REAL_TIMED_CAPTIONS"}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--photo",type=Path,required=True)
    p.add_argument("--film",type=Path,required=True)
    p.add_argument("--words",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    p.add_argument("--look",choices=("molten","cold"),default="molten")
    a=p.parse_args()
    print(json.dumps(render(a.photo,a.film,a.words,a.out,a.look),ensure_ascii=False,indent=2))
if __name__=="__main__":main()
