"""Objective audiovisual QA for v39, no autonomous artistic grade."""
from __future__ import annotations
import argparse,json,re,subprocess
from pathlib import Path
import cv2,numpy as np
from .adaptive_director_v39 import editorial_plan,verify_word_anchor
from . import story_motion_v37 as base


def audit(video:Path,word_file:Path):
    video=Path(video); word_file=Path(word_file)
    manifest=json.loads(video.with_suffix('.json').read_text(encoding='utf-8'))
    plan=editorial_plan()
    if manifest.get('version')!='v0.39' or manifest.get('voice_embedded') is not False:
        raise ValueError('Wrong v39 or falsely claimed integrated voice')
    if manifest.get('source_sha1',{}).get('foreign_film')!=base.FILM_SHA1:
        raise ValueError('Foreign source hash absent or invalid')
    if manifest.get('shot_plan')!=plan:
        raise ValueError('Editorial motion profile and actual scene plan diverge')
    if manifest.get('publication_approved') is not False:
        raise ValueError('Unapproved material cannot be labelled public')
    word_drifts=verify_word_anchor(base.words_load(word_file))
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format',
               '-of','json',str(video)],text=True))
    v=next(s for s in probe['streams'] if s['codec_type']=='video')
    a=next(s for s in probe['streams'] if s['codec_type']=='audio')
    duration=float(probe['format']['duration'])
    if (v['codec_name'],v['width'],v['height'],v['r_frame_rate'])!=('h264',1080,1920,'30/1'):
        raise ValueError('Not H264 native portrait FullHD 30fps')
    if a['codec_name']!='aac' or abs(duration-14.5)>.08:
        raise ValueError('Wrong audio codec or duration')
    movement=[];cap=cv2.VideoCapture(str(video))
    if not cap.isOpened():raise ValueError('Cannot decode video')
    try:
        for s in plan:
            t1=s['start']+.16*(s['end']-s['start'])
            t2=s['start']+.73*(s['end']-s['start'])
            snapshots=[]
            for t in (t1,t2):
                cap.set(cv2.CAP_PROP_POS_MSEC,t*1000)
                ok,img=cap.read()
                if not ok:raise ValueError('Missing shot frame')
                crop=img[280:1420,55:1025]
                snap=cv2.resize(cv2.cvtColor(crop,cv2.COLOR_BGR2GRAY),(194,228))
                snapshots.append(snap)
            changed=float(np.mean(cv2.absdiff(*snapshots)>17))
            movement.append({'shot':s['index'],'intent':s['narrative_intent'],
                             'profile':s['motion_profile'],'visible_change_fraction':round(changed,4)})
    finally:cap.release()
    if any(x['visible_change_fraction']<.025 for x in movement):
        raise ValueError('A declared animated shot produced insufficient image movement')
    loudness=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(video),'-vn',
                   '-af','loudnorm=I=-16:TP=-2:LRA=7:print_format=json','-f','null','-'],
                   capture_output=True,text=True,check=True)
    match=re.search(r'\{\s*"input_i"\s*:\s*".*?".*?"input_tp".*?\}',loudness.stderr,re.S)
    if not match:raise ValueError('Loudness measurement unavailable')
    audio_stats=json.loads(match.group(0));i=float(audio_stats['input_i']);tp=float(audio_stats['input_tp'])
    if not -19.5<=i<=-13.5 or tp>-1.0:
        raise ValueError('Unsafe or inappropriate published audio level')
    return {'version':'v0.39','qa_technical_ok':True,'duration_sec':duration,
            'res':f"{v['width']}x{v['height']}",'fps':30,'video_codec':'H264','audio_codec':'AAC',
            'integrated_lufs':i,'true_peak_dbtp':tp,'cut_word_drift_sec':word_drifts,
            'max_cut_word_drift_sec':max(word_drifts), 'shots':movement,
            'manual_artistic_review_required':True,'external_user_study_done':False,
            'voice_audible':False,'publication_approved':False}


def main():
    p=argparse.ArgumentParser();p.add_argument('--video',type=Path,required=True)
    p.add_argument('--words',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    args=p.parse_args();result=audit(args.video,args.words)
    args.out.write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps({'passed':True,'lufs':result['integrated_lufs'],
         'peak':result['true_peak_dbtp'],'shot_count':len(result['shots'])}))
if __name__=='__main__':main()
