"""VR Abandonada Reel Factory: deterministic and provenance-aware audiovisual prototype.

Requires Python 3.10+, opencv-python, numpy, pillow and installed ffmpeg/ffprobe.
No network, publication APIs, credentials, synthetic news or implicit publishing.
"""
from __future__ import annotations
import argparse, csv, hashlib, json, math, os, re, shutil, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from .captions import load_timeline, active_caption

PALETTE = {'ink': (16, 20, 25), 'paper': (239, 235, 223),
           'copper': (239, 107, 52), 'electric': (45, 191, 222), 'muted': (195, 188, 174)}
FONT_BOLD = '/usr/share/fonts/truetype/lato/Lato-Heavy.ttf'
FONT_MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
VALID_ROLES = {'context', 'evidence', 'archive', 'illustration', 'texture', 'soundtrack', 'voice'}


def load_project(path: Path) -> dict[str, Any]:
    obj = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(obj, dict): raise ValueError('manifest must be a JSON object')
    return obj


def local_file(base: Path, raw: str) -> Path:
    """Resolve only local paths (external URLs never downloaded during render)."""
    if not raw or raw.startswith(('http:', 'https:', 'file:')):
        raise ValueError('asset requires a local relative path')
    p = (base / raw).resolve()
    if not p.is_relative_to(base.resolve()): raise ValueError('path traverses outside workspace')
    return p


def hash_file(p: Path) -> str:
    s = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''): s.update(chunk)
    return s.hexdigest()


def validate(project: dict, root: Path, purpose: str = 'internal') -> dict:
    errors, warnings = [], []
    if purpose not in ('internal', 'publish'): errors.append('purpose invalid')
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{2,80}', str(project.get('project_id',''))):
        errors.append('project_id must be slug')
    assets = project.get('assets', {})
    scenes = project.get('scenes', [])
    if not isinstance(assets, dict) or not assets: errors.append('assets missing');assets={}
    if not isinstance(scenes, list) or not scenes: errors.append('scenes missing');scenes=[]
    total = 0.
    allowed = {'photograph', 'parallax', 'document', 'clip'}
    for asset_id, a in assets.items():
        if not isinstance(a, dict): errors.append(f'asset {asset_id}: invalid');continue
        if a.get('role') not in VALID_ROLES: errors.append(f'asset {asset_id}: role required')
        if not a.get('source'): errors.append(f'asset {asset_id}: source/provenance missing')
        if not a.get('capture_date'): warnings.append(f'asset {asset_id}: capture date unknown; use an honest on-screen label')
        rights=a.get('rights_status','unknown')
        if rights not in ('cleared', 'pending', 'restricted'): errors.append(f'asset {asset_id}: invalid rights status')
        if purpose=='publish' and rights!='cleared': errors.append(f'asset {asset_id}: publication blocked, rights={rights}')
        try:
            file=local_file(root, str(a.get('file','')))
            if not file.is_file(): errors.append(f'asset {asset_id}: file missing: {a.get("file")}')
            elif a.get('sha256') and hash_file(file)!=a['sha256']:errors.append(f'asset {asset_id}: hash mismatch')
        except ValueError as e: errors.append(f'asset {asset_id}: {e}')
    for i, sc in enumerate(scenes):
        if not isinstance(sc, dict): errors.append(f'scene {i}: invalid');continue
        if sc.get('type') not in allowed: errors.append(f'scene {i}: unknown type')
        if sc.get('asset') not in assets: errors.append(f'scene {i}: missing referenced asset')
        if sc.get('type') == 'parallax':
            if sc.get('background_asset') not in assets: errors.append(f'scene {i}: background_asset missing')
            if sc.get('mask_asset') not in assets: errors.append(f'scene {i}: mask_asset missing')
        if sc.get('claim') and not sc.get('evidence_id'):errors.append(f'scene {i}: claim without evidence_id')
        if sc.get('type')=='document' and sc.get('overlay'):
            errors.append(f'scene {i}: no title overlay over primary-source document')
        if len(fit_text(str(sc.get('overlay','')),26)) > 3:
            errors.append(f'scene {i}: overlay too long; split the scene instead of truncating text')
        if sc.get('evidence_id') and sc['evidence_id'] not in assets:errors.append(f'scene {i}: referenced evidence missing')
        if sc.get('type')=='clip' and sc.get('asset') in assets:
            try:
                item=assets[sc['asset']]
                filename=local_file(root,item.get('file',''))
                if filename.is_file():
                    meta=probe(filename)
                    if not any(st.get('codec_type')=='video' for st in meta.get('streams',[])):
                        errors.append(f'scene {i}: clip has no video stream')
                    start=float(sc.get('clip_start',0))
                    dur=float(sc.get('duration',0))
                    if start<0 or start+dur>float(meta.get('format',{}).get('duration',0))+.1:
                        errors.append(f'scene {i}: clip exceeds source duration')
            except (ValueError,KeyError,TypeError,subprocess.CalledProcessError) as e:
                errors.append(f'scene {i}: invalid clip: {e}')
        if (sc.get('type')=='document' and not sc.get('source_label')):
            errors.append(f'scene {i}: document requires source_label')
        try:
            d=float(sc['duration']); assert 0.2<=d<=180; total+=d
        except (ValueError, KeyError, TypeError, AssertionError):errors.append(f'scene {i}: invalid duration')
    narration=project.get('narration', {})
    if narration.get('file'):
        try:
            p=local_file(root,narration['file'])
            if not p.is_file(): errors.append('narration file missing')
            else:
                media=probe(p)
                audio_duration=float(media['format']['duration'])
                if not any(st.get('codec_type')=='audio' for st in media.get('streams',[])):
                    errors.append('narration file has no audio stream')
                if audio_duration>total+.15:errors.append('narration longer than video: would truncate speech')
                if narration.get('sha256') and narration['sha256']!=hash_file(p):errors.append('narration hash mismatch')
                if narration.get('caption_timeline'):
                    caption_path=local_file(root,narration['caption_timeline'])
                    if not caption_path.is_file():errors.append('caption timeline file missing')
                    else:load_timeline(caption_path,narration.get('text',''),audio_duration)
        except (ValueError,KeyError,TypeError,subprocess.CalledProcessError) as e: errors.append(f'narration: {e}')
    else:
        warnings.append('narration not embedded: final voice/synchronization gate fails')
        if purpose=='publish': errors.append('publish blocked: narration or explicit audio waiver required')
    timed = bool(narration.get('caption_timeline') and narration.get('timings_verified') and narration.get('timings_reviewed'))
    if not timed:
        warnings.append('timecoded captions not independently reviewed: cannot claim precise synchronization')
        if purpose=='publish': errors.append('publish blocked: captions/timings not reviewed')
    if purpose=='publish' and not project.get('human_approval',{}).get('approved',False):
        errors.append('publish blocked: human editorial approval missing')
    return {'ok':not errors,'purpose':purpose,'errors':errors,'warnings':warnings,
            'scene_count':len(scenes),'asset_count':len(assets),'duration_sec':round(total,3),
            'publishable':purpose=='publish' and not errors}


def ease(t:float)->float:
    x=max(0.0,min(1.0,t));return x*x*(3-2*x)


def zoom_crop(im: np.ndarray, width:int, height:int, fx:float=.5, fy:float=.5, scale:float=1.0)->np.ndarray:
    """Fill screen, then adjust virtual camera; focus coords are normalized to source."""
    ih,iw=im.shape[:2]; ratio=max(width/iw,height/ih)*max(1.0,scale)
    sw=max(width,round(iw*ratio)); sh=max(height,round(ih*ratio))
    resized=cv2.resize(im,(sw,sh),interpolation=cv2.INTER_LINEAR)
    x=int(round(np.clip(fx*sw-width/2,0,sw-width)))
    y=int(round(np.clip(fy*sh-height/2,0,sh-height)))
    return resized[y:y+height,x:x+width].copy()


def treatment(image:np.ndarray,theme:str,amount:float=.24)->np.ndarray:
    im=image.astype(np.float32)
    if theme=='document':
        # Never rewrite printed evidence: mild contrast only.
        im=(im-127)*1.055+127
    else:
        # Cinematic warm shadows + electric blue edges; keep the source identifiable.
        im=(im-127)*(1+.18*amount)+127
        shadow=np.clip((110-im.mean(axis=2,keepdims=True))/115,0,1)
        im+=shadow*np.array([11,-4,-3],dtype=np.float32)*amount
    return np.uint8(np.clip(im,0,255))


def transparent_overlay(background:np.ndarray,front:np.ndarray,mask:np.ndarray)->np.ndarray:
    m=(mask.astype(np.float32)/255.)[:,:,None]
    return np.uint8(np.clip(background.astype(np.float32)*(1-m)+front.astype(np.float32)*m,0,255))


def font_path(bold:bool)->str:
    for p in ([FONT_BOLD,'/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else [FONT_MONO,'/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']):
        if Path(p).exists():return p
    raise RuntimeError('Fonts missing')


def fit_text(text:str,max_chars=27)->list[str]:
    words=text.split();lines=[];part=[]
    for w in words:
        if sum(map(len,part))+len(part)+len(w)>max_chars and part:
            lines.append(' '.join(part));part=[]
        part.append(w)
    if part:lines.append(' '.join(part))
    return lines


def graphics(frame:np.ndarray,scene:dict,t:float,width:int,height:int,caption:str|None=None)->np.ndarray:
    fg=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)).convert('RGBA')
    lay=Image.new('RGBA',(width,height),(0,0,0,0));d=ImageDraw.Draw(lay)
    # Technical metadata located in peripheral safe zone; never masquerade as archived text.
    pad=int(width*.065)
    label=scene.get('source_label') or scene.get('context_label','')
    if label:
        font=ImageFont.truetype(font_path(False),max(14,round(width*.032)))
        d.text((pad,int(height*.09)),label,font=font,fill=(*PALETTE['paper'],232),stroke_width=1,stroke_fill=(0,0,0,185))
    ttl=scene.get('overlay','') if not caption else ''
    if ttl:
        f=ImageFont.truetype(font_path(True),max(20,round(width*.069)))
        lines=fit_text(ttl,26)
        y=int(height*.70)
        # lightweight ink shadow, no generic powerpoint card.
        for line in lines:
            d.text((pad+3,y+4),line.upper(),font=f,fill=(0,0,0,175),stroke_width=2,stroke_fill=(0,0,0,155))
            d.text((pad,y),line.upper(),font=f,fill=(*PALETTE['paper'],247))
            y+=int(width*.088)
        d.line([(pad,int(height*.7)-12),(pad+round(width*.18),int(height*.7)-12)],fill=(*PALETTE['copper'],245),width=max(3,width//110))
    if caption:
        # Subtitles stay above bottom app chrome. They belong to a verified timing file,
        # not to a guessed audio transcript; graphic is not drawn on other frames.
        f=ImageFont.truetype(font_path(True),max(16,round(width*.043)))
        words=caption.split();lines=[];line=''
        max_width=width-int(2*pad)
        for w in words:
            candidate=(line+' '+w).strip()
            if d.textbbox((0,0),candidate,font=f)[2]>max_width and line:
                lines.append(line);line=w
            else:line=candidate
        if line:lines.append(line)
        if len(lines)>3:raise ValueError('caption too long for mobile safe region')
        line_height=int(width*.061)
        y=int(height*.79)-line_height*len(lines)
        for line in lines:
            bb=d.textbbox((0,0),line,font=f,stroke_width=2)
            x=(width-(bb[2]-bb[0]))//2
            d.text((x,y),line,font=f,fill=(*PALETTE['paper'],255),stroke_width=3,stroke_fill=(0,0,0,235))
            y+=line_height
    if scene.get('disclaimer'):
        f=ImageFont.truetype(font_path(False),max(12,round(width*.025)))
        d.text((pad,int(height*.9)),scene['disclaimer'],font=f,fill=(*PALETTE['paper'],225))
    return cv2.cvtColor(np.asarray(Image.alpha_composite(fg,lay).convert('RGB')),cv2.COLOR_RGB2BGR)


def camera(sc:dict,ratio:float):
    cam=sc.get('camera',{})
    at=cam.get('from',[.5,.5,1.0]);to=cam.get('to',[.5,.5,1.08])
    u=ease(ratio)
    return [float(at[i])+(float(to[i])-float(at[i]))*u for i in range(3)]


class Engine:
    def __init__(self,project:dict,root:Path,width=540,height=960,fps=24):
        self.project=project;self.root=root;self.width=width;self.height=height;self.fps=fps
        self.images:dict[str,np.ndarray]={};self.caps:dict[str,cv2.VideoCapture]={}
        self.assets=project['assets']
        self.cues=[]
        nar=project.get('narration',{})
        if nar.get('file') and nar.get('caption_timeline'):
            duration=float(probe(local_file(root,nar['file']))['format']['duration'])
            self.cues=load_timeline(local_file(root,nar['caption_timeline']),nar.get('text',''),duration)
    def image(self,asset_id:str)->np.ndarray:
        if asset_id not in self.images:
            p=local_file(self.root,self.assets[asset_id]['file'])
            im=cv2.imread(str(p),cv2.IMREAD_UNCHANGED)
            if im is None:raise ValueError('Cannot decode image '+asset_id)
            self.images[asset_id]=im
        return self.images[asset_id]
    def frame(self,sc:dict,position:float,absolute_time:float|None=None)->np.ndarray:
        typ=sc['type'];dur=float(sc['duration']);ratio=np.clip(position/dur,0,1)
        cx,cy,z=camera(sc,ratio)
        if typ=='clip':
            aid=sc['asset']
            if aid not in self.caps:self.caps[aid]=cv2.VideoCapture(str(local_file(self.root,self.assets[aid]['file'])))
            cap=self.caps[aid]
            cap.set(cv2.CAP_PROP_POS_MSEC,1000*(float(sc.get('clip_start',0))+position))
            ok,src=cap.read()
            if not ok:raise ValueError(f'clip {aid} unavailable at {position:.3f}s — rejecting silent black frames')
            frame=zoom_crop(src,self.width,self.height,cx,cy,z)
        elif typ=='parallax':
            bg=self.image(sc['background_asset']);src=self.image(sc['asset']);mask=self.image(sc['mask_asset'])
            if mask.ndim==3:mask=cv2.cvtColor(mask[:,:,:3],cv2.COLOR_BGR2GRAY)
            # Different coordinates and scale for foreground creates real occlusion.
            b=zoom_crop(bg,self.width,self.height,cx*.98+.01,cy*.98+.01,z)
            front=zoom_crop(src,self.width,self.height,cx*.985+.007,cy*.98+.01,z*1.07)
            mk=zoom_crop(mask,self.width,self.height,cx*.985+.007,cy*.98+.01,z*1.07)
            frame=transparent_overlay(b,front,mk)
        else:
            frame=zoom_crop(self.image(sc['asset']),self.width,self.height,cx,cy,z)
        frame=treatment(frame,'document' if typ=='document' else 'cinematic')
        caption=active_caption(self.cues,absolute_time) if absolute_time is not None else None
        return graphics(frame,sc,position,self.width,self.height,caption)
    def close(self):
        for c in self.caps.values():c.release()


def probe(path:Path)->dict:
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries',
               'format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate','-of','json',str(path)],text=True))


def render(project:dict,root:Path,dest:Path,mode='preview',sample_fps=None)->dict:
    check=validate(project,root)
    if not check['ok']:raise ValueError('Manifest invalid: '+'; '.join(check['errors']))
    width,height,fps=(540,960,24) if mode=='preview' else (1080,1920,30)
    if sample_fps is not None:fps=int(sample_fps)
    dest.parent.mkdir(parents=True,exist_ok=True)
    video_only=dest.with_name(dest.stem+'.video_only.mp4')
    engine=Engine(project,root,width,height,fps)
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{width}x{height}','-r',str(fps),'-i','-',
         '-c:v','libx264','-preset','veryfast','-crf', '21' if mode=='preview' else '18','-pix_fmt','yuv420p','-movflags','+faststart',str(video_only)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    frames=0;scene_start=0.0
    try:
        for sc in project['scenes']:
            for i in range(round(float(sc['duration'])*fps)):
                fr=engine.frame(sc,i/fps,scene_start+i/fps)
                proc.stdin.write(fr.tobytes());frames+=1
            scene_start+=float(sc['duration'])
        proc.stdin.close();msg=proc.stderr.read().decode('utf-8',errors='replace');rc=proc.wait()
        if rc!=0:raise RuntimeError('ffmpeg render failed: '+msg[-2000:])
    except Exception:
        proc.kill();proc.wait();raise
    finally:engine.close()
    nar=project.get('narration',{});path=nar.get('file')
    bed=project.get('soundtrack',{}).get('file')
    audio=[]
    for path0 in [path,bed]:
        if path0 and local_file(root,path0).is_file():audio.append(local_file(root,path0))
    if audio:
        args=['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(video_only)]
        for p in audio:args.extend(['-i',str(p)])
        if path and bed:
            args.extend(['-filter_complex','[1:a]loudnorm=I=-16:LRA=8:TP=-1.5[v];[2:a]volume=0.12[b];[v][b]amix=inputs=2:duration=first:dropout_transition=0[a]',
                        '-map','0:v','-map','[a]'])
        else:args.extend(['-map','0:v','-map','1:a'])
        args.extend(['-c:v','copy','-c:a','aac','-b:a','160k','-t',str(frames/fps),'-movflags','+faststart',str(dest)])
        subprocess.run(args,check=True);video_only.unlink()
    else:video_only.replace(dest)
    ff=probe(dest)
    result={'output':str(dest),'mode':mode,'frames':frames,'fps':fps,'width':width,'height':height,
            'audio_attached':bool(audio),'narration_attached':bool(path and audio),
            'audio_sync_verified':bool(nar.get('timings_verified',False) and nar.get('timings_reviewed') and nar.get('caption_timeline') and path and audio),
            'ffprobe':ff,'validation':check,'publication_status':'INTERNAL ONLY'}
    dest.with_suffix('.qa.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    return result


def scorecard(previous:dict|None, new:dict, weights:dict)->dict:
    if abs(sum(weights.values())-100)>1e-6:raise ValueError('Weights must total 100')
    wrong=set(weights)-set(new)
    if wrong:raise ValueError('Missing scored categories: '+repr(wrong))
    for k,v in new.items():
        if not isinstance(v,(int,float)) or not 0<=v<=10:raise ValueError('Score must be in 0..10')
    total=round(sum(new[k]*weights[k] for k in weights)/100,2)
    previous_total=round(sum(previous[k]*weights[k] for k in weights)/100,2) if previous else None
    return {'score':total,'previous':previous_total,'delta':round(total-previous_total,2) if previous_total is not None else None,
            'criteria':new,'weights':weights,'ready_for_human_review':total>=9.5,
            'approved':False,'note':'10/10 is editorial opinion after human review, never inferred from score alone'}


def main():
    p=argparse.ArgumentParser(description='VR Abandonada Reel Factory — no automatic publication')
    p.add_argument('action',choices=['validate','render','audit','score','qa','improve','variant','shotlist'])
    p.add_argument('--project',type=Path,required=True)
    p.add_argument('--purpose',choices=['internal','publish'],default='internal')
    p.add_argument('--mode',choices=['preview','master'],default='preview')
    p.add_argument('--output',type=Path)
    p.add_argument('--ratings',type=Path)
    p.add_argument('--style',choices=['documental','cinematic','kinetic'],default='cinematic')
    a=p.parse_args();root=a.project.resolve().parent;root=root.parent if root.name in ("examples","output") else root;obj=load_project(a.project)
    if a.action=='validate':
        res=validate(obj,root,a.purpose);print(json.dumps(res,ensure_ascii=False,indent=2));sys.exit(0 if res['ok'] else 2)
    if a.action=='render':
        target=a.output or root/'output'/f"{obj['project_id']}_{a.mode}.mp4"
        print(json.dumps(render(obj,root,target,a.mode),ensure_ascii=False,indent=2));return
    if a.action=='audit':
        target=a.output or root/'output'/f"{obj['project_id']}_{a.mode}.mp4"
        report={'manifest':validate(obj,root,'internal'),'publish_gate':validate(obj,root,'publish'),'output':probe(target) if target.is_file() else None}
        print(json.dumps(report,ensure_ascii=False,indent=2));return
    if a.action=='qa':
        from .quality import audit as media_audit
        target=a.output or root/'output'/f"{obj['project_id']}_{a.mode}.mp4"
        print(json.dumps(media_audit(obj,root,target,a.mode=='master'),ensure_ascii=False,indent=2));return
    if a.action=='improve':
        from .iterate import prioritize
        ratings=json.loads(a.ratings.read_text()); print(json.dumps(prioritize(ratings),ensure_ascii=False,indent=2));return
    if a.action=='shotlist':
        from .director import shotlist
        print(json.dumps(shotlist(obj),ensure_ascii=False,indent=2));return
    if a.action=='variant':
        from .iterate import create_variant
        candidate=create_variant(obj,a.style)
        out=a.output or root/'output'/(obj['project_id']+'-'+a.style+'.json')
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(json.dumps(candidate,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps({'candidate':str(out),'valid':validate(candidate,root)['ok'],'unchanged_sources':True},ensure_ascii=False));return
    if a.action=='score':
        ratings=json.loads(a.ratings.read_text())
        print(json.dumps(scorecard(ratings.get('previous'),ratings['current'],ratings['weights']),ensure_ascii=False,indent=2))

if __name__=='__main__':main()
