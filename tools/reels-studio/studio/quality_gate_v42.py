"""Technical validation for the v0.42 three-format motion laboratory.

Does not evaluate aesthetics or authorize distribution.
"""
from __future__ import annotations
import argparse, json, re, subprocess
from pathlib import Path
import cv2
import numpy as np
from .three_grammars_v42 import PROFILES, SOURCES, sha1


def probe(path:Path):
 return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format',
                                            '-of','json',str(path)],text=True))

def loudness(path:Path):
 proc=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-filter_complex',
                       'ebur128=peak=true','-f','null','-'],capture_output=True,text=True)
 if proc.returncode:raise RuntimeError('EBU R128 failed')
 summary=proc.stderr.rsplit('Summary:',1)[-1]
 a=re.search(r'I:\s*(-?[\d.]+)\s*LUFS',summary)
 b=re.search(r'Peak:\s*(-?[\d.]+)\s*dBFS',summary)
 return {'integrated_lufs':float(a.group(1)) if a else None,
         'true_peak_dbfs':float(b.group(1)) if b else None}

def sample_motion(path:Path):
 cap=cv2.VideoCapture(str(path));samples=[];black=0
 try:
  for sec in (0.5,1.5,2.5,3.5,4.5,5.5):
   cap.set(cv2.CAP_PROP_POS_MSEC,sec*1000)
   ok,frame=cap.read()
   if not ok:raise ValueError('unreadable output video frame')
   center=cv2.resize(cv2.cvtColor(frame[360:1510],cv2.COLOR_BGR2GRAY),(150,160))
   black+=int(frame.mean()<5)
   samples.append(center)
 finally:cap.release()
 diffs=[round(float((np.abs(a.astype('int16')-b.astype('int16'))>20).mean()),4)
        for a,b in zip(samples,samples[1:])]
 return {'source_stage_intervals_changed':diffs,'no_completely_black_sample_frames':black==0}

def analyze(path:Path):
 path=Path(path)
 data=json.loads(path.with_suffix('.json').read_text(encoding='utf8'))
 p=probe(path);v=next(x for x in p['streams'] if x['codec_type']=='video')
 audio=[x for x in p['streams'] if x['codec_type']=='audio']
 errors=[]
 if data.get('profile') not in PROFILES:errors.append('unknown profile')
 if (v['width'],v['height'],v['avg_frame_rate'])!=(1080,1920,'30/1'):
  errors.append('FullHD 30fps technical contract failed')
 if abs(float(p['format']['duration'])-6.0)>.09:errors.append('duration mismatch')
 if not audio:errors.append('audio stream absent')
 if data.get('narration_embedded') is not False:errors.append('unverified voice claim')
 if data.get('publication_approved') is not False or not data.get('laboratory_only'):
  errors.append('unapproved public release')
 for key,info in data.get('sources',{}).items():
  if key not in SOURCES or info.get('sha1')!=SOURCES[key][1]:
   errors.append(f'bad source provenance {key}')
 levels=loudness(path);movement=sample_motion(path)
 if levels['integrated_lufs'] is None or abs(levels['integrated_lufs']+16)>2:
  errors.append('loudness outside lab target')
 if levels['true_peak_dbfs'] is None or levels['true_peak_dbfs']>-1:
  errors.append('audio peak unsafe')
 if any(x<.04 for x in movement['source_stage_intervals_changed']):
  errors.append('source stage changes too little between visual story beats')
 if not movement['no_completely_black_sample_frames']:
  errors.append('unexpected completely black frames')
 return {'version':'v0.42','profile':data.get('profile'),'technical_pass':not errors,
         'errors':errors,'video':{'width':v['width'],'height':v['height'],
          'fps':v['avg_frame_rate'],'duration':float(p['format']['duration'])},
         'sound':levels,'visual_story_beats':movement,
         'quality_not_certified':True,'voice_embedded':False,'publication_approved':False}

def main():
 arg=argparse.ArgumentParser();arg.add_argument('--video',required=True,type=Path)
 a=arg.parse_args();r=analyze(a.video)
 path=a.video.with_name(a.video.stem+'_QA.json')
 path.write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf8')
 print(json.dumps(r,ensure_ascii=False,indent=2))
 if not r['technical_pass']:raise SystemExit(1)
if __name__=='__main__':main()
