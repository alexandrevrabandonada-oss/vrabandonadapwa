"""Independent measurable QA for v42 (not an artistic 10/10 certificate)."""
from pathlib import Path
import json, subprocess
import cv2,numpy as np
from .shot_scout_v42 import check_edit_plan,SOURCES

def inspect_video(video:Path,plan_path:Path):
 master=json.loads(video.with_suffix('.json').read_text(encoding='utf8'))
 plan=json.loads(plan_path.read_text(encoding='utf8'))['edit_plan'];shots=plan['shots']
 check_edit_plan(shots)
 errors=[]
 if master.get('narration_embedded') is not False:errors.append('narration must not be claimed')
 if master.get('public_release') is not False or not master.get('internal_only'):errors.append('public export must remain gated')
 if master.get('shots')!=shots:errors.append('master and auto-selected timeline mismatch')
 if len(master.get('provenance',{}))!=5:errors.append('all five original source identities required')
 for key,source in master.get('provenance',{}).items():
  if source['role'] != SOURCES[key]['role']:errors.append(f'false source role: {key}')
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(video)],text=True))
 visual=next((x for x in probe['streams'] if x['codec_type']=='video'),None)
 audio=next((x for x in probe['streams'] if x['codec_type']=='audio'),None)
 if visual is None or (visual['width'],visual['height'])!=(1080,1920):errors.append('missing native Full HD output')
 if visual and visual['r_frame_rate']!='30/1':errors.append('incorrect output frames per second')
 if audio is None:errors.append('missing actual instrumental track')
 if abs(float(probe['format']['duration'])-shots[-1]['end'])>.11:errors.append('wrong duration')
 # Real displayed pixel differences: sample 0.5 and 1.6 sec into each scene.
 cap=cv2.VideoCapture(str(video));rows=[]
 for i,s in enumerate(shots):
  pair=[]
  for time in (s['start']+.35,s['start']+min(1.6,(s['end']-s['start'])*.74)):
   cap.set(cv2.CAP_PROP_POS_MSEC,1000*time);ok,frame=cap.read()
   if not ok:errors.append('unreadable scene frame');continue
   # image-only, exclude typography and credits: y 235..1450
   img=cv2.resize(frame[235:1450,32:1048],(180,216))
   pair.append(img)
  if len(pair)==2:
   diff=np.mean(np.abs(pair[0].astype('float32')-pair[1].astype('float32')))/255
   frac=float((np.mean(abs(pair[0].astype('float32')-pair[1].astype('float32')),axis=2)>9).mean())
   rows.append({'shot':i+1,'source_id':s['source_id'],'source_sec':s['source_at'],
                'mean_normalized_change':round(float(diff),4),
                'moving_area_fraction':round(frac,4),'grammar':s['grammar']})
   if frac<.025:errors.append(f'scene {i+1}: movement is too subtle to verify')
 cap.release()
 # Source hashes are checked on ingest and prior to rendering, but report does not
 # assert copyright, authorship, face recognition, aesthetic quality, or semantic truth.
 loud=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(video),
     '-filter_complex','ebur128=peak=true','-f','null','-'],capture_output=True,text=True)
 details=loud.stderr
 import re
 lufs=list(re.finditer(r'I:\s*(-?\d+(?:\.\d+)?) LUFS',details))
 tp=list(re.finditer(r'Peak:\s*(-?\d+(?:\.\d+)?) dBFS',details))
 integrated=float(lufs[-1].group(1)) if lufs else None
 peak=float(tp[-1].group(1)) if tp else None
 if loud.returncode!=0 or integrated is None:errors.append('unable to measure real audio')
 if integrated is not None and not (-23<=integrated<=-13):errors.append('sound outside laboratory loudness range')
 if peak is not None and peak>-1.0:errors.append('true peak too high')
 return {'version':'v0.42','pass':not errors,'errors':errors,'format':{
  'resolution':[visual['width'],visual['height']] if visual else None,
  'fps':visual['r_frame_rate'] if visual else None,'duration':float(probe['format']['duration']),
  'audio_codec':audio['codec_name'] if audio else None,'integrated_lufs':integrated,
  'true_peak_dbfs':peak},'shots':rows,'distinct_sources':len(set(s['source_id'] for s in shots)),
  'distinct_grammars':len(set(s['grammar'] for s in shots)),
  'auto_selected_footage_count':sum(s['source_at'] is not None for s in shots),
  'rights_review_for_release':False,'voice_embedded':False,
  'human_artistic_quality_certified':False,'public_release':False}

if __name__=='__main__':
 import argparse
 ap=argparse.ArgumentParser();ap.add_argument('--video',required=True,type=Path);ap.add_argument('--plan',required=True,type=Path);ap.add_argument('--out',required=True,type=Path)
 args=ap.parse_args();result=inspect_video(args.video,args.plan)
 args.out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
 print(json.dumps({k:result[k] for k in ['pass','errors','format','distinct_sources','distinct_grammars','auto_selected_footage_count']},ensure_ascii=False))
 if not result['pass']:raise SystemExit(1)
