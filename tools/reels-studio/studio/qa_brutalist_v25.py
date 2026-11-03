"""V25 independent technical QA: authentic motion, export, EBU loudness.

Never convert these checks into a self-certified artistic 10/10.
"""
from __future__ import annotations
import argparse
import json
import re
import subprocess
from pathlib import Path
import cv2
import numpy as np
from .spider_brutalist_v25 import BEATS,W,H,FPS,DURATION


def media_info(path):
    return json.loads(subprocess.check_output([
        'ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)],text=True))


def loudness(path):
    p=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(path),
                      '-filter_complex','ebur128=peak=true','-f','null','-'],
                     capture_output=True,text=True,check=True)
    tail=p.stderr.rsplit('Summary:',1)[-1]
    integrated=re.search(r'\bI:\s*(-?\d+(?:\.\d+)?)\s*LUFS',tail)
    peak=re.search(r'True peak:\s*\n\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS',tail)
    if not integrated or not peak:
        raise ValueError('EBU R128 summary unavailable')
    return float(integrated.group(1)),float(peak.group(1))


def qa(path):
    report=media_info(path)
    video=next((s for s in report['streams'] if s.get('codec_type')=='video'),None)
    audio=next((s for s in report['streams'] if s.get('codec_type')=='audio'),None)
    if not video or not audio:
        raise ValueError('both audio and video required')
    problems=[]
    duration=float(report['format']['duration'])
    fpsn,fpsd=map(int,video.get('avg_frame_rate','0/1').split('/'))
    actual_fps=fpsn/fpsd if fpsd else 0.
    if abs(duration-DURATION)>.05:problems.append('wrong duration')
    if abs(actual_fps-FPS)>.01:problems.append('wrong FPS')
    if (int(video['width']),int(video['height']))!=(W,H):problems.append('wrong dimensions')
    if video['codec_name']!='h264' or audio['codec_name']!='aac':
        problems.append('wrong codecs')
    cap=cv2.VideoCapture(str(path))
    samples=[]
    for i,beat in enumerate(BEATS):
        mid=(beat.start+beat.end)/2
        cap.set(cv2.CAP_PROP_POS_MSEC,mid*1000)
        ok,frame=cap.read()
        if not ok:
            problems.append(f'blank shot {i}');continue
        stdev=float(np.std(frame))
        dark=float(np.mean(frame.mean(axis=2)<14))
        samples.append({'beat':beat.name,'contrast_stddev':round(stdev,1),
                        'near_black_share':round(dark,3)})
        if stdev<23 or dark>.78:problems.append(f'shot {i} empty or dark')
    cap.set(cv2.CAP_PROP_POS_MSEC,7000);one,a=cap.read()
    cap.set(cv2.CAP_PROP_POS_MSEC,7500);two,b=cap.read()
    cap.release()
    delta=float(np.mean(cv2.absdiff(a,b))) if one and two else 0.
    if delta<1:problems.append('source film motion not detected')
    integrated,peak=loudness(path)
    if not (-21<=integrated<=-14) or peak>-1:problems.append('audio loudness fail')
    return {'ok':not problems,'problems':problems,'duration':duration,'fps':actual_fps,
            'resolution':[W,H],'codec_video':video['codec_name'],
            'codec_audio':audio['codec_name'],'ebu_lufs':integrated,
            'true_peak_dbfs':peak,'film_motion_difference':round(delta,2),
            'samples':samples,'voice_embedded':False,
            'artistic_quality_certified':False,'publication_approved':False}


def main():
    p=argparse.ArgumentParser()
    p.add_argument('video',type=Path)
    p.add_argument('--out',type=Path)
    a=p.parse_args()
    result=qa(a.video)
    if a.out:
        a.out.parent.mkdir(parents=True,exist_ok=True)
        a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps(result,ensure_ascii=False,indent=2))
    if not result['ok']:raise SystemExit(2)

if __name__=='__main__':main()
