"""Measured technical QA for 1080x1920 @ 30fps v29; never awards artistic scores."""
from __future__ import annotations
import argparse,json,re,subprocess
from pathlib import Path
import cv2
import numpy as np
from .master_director_v29 import W,H,FPS,DUR,SHOTS,read_words,cue_groups


def probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],text=True))


def technical(path,manifest,words):
    media=probe(path)
    video=next(s for s in media['streams'] if s['codec_type']=='video')
    audio=next((s for s in media['streams'] if s['codec_type']=='audio'),None)
    dur=float(media['format']['duration'])
    errors=[]
    if (video['width'],video['height'])!=(W,H):errors.append('not native 1080x1920')
    if video.get('r_frame_rate')!='30/1':errors.append('not 30fps')
    if video.get('codec_name')!='h264':errors.append('not H264')
    if not audio or audio['codec_name']!='aac':errors.append('no AAC soundtrack')
    if abs(dur-DUR)>.1:errors.append('incorrect duration')
    if manifest.get('voice_embedded') and not manifest.get('voice_sha256'):
        errors.append('voice claim without exact source digest')
    # Frame-level evidence that the middle is moving real archival source.
    c=cv2.VideoCapture(str(path))
    if not c.isOpened():raise ValueError('cannot decode finished MP4')
    frames=[];lumas=[];motion=[]
    for t in [0.65,2.85,5.15,6.85,7.45,8.91,9.20,10.25,12.55]:
        c.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,frame=c.read()
        if not ok:errors.append('missing review frame');continue
        roi=cv2.resize(frame[150:1480],(270,332),interpolation=cv2.INTER_AREA)
        lumas.append(float(cv2.cvtColor(roi,cv2.COLOR_BGR2GRAY).mean()))
        frames.append(roi)
    for a,b in ((3,4),(5,6)):
        if len(frames)>b:
            # No absolute proof of human action, just a moving image QA check.
            delta=float(cv2.absdiff(frames[a],frames[b]).mean())
            motion.append(round(delta,2))
            if delta<1.5:errors.append('video-action frames may be effectively static')
    c.release()
    if lumas and min(lumas)<10:errors.append('near-black historical image region')
    words_verified=read_words(words)
    if len(cue_groups(words_verified))<5:errors.append('caption cue batching unexpectedly small')
    # Loudness measurement needs decoded audio and cannot be inferred from metadata.
    proc=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-filter_complex','ebur128=peak=true','-f','null','-'],capture_output=True,text=True)
    if proc.returncode!=0:errors.append('loudness decoding failed')
    final=proc.stderr
    lm=list(re.finditer(r'Integrated loudness:\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS',final))
    tp=list(re.finditer(r'True peak:\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS',final))
    integrated=float(lm[-1].group(1)) if lm else None
    peak=float(tp[-1].group(1)) if tp else None
    if integrated is None or not -22<=integrated<=-12:errors.append('loudness out of demo acceptance range')
    if peak is None or peak>-1:errors.append('true peak unsafe')
    return {'technical_ok':not errors,'errors':errors,'width':video['width'],'height':video['height'],
            'fps':video.get('r_frame_rate'),'duration_sec':dur,'video_codec':video['codec_name'],
            'audio_codec':audio['codec_name'] if audio else None,'integrated_lufs':integrated,'true_peak_dbfs':peak,
            'frame_motion_mean_abs_diff':motion,'source_image_luminance':lumas,
            'voice_embedded':bool(manifest.get('voice_embedded')),
            'word_count':len(words_verified),'cue_count':len(cue_groups(words_verified)),
            'native_composition':manifest.get('native_composition') is True,
            'is_publication_approved':False,'aesthetic_score_certified':False}


def timestamp(t):
    millis=round(t*1000);h,rem=divmod(millis,3600000);m,rem=divmod(rem,60000);s,ms=divmod(rem,1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'


def export_srt(words,path):
    chunks=cue_groups(words)
    output=[]
    for i,chunk in enumerate(chunks,1):
        a,b=words[chunk[0]]['start'],words[chunk[-1]]['end']
        phrase=' '.join(words[j]['text'] for j in chunk)
        output.append(f'{i}\n{timestamp(a)} --> {timestamp(b)}\n{phrase}')
    Path(path).write_text('\n\n'.join(output)+'\n',encoding='utf8')
    return len(chunks)


def contact(path,out):
    film=cv2.VideoCapture(str(path))
    board=np.zeros((2*672,4*378,3),np.uint8)
    for i,s in enumerate(SHOTS):
        film.set(cv2.CAP_PROP_POS_MSEC,(s.start+s.end)*500)
        ok,f=film.read()
        if not ok:raise ValueError('contact frame missing')
        f=cv2.resize(f,(378,672),interpolation=cv2.INTER_AREA)
        board[(i//4)*672:(i//4+1)*672,(i%4)*378:(i%4+1)*378]=f
    film.release()
    if not cv2.imwrite(str(out),board):raise ValueError('could not export contact sheet')


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--video',type=Path,required=True)
    p.add_argument('--words',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    data=json.loads(a.video.with_suffix('.json').read_text(encoding='utf8'))
    report=technical(a.video,data,a.words)
    a.out.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
    export_srt(read_words(a.words),a.out.with_suffix('.srt'))
    contact(a.video,a.out.with_suffix('.jpg'))
    print(json.dumps(report,indent=2,ensure_ascii=False))
    if not report['technical_ok']:raise SystemExit(1)

if __name__=='__main__':main()
