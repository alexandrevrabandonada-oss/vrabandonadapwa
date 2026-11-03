"""Aço Gráfico v0.31: multi-era historical documentary master at 1080x1920.

Improves on v29 with four genuine local photos: 1941 construction workers,
1969 CSN interior with steel coils, and 2014 CSN01/CSN02 panoramas. Exactly
one explicit foreign-video context is used. Original source data unchanged. V33 adds independently timed moving layers.
The design is an original industrial print/kinetic language; no third-party
character art or iconic animation panels are reproduced.
"""
from __future__ import annotations
import argparse,hashlib,json,math,subprocess
from pathlib import Path
import cv2,numpy as np
from PIL import Image,ImageDraw
from . import master_director_v29 as base
from .verified_media_v31 import verify
from .voice_integrity_v30 import inspect_candidate

SCENES=(
 base.Shot(0,.92,'photo','poster','A CIDADE TEM MEMÓRIA',
           '1941 · CONSTRUÇÃO DA CSN EM VOLTA REDONDA · ACERVO ARQUIVO NACIONAL'),
 base.Shot(.92,1.90,'photo','archive','A HISTÓRIA DO AÇO',
           '1969 · INTERIOR DA CSN · BOBINAS DE AÇO · ACERVO ARQUIVO NACIONAL'),
 base.Shot(1.90,4.08,'photo','strips','A USINA EM 2014',
           'CSN · VOLTA REDONDA · HENRIQUEBARRAMANSA, 2014'),
 base.Shot(4.08,6.16,'photo','poster','A CIDADE DO AÇO',
           'CSN · VOLTA REDONDA · HENRIQUEBARRAMANSA, 2014'),
 base.Shot(6.16,8.46,'film','molten','METAL EM MOVIMENTO',
           'FRANÇA · SIDERURGIA · DAMIEN VICART, 2011',2.6,.43),
 base.Shot(8.46,9.66,'film','worker','TRABALHO EM CENA',
           'FRANÇA · SIDERURGIA · DAMIEN VICART, 2011',7.8,.77),
 base.Shot(9.66,11.56,'film','furnace','ARQUIVO E ORIGEM',
           'FRANÇA · SIDERURGIA · DAMIEN VICART, 2011',27.8,.52),
 base.Shot(11.56,14.5,'both','comparison','ORIGENS DIFERENTES',
           'CSN, 2014 / FRANÇA, 2011 · COMPARAÇÃO EDITORIAL',22.4,.55),
)

PHOTO_SOURCE_IDS=['csn_construction_1941','csn_interior_1969','csn_2014_02','csn_2014_01']

def perceptual_hash(src):
    gray=cv2.cvtColor(src,cv2.COLOR_BGR2GRAY)
    gray=cv2.resize(gray,(9,8))
    return (gray[:,1:]>gray[:,:-1]).astype('uint8')

def hamming(a,b):return int(np.sum(a!=b))

def inspect_plan(shots=SCENES):
    base.check_plan(shots)
    if len(shots)!=8:raise ValueError('8 source-based shots required')
    if [round(s.end,2) for s in shots[:4]] != [.92,1.90,4.08,6.16]:
        raise ValueError('semantic years or image changes misaligned')
    if any(s.role=='photo' for s in shots[4:]):
        raise ValueError('French film section must remain international')
    if '1941' not in shots[0].credit or '1969' not in shots[1].credit:
        raise ValueError('historic years cannot be erased')
    if any('2014' not in s.credit for s in shots[2:4]):
        raise ValueError('CSN 2014 source must be clearly dated')
    if any('FRANÇA' not in s.credit for s in shots[4:]):
        raise ValueError('French footage misidentified as the CSN')
    mx=max(s.end-s.start for s in shots[:4])
    return {'reels_shots':len(shots),'distinct_real_still_sources':4,
      'max_same_still_exposure_sec':round(mx,3),
      'v29_same_photo_exposure_sec':6.16,
      'measurable_exposure_reduction_percent':round(100*(1-mx/6.16),1),
      'source_switches_at_sec':[.92,1.90,4.08,6.16],
      'film_windows':sorted(set(s.film_at for s in shots if s.film_at is not None))}


def source_checks(stills:list[Path]):
    if len(stills)!=4:raise ValueError('four authentic CSN photos required')
    metadata=[verify(p,k) for p,k in zip(stills,PHOTO_SOURCE_IDS)]
    images=[cv2.imread(str(p)) for p in stills]
    if any(x is None for x in images):raise ValueError('unreadable archival photo')
    hashes=[perceptual_hash(x) for x in images]
    distances=[hamming(hashes[i],hashes[j]) for i in range(4) for j in range(i+1,4)]
    if min(distances)<6:raise ValueError('visual sources are too similar')
    return images,metadata,distances

def guide_after_lettering(frame,shot,variant,index,elapsed):
    """Kinetic registration/print texture is confined to editorial strips."""
    accent=base.YELLOW if variant=='graphic' else base.CYAN
    color=(accent[2],accent[1],accent[0]);h,w=frame.shape[:2]
    # Three short print-registration marks, NOT painted over evidence.
    pulse=max(0.,1-elapsed/.22)
    if pulse:
        for j in range(3):
            x=42+j*46+round(12*pulse);y=120
            cv2.line(frame,(x,y),(x,y+round(16*pulse)),color,2,cv2.LINE_AA)
    # Rotating industrial-style progress gauge in the bottom credit margin.
    radius=17;cx=1030;cy=1874
    cv2.circle(frame,(cx,cy),radius,(82,82,82),2,cv2.LINE_AA)
    cv2.ellipse(frame,(cx,cy),(radius,radius),-90,0,int(360*min(1,(elapsed/(shot.end-shot.start)))),color,3,cv2.LINE_AA)
    return frame


def narration_safe_overlay(shot,variant,index,phase,has_narration):
    # A received file can be audible yet its speaker identity remains unverified.
    # Never claim the signal itself proves the voice is Alexandre.
    layer=base.static_overlay(shot,variant,index,phase,voice_embedded=False)
    if has_narration:
        from PIL import ImageDraw
        image=Image.fromarray(layer,'RGBA')
        draw=ImageDraw.Draw(image)
        draw.rectangle((32,1870,1010,1914),fill=(9,13,24,255))
        draw.text((40,1879),'NARRAÇÃO INSERIDA · IDENTIDADE A CONFERIR',
                  font=base.font(24,'body'),fill=base.CREAM)
        layer=np.asarray(image)
    return layer

def v31_overlay(shot,variant,index,phase,voice_embedded=False):
    image=Image.fromarray(narration_safe_overlay(shot,variant,index,phase,voice_embedded)).convert('RGBA')
    draw=ImageDraw.Draw(image)
    ac=base.YELLOW if variant=='graphic' else base.CYAN
    draw.rectangle((875,34,1078,127),fill=(11,14,23,255))
    draw.text((893,54),f'{index+1:02d} / 08',font=base.font(39,'heavy'),fill=(*ac,255))
    return np.asarray(image)


# v0.33: source images and original film are not rewritten on disk.
# Camera/image layers remain 30fps. Editorial industrial graphic poses are held
# on twos (15fps). Motion is an editorial derivative, never historic video.
MOTION_V33=('impact','layer_slide','depth_tilt','ink_press','slag_reveal',
            'crosscut','furnace_iris','documentary_hold')

def kinetic_state_v33(shot_index,elapsed):
    if not 0<=shot_index<8:raise ValueError('motion scene absent')
    if elapsed<0:raise ValueError('negative edit time')
    g=math.floor(elapsed*15+1e-8)/15
    def ease(x):
        x=max(0.,min(1.,x))
        return x*x*(3-2*x)
    approach=1-ease(g/.39)
    return {'image_phase':elapsed,'graphic_phase':g,'camera_offset':13*math.sin(elapsed*2.4),
            'layer_offset':int(135*approach),'ink_offset':int(5*math.sin(g*15)),
            'occlusion':int(260*(1-ease(g/.29))),
            'motion':MOTION_V33[shot_index]}

def kinetic_motion_v33(frame,shot,elapsed,index,variant):
    """Independent spatial trajectories. No character/copyrighted scenes copied."""
    s=kinetic_state_v33(index,elapsed)
    y0,y1=base.START,base.BOTTOM
    h=y1-y0;w=frame.shape[1]
    original=frame[y0:y1].copy()
    # Photo stage: independent image material slides, not a global zoom/palette swap.
    if index in (0,1,2,3):
        out=original.copy()
        bands=3 if index in (0,2) else 2
        sh=max(1,h//bands)
        for layer in range(bands):
            ya=layer*sh;yb=h if layer==bands-1 else min(h,ya+sh)
            image=original[ya:yb]
            direction=-1 if layer%2 else 1
            amplitude=s['layer_offset']*(1+.18*layer)
            dx=int(round(direction*amplitude + s['camera_offset']*(.6+.23*layer)))
            mat=np.float32([[1,0,dx],[0,1,0]])
            out[ya:yb]=cv2.warpAffine(image,mat,(w,yb-ya),
                         borderMode=cv2.BORDER_REFLECT_101)
        frame[y0:y1]=out
        # Foreground structural bars are part of the art direction, never evidence.
        if index==1:
            cx=int(62+s['occlusion']*.4)
            cv2.line(frame,(cx,y0),(cx,y1),(12,17,29),7,cv2.LINE_AA)
    elif index in (4,5,6):
        # Keep original film at natural FPS: only the graphics run on twos.
        side=int(s['occlusion']*(.85 if index==4 else .5 if index==5 else .3))
        if side:
            cv2.rectangle(frame,(0,y0),(side,y1),(12,15,25),-1)
        ink=base.YELLOW if variant=='graphic' else base.CYAN
        col=(ink[2],ink[1],ink[0])
        for j in range(3):
            yy=y0+78+j*79
            x=int((110+j*177+s['ink_offset']*3)%w)
            cv2.line(frame,(x,yy),(min(w-12,x+74),yy),col,2,cv2.LINE_AA)
    else:
        # A slow resolution, not maximal motion. The two sources retain their labels.
        yy=y0+round((h-25)*min(1,max(0,elapsed/(shot.end-shot.start))))
        ink=base.YELLOW if variant=='graphic' else base.CYAN
        col=(ink[2],ink[1],ink[0])
        cv2.line(frame,(28,yy),(w-28,yy),col,2,cv2.LINE_AA)
    return frame

def inspect_motion_language_v33():
    return {'patterns':list(MOTION_V33),'distinct_grammars':len(set(MOTION_V33)),
            'documentary_fps':30,'editorial_poses_fps':15,
            'independent_layers':True,'voice_embedded':False,
            'aesthetic_quality_certified':False}

def render(photo_1941:Path,photo_1969:Path,photo_2014_02:Path,photo_2014_01:Path,
           film_path:Path,words_path:Path,out:Path,*,variant='graphic',voice_path=None,
           quality='master'):
    if variant not in ('graphic','cinema'):raise ValueError('invalid variant')
    if quality not in ('draft','master'):raise ValueError('invalid quality')
    plan=inspect_plan()
    photographs,meta,distances=source_checks([photo_1941,photo_1969,photo_2014_02,photo_2014_01])
    filmhash=base.hashcheck(film_path,'c1129cac8654866856c7bec31196206f16eac6c7')
    words=base.read_words(words_path)
    voice=inspect_candidate(voice_path,words_path) if voice_path else None
    cap=cv2.VideoCapture(str(film_path))
    if not cap.isOpened():raise ValueError('film missing')
    film_fps=float(cap.get(cv2.CAP_PROP_FPS))
    out=Path(out);out.parent.mkdir(parents=True,exist_ok=True)
    silent=out.with_name(out.stem+'_silent.avi')
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*'MJPG'),base.FPS,(base.W,base.H))
    if not writer.isOpened():raise ValueError('native writer failed')
    overlays={(i,phase):v31_overlay(s,variant,i,phase,voice is not None)
              for i,s in enumerate(SCENES) for phase in ('impact','quiet')}
    doc=json.dumps(words,ensure_ascii=False,separators=(',',':'))
    reader_i=-1;last_frame=-1;movie=None
    try:
        for fr in range(round(base.FPS*base.DUR)):
            t=fr/base.FPS
            index=next(i for i,s in enumerate(SCENES) if s.start<=t<s.end)
            shot=SCENES[index];elapsed=t-shot.start
            if shot.film_at is not None:
                fid=round((shot.film_at+elapsed)*film_fps)
                if reader_i!=index or fid<last_frame:
                    cap.set(cv2.CAP_PROP_POS_FRAMES,fid);last_frame=fid-1
                while last_frame<fid:
                    ok,movie=cap.read()
                    if not ok:raise ValueError('video source ended')
                    last_frame+=1
                reader_i=index
            elif movie is None:
                movie=photographs[0]
            still=photographs[index] if index<4 else photographs[3]
            frame=kinetic_motion_v33(base.frame_image(still,movie,shot,elapsed,variant),shot,elapsed,index,variant)
            phase='impact' if elapsed<.30 else 'quiet'
            frame=base.alpha_composite(frame,overlays[(index,phase)])
            current=base.caption_draw(words,t,variant)
            if current:
                gid,active=current
                sub=base.caption_region(doc,gid,active,variant,voice_embedded=voice is not None)
                alpha=sub[:,:,3:4].astype('float32')/255.
                reg=frame[1470:1788].astype('float32')
                frame[1470:1788]=np.uint8(np.clip(reg*(1-alpha)+sub[:,:,:3][:,:,::-1]*alpha,0,255))
            frame=guide_after_lettering(frame,shot,variant,index,elapsed)
            ac=base.YELLOW if variant=='graphic' else base.CYAN
            pos=round(fr/(base.DUR*base.FPS)*base.W)
            cv2.rectangle(frame,(0,base.H-9),(pos,base.H-1),(ac[2],ac[1],ac[0]),-1)
            writer.write(frame)
    finally:
        writer.release();cap.release()
    score=out.with_suffix('.wav');base.soundtrack(score,SCENES)
    ins=['-i',str(silent),'-i',str(score)]
    if voice:
        ins+=['-i',str(voice_path)]
        filt='[1:a]volume=0.32[m];[m][2:a]sidechaincompress=threshold=0.015:ratio=8:attack=8:release=220[du];[du][2:a]amix=inputs=2:duration=longest:weights=0.48 1.0,loudnorm=I=-16:TP=-2:LRA=8[a]'
        mapargs=['-filter_complex',filt,'-map','0:v:0','-map','[a]']
    else:
        mapargs=['-map','0:v:0','-map','1:a:0','-af','loudnorm=I=-16:TP=-2.4:LRA=7']
    cmd=['ffmpeg','-hide_banner','-y','-v','error',*ins,*mapargs,
         '-c:v','libx264','-preset','fast' if quality=='master' else 'ultrafast',
         '-crf','18' if quality=='master' else '23','-pix_fmt','yuv420p',
         '-r',str(base.FPS),'-c:a','aac','-b:a','192k','-t',str(base.DUR),
         '-movflags','+faststart',str(out)]
    subprocess.run(cmd,check=True)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(out)],text=True))
    v=next(s for s in probe['streams'] if s.get('codec_type')=='video')
    if (v['width'],v['height'],v['r_frame_rate'])!=(1080,1920,'30/1'):
        raise ValueError('not a true Full HD master')
    result={'version':'v0.33','master':str(out),'canvas':f'{base.W}x{base.H}',
        'native_composition':True,'upscaled_old_video':False,
        'fps':base.FPS,'duration_sec':base.DUR,'variant':variant,'shots':[vars(s) for s in SCENES],
        'photo_sources':[m['source_url'] for m in meta],
        'photo_source_sha1':[m['sha1'] for m in meta],
        'photo_source_ids':[m['id'] for m in meta],
        'photo_perceptual_hash_distances':distances,
        'image_diversity':plan,'motion_language':inspect_motion_language_v33(),'film_sha1':filmhash,
        'source_film_france_2011':True,
        'source_archival_construction_1941_and_real_interior_1969':True,
        'voice_embedded':voice is not None,'voice_sha256':voice['sha256'] if voice else None,
        'original_Alexandre_generation_hash_verified':False,
        'speaker_identity_verified':False,
        'word_timing_from_real_recording':True,
        'publication_approved':False,'aesthetic_score':None,'human_reviewed':False,
        'status':'INTERNAL_REVIEW_ONLY'}
    out.with_suffix('.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
    silent.unlink(missing_ok=True);score.unlink(missing_ok=True)
    return result


def contact(video_path,out_path):
    cap=cv2.VideoCapture(str(video_path));thumbs=[]
    for s in SCENES:
        cap.set(cv2.CAP_PROP_POS_MSEC,(s.start+s.end)*500)
        ok,f=cap.read()
        if not ok:raise ValueError('contact frame unreadable')
        thumbs.append(cv2.resize(f,(270,480)))
    cap.release()
    canvas=np.zeros((960,4*270,3),np.uint8)
    for i,img in enumerate(thumbs):
        x=(i%4)*270;y=(i//4)*480
        canvas[y:y+480,x:x+270]=img
    if not cv2.imwrite(str(out_path),canvas):raise ValueError('contact sheet write failed')
    return str(out_path)


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--build1941',required=True,type=Path)
    ap.add_argument('--inside1969',required=True,type=Path)
    ap.add_argument('--csn02',required=True,type=Path)
    ap.add_argument('--csn01',required=True,type=Path)
    ap.add_argument('--film',required=True,type=Path)
    ap.add_argument('--words',required=True,type=Path)
    ap.add_argument('--out',required=True,type=Path)
    ap.add_argument('--variant',choices=['graphic','cinema'],default='graphic')
    ap.add_argument('--quality',choices=['master','draft'],default='master')
    ap.add_argument('--voice',type=Path)
    p=ap.parse_args()
    m=render(p.build1941,p.inside1969,p.csn02,p.csn01,p.film,p.words,p.out,
        variant=p.variant,voice_path=p.voice,quality=p.quality)
    contact(p.out,p.out.with_suffix('.jpg'))
    print(json.dumps({'path':m['master'],'voice':m['voice_embedded'],
                      'unique_photos':len(m['photo_source_ids']),
                      'reduction':m['image_diversity']['measurable_exposure_reduction_percent']},indent=2))

if __name__=='__main__':main()
