"""Automated technical gate for vertical Reels; no aesthetic or editorial approval."""
from __future__ import annotations
import argparse,json,re,subprocess
from pathlib import Path
import cv2

def check(path:Path,width=540,height=960,seconds=12.,fps=24):
    if not path.is_file():raise FileNotFoundError(path)
    meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format',
                                             '-of','json',str(path)],text=True))
    vs=next((s for s in meta['streams'] if s['codec_type']=='video'),None)
    audio=next((s for s in meta['streams'] if s['codec_type']=='audio'),None)
    errs=[]
    if vs is None:errs.append('no video stream')
    if audio is None:errs.append('no audio stream')
    dur=float(meta['format']['duration'])
    if abs(dur-seconds)>.05:errs.append(f'duration mismatch: {dur}')
    if vs and (vs.get('width')!=width or vs.get('height')!=height):errs.append('wrong native frame dimensions')
    if vs and vs.get('r_frame_rate')!=f'{fps}/1':errs.append('wrong frame rate')
    p=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(path),
                      '-filter_complex','ebur128=peak=true','-f','null','-'],
                     stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
    tail=p.stderr.rsplit('Summary:',1)[-1]
    l=re.search(r'Integrated loudness:\s*I:\s*([+-]?[\d.]+)\s*LUFS',tail)
    tp=re.search(r'True peak:\s*Peak:\s*([+-]?[\d.]+)\s*dBFS',tail)
    loudness=float(l.group(1)) if l else None
    peak=float(tp.group(1)) if tp else None
    if p.returncode or loudness is None or peak is None:errs.append('audio measurement unavailable')
    else:
        if not -20<=loudness<=-12:errs.append(f'loudness outside provisional range: {loudness}')
        if peak>-1.5:errs.append(f'true peak too high: {peak}')
    cap=cv2.VideoCapture(str(path))
    black=0;sampled=0
    for sec in [0,2,4,6,8,10]:
        cap.set(cv2.CAP_PROP_POS_MSEC,sec*1000)
        ok,frame=cap.read()
        if ok:
            sampled+=1
            if (cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)<10).mean()>.92:black+=1
    cap.release()
    if black:errs.append(f'{black} almost-black sampled frames')
    return {'ok':not errs,'errors':errs,'duration_sec':dur,'width':vs.get('width') if vs else None,
       'height':vs.get('height') if vs else None,'fps':fps,'integrated_lufs':loudness,
       'true_peak_dbtp':peak,'sampled_frames':sampled,'almost_black_sampled_frames':black,
       'artistic_quality_certified':False,'publication_approved':False}

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('input',type=Path)
    p.add_argument('--width',type=int,default=540)
    p.add_argument('--height',type=int,default=960)
    p.add_argument('--fps',type=int,default=24)
    p.add_argument('--seconds',type=float,default=12.)
    a=p.parse_args()
    r=check(a.input,width=a.width,height=a.height,fps=a.fps,seconds=a.seconds)
    print(json.dumps(r,ensure_ascii=False,indent=2))
    if not r['ok']:raise SystemExit(1)
