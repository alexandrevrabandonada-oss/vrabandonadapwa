"""V19 Aço Gráfico: local historical photo + real local moving footage.

A city-context visual test, NOT footage of the 1962 CSN accident.
Source bytes are separately preserved, Commons SHA1 checked, license review
not inferred from a Creative Commons label.
"""
from __future__ import annotations
import argparse,hashlib,json,math,subprocess,urllib.parse,urllib.request,wave
from pathlib import Path
import cv2
import numpy as np
from PIL import Image,ImageDraw,ImageFont

SOURCES={
  "csn_2014":{"title":"File:CSN01.jpg","kind":"photo","year":2014,"author":"HenriqueBarraMansa",
     "license":"CC BY-SA 3.0","license_review":"creator-uploaded",
     "fact":"Vista da CSN, maio de 2014. Não é registro de 1962."},
  "rodovia_2017":{"title":"File:Rodovia do Contorno é inaugurada após 22 anos de obra.webm",
     "kind":"video","year":2017,"author":"TV BrasilGov","license":"CC BY 3.0",
     "license_review":"PENDING_MANUAL_REVIEW",
     "fact":"Reportagem de 8 dezembro 2017 sobre inauguração da Rodovia do Contorno."}
}
API="https://commons.wikimedia.org/w/api.php"
USER_AGENT="VRAbandonada-ResearchReels/0.19 (source credits retained; educational internal review)"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
PAPER=(252,239,205);YELLOW=(255,223,76);MAGENTA=(232,44,119);COBALT=(24,22,74)
def fetch_asset(key,root:Path):
    if key not in SOURCES:raise ValueError("source key not permitted")
    spec=SOURCES[key];root.mkdir(parents=True,exist_ok=True)
    query=urllib.parse.urlencode({"action":"query","format":"json","prop":"imageinfo",
            "iiprop":"url|sha1|size|mime|extmetadata","titles":spec['title']})
    req=urllib.request.Request(API+"?"+query,headers={"User-Agent":USER_AGENT})
    with urllib.request.urlopen(req,timeout=35) as response:
        result=json.load(response)
    page=next(iter(result['query']['pages'].values()))
    info=page['imageinfo'][0]
    if "sha1" not in info or "url" not in info:raise ValueError("Commons imageinfo incomplete")
    raw_sha=info['sha1'].lower();fname=key+(".jpg" if spec['kind']=="photo" else ".webm")
    dest=root/fname;temp=root/(fname+".partial")
    try:
        req=urllib.request.Request(info['url'],headers={"User-Agent":USER_AGENT})
        sha=hashlib.sha1();total=0
        with urllib.request.urlopen(req,timeout=90) as r, temp.open("wb") as out:
            while True:
                chunk=r.read(1024*1024)
                if not chunk:break
                out.write(chunk);sha.update(chunk);total+=len(chunk)
        if sha.hexdigest()!=raw_sha or total!=int(info['size']):
            raise ValueError("SOURCE_INTEGRITY_MISMATCH")
        temp.replace(dest)
    finally:
        temp.unlink(missing_ok=True)
    record={"id":key,"filename":fname,"sha1":raw_sha,"size_bytes":total,
        "commons_page":"https://commons.wikimedia.org/wiki/"+urllib.parse.quote(spec['title'].replace(" ","_")),
        "source_url":info['url'],"author":spec['author'],"license":spec['license'],
        "license_review":spec['license_review'],"date_label":spec['year'],
        "editorial_role":"historical_city_context","not_evidence_of_1962":True,
        "publication_approved":False}
    (root/(key+".json")).write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding="utf8")
    return record

def get_font(size):
    return ImageFont.truetype(FONT,max(12,int(size)))

def fit_lines(draw,txt,font,maxw):
    words=txt.split();lines=[];line=""
    for word in words:
        proposed=(line+" "+word).strip()
        if draw.textbbox((0,0),proposed,font=font)[2]>maxw and line:
            lines.append(line);line=word
        else:line=proposed
    if line:lines.append(line)
    return lines

def cover(img,w,h,x=.5,y=.5,zoom=1.):
    ih,iw=img.shape[:2];factor=max(w/iw,h/ih)*zoom
    rw=max(w,round(iw*factor));rh=max(h,round(ih*factor))
    a=cv2.resize(img,(rw,rh),interpolation=cv2.INTER_AREA if factor<1 else cv2.INTER_LINEAR)
    ox=int(np.clip(x*rw-w/2,0,rw-w));oy=int(np.clip(y*rh-h/2,0,rh-h))
    return a[oy:oy+h,ox:ox+w].copy()

def decorate(frame,w,h,t,label,source_line,title,year):
    im=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)).convert('RGBA')
    gfx=Image.new('RGBA',(w,h),(0,0,0,0));d=ImageDraw.Draw(gfx)
    pad=int(w*.062);sz=w/540
    d.polygon([(0,0),(int(w*.91),0),(int(w*.78),int(h*.19)),(0,int(h*.145))],fill=(*COBALT,240))
    d.polygon([(w,0),(w,int(h*.155)),(int(w*.87),int(h*.09))],fill=(*MAGENTA,234))
    d.rectangle((pad,int(h*.09),pad+int(w*.24),int(h*.095)),fill=(*YELLOW,255))
    f=get_font(42*sz)
    y=int(h*.030)
    for line in fit_lines(d,title,f,w-pad*2)[:2]:
        d.text((pad,y),line,font=f,fill=(*PAPER,255),stroke_width=1)
        y+=int(50*sz)
    d.rectangle((0,int(h*.845),w,h),fill=(7,10,29,247))
    d.rectangle((0,int(h*.844),w,int(h*.851)),fill=(*MAGENTA,255))
    d.text((pad,int(h*.864)),label,font=get_font(24*sz),fill=(*YELLOW,255))
    for i,line in enumerate(fit_lines(d,source_line,get_font(17*sz),w-pad*2)[:2]):
        d.text((pad,int(h*.899)+i*int(21*sz)),line,font=get_font(17*sz),fill=(*PAPER,255))
    d.text((pad,int(h*.965)),f"ANO DO REGISTRO: {year}  |  TESTE INTERNO",font=get_font(16*sz),fill=(*PAPER,246))
    return cv2.cvtColor(np.asarray(Image.alpha_composite(im,gfx).convert("RGB")),cv2.COLOR_RGB2BGR)

def make_audio(path:Path,duration=14.,sr=24000):
    # Original abstract pulse texture, NOT a claim about on-location sound.
    t=np.arange(round(duration*sr),dtype=np.float64)/sr
    envelope=.25+.2*np.sin(2*np.pi*.5*t)**2
    low=np.sin(2*np.pi*(62*t+6*np.sin(2*np.pi*.08*t)))*envelope
    tick=np.sin(2*np.pi*300*t)*(np.sin(2*np.pi*1.8*t)**22)*.12
    signal=np.tanh((low*.32+tick)*1.2)*.45
    fade=np.minimum(np.minimum(t/.45,(duration-t)/.7),1).clip(0,1)
    pcm=(signal*fade*32767).astype('<i2')
    with wave.open(str(path),'wb') as out:
        out.setnchannels(1);out.setsampwidth(2);out.setframerate(sr);out.writeframes(pcm.tobytes())

def verify_local(key,path:Path):
    if key not in SOURCES:raise ValueError("unknown source")
    manifest=path.parent/(key+".json")
    if not path.is_file() or not manifest.is_file():raise ValueError("source or verified manifest missing")
    meta=json.loads(manifest.read_text(encoding="utf8"))
    if meta.get("id")!=key or meta.get("publication_approved") is not False:
        raise ValueError("untrusted source manifest")
    digest=hashlib.sha1()
    with path.open("rb") as fd:
        while (chunk:=fd.read(1024*1024)):digest.update(chunk)
    if digest.hexdigest()!=meta.get("sha1") or path.stat().st_size!=meta.get("size_bytes"):
        raise ValueError("source hash differs from verified Commons manifest")
    if meta.get("license_review")!=SOURCES[key]["license_review"]:
        raise ValueError("license review status mismatch")
    return meta

def render(photo:Path,footage:Path,out:Path,w=540,h=960,fps=24,seconds=14,
           photo_start=0.,video_start=15.):
    if fps not in (24,30) or (w,h) not in ((540,960),(1080,1920)):raise ValueError("unsafe master profile")
    verify_local("csn_2014",photo);verify_local("rodovia_2017",footage)
    still=cv2.imread(str(photo))
    if still is None:raise ValueError("invalid photo")
    cap=cv2.VideoCapture(str(footage))
    if not cap.isOpened():raise ValueError("video unreadable")
    source_fps=cap.get(cv2.CAP_PROP_FPS)
    if source_fps<=0:raise ValueError("video timestamps unreadable")
    out.parent.mkdir(parents=True,exist_ok=True)
    silent=out.with_name(out.stem+"_video_only.mp4")
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*"mp4v"),fps,(w,h))
    if not writer.isOpened():raise RuntimeError("video encoder not available")
    current=-1;video_frame=None
    try:
        for i in range(round(seconds*fps)):
            t=i/fps
            if t<4.:
                frame=cover(still,w,h,.48+.05*(t/4),.49,1.08+.10*(t/4))
                tag,credit,title,year="CSN · VOLTA REDONDA","FOTO HENRIQUEBARRAMANSA / CC BY-SA 3.0","A CIDADE DO AÇO",2014
            elif t<10.:
                fsec=video_start+(t-4)
                frame_id=round(fsec*source_fps)
                if current<0 or frame_id<current:
                    cap.set(cv2.CAP_PROP_POS_FRAMES,frame_id);current=frame_id-1
                while current<frame_id:
                    ok,video_frame=cap.read()
                    if not ok:raise RuntimeError("2017 source video ended unexpectedly")
                    current+=1
                frame=cover(video_frame,w,h,.50,.5,1.05)
                tag,credit,title,year="RODOVIA DO CONTORNO · VOLTA REDONDA","TV BRASILGOV / CC BY 3.0 · REVISÃO PENDENTE","IMAGENS DA CIDADE",2017
            else:
                fsec=video_start+(t-4)
                frame_id=round(fsec*source_fps)
                while current<frame_id:
                    ok,video_frame=cap.read()
                    if not ok:raise RuntimeError("video source ended")
                    current+=1
                half=int(w*.50)
                frame=np.full((h,w,3),(20,16,58),dtype=np.uint8)
                frame[:,:half]=cover(still,half,h,.55,.50,1.16)
                frame[:,half:]=cover(video_frame,w-half,h,.52,.5,1.07)
                frame[:,half-3:half+3]=(35,46,248)
                tag,credit,title,year="DUAS FONTES · CONTEXTOS DISTINTOS","CSN: HENRIQUEBARRAMANSA | RODOVIA: TV BRASILGOV","CONTEXTO É TUDO","2014 / 2017"
            writer.write(decorate(frame,w,h,t,tag,credit,title,year))
    finally:
        writer.release();cap.release()
    tone=out.with_suffix(".wav");make_audio(tone,seconds)
    first=out.with_name(out.stem+"_firstpass.mp4")
    subprocess.run(["ffmpeg","-y","-v","error","-i",str(silent),"-i",str(tone),
                    "-map","0:v:0","-map","1:a:0","-c:v","libx264","-preset","fast",
                    "-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","128k",
                    "-af","loudnorm=I=-16:LRA=7:TP=-2.5","-t",str(seconds),str(first)],check=True)
    subprocess.run(["ffmpeg","-y","-v","error","-i",str(first),"-map","0:v:0","-map","0:a:0",
                    "-c:v","copy","-c:a","aac","-b:a","128k",
                    "-af","alimiter=limit=0.68:level=false,volume=-1dB",
                    "-movflags","+faststart",str(out)],check=True)
    first.unlink(missing_ok=True)
    return {"seconds":seconds,"fps":fps,"width":w,"height":h,"publication_approved":False,
       "has_narration_Alexandre":False,"video_is_csn":False,
       "source_photo_year":2014,"source_film_year":2017,
       "rights_review":"Video review pending; experimental internal-only"}

def main():
    ap=argparse.ArgumentParser();sp=ap.add_subparsers(dest="op",required=True)
    f=sp.add_parser("fetch");f.add_argument("--out",type=Path,required=True)
    r=sp.add_parser("render");r.add_argument("--photo",type=Path,required=True);r.add_argument("--video",type=Path,required=True)
    r.add_argument("--out",type=Path,required=True);r.add_argument("--start",type=float,default=15.)
    args=ap.parse_args()
    if args.op=="fetch":
        print(json.dumps([fetch_asset(s,args.out) for s in SOURCES],indent=2,ensure_ascii=False))
    else:
        print(json.dumps(render(args.photo,args.video,args.out,video_start=args.start),indent=2,ensure_ascii=False))
if __name__=="__main__":main()
