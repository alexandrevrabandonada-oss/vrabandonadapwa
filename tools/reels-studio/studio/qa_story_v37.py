from pathlib import Path
import json,re,subprocess,cv2,numpy as np,sys
from . import story_motion_v37 as v
R=Path(sys.argv[1]) if len(sys.argv)>1 else Path('work/v37/output')

def probe(path):
 return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],text=True))
def loudness(path):
 c=subprocess.run(['ffmpeg','-nostats','-hide_banner','-i',str(path),'-filter_complex','ebur128=peak=true','-f','null','-'],capture_output=True,text=True)
 if c.returncode:raise RuntimeError(c.stderr[-600:])
 tail=c.stderr.split('Summary:')[-1]
 I=re.search(r'I:\s*(-?\d+\.\d+) LUFS',tail);TP=re.search(r'Peak:\s*(-?\d+\.\d+) dBFS',tail)
 return {'integrated_lufs':float(I.group(1)) if I else None,'true_peak_dbfs':float(TP.group(1)) if TP else None,'tail':tail[-300:]}

def sample(path,t):
 cap=cv2.VideoCapture(str(path));cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,f=cap.read();cap.release()
 if not ok:raise RuntimeError(f'Frame read {path.name} {t}')
 return f

def report_one(path):
 p=probe(path);streams={x['codec_type']:x for x in p['streams']};vinfo=streams['video'];ainfo=streams['audio']
 assert (int(vinfo['width']),int(vinfo['height']),vinfo['r_frame_rate'])==(1080,1920,'30/1')
 assert abs(float(p['format']['duration'])-14.5)<.08
 signal=loudness(path)
 assert -19.5<signal['integrated_lufs']<-13
 assert signal['true_peak_dbfs']<=-1.0
 phases=[]
 for i,shot in enumerate(v.STAGES):
  a=sample(path,shot[0]+.10);b=sample(path,shot[0]+.5*(shot[1]-shot[0]));
  aa=cv2.resize(a[200:1460],(270,315));bb=cv2.resize(b[200:1460],(270,315));
  frac=float(np.mean(np.abs(aa.astype('int16')-bb.astype('int16')).mean(axis=2)>20))
  phases.append({'shot':i+1,'grammar':shot[6],'changed_fraction':round(frac,4)})
 assert min(x['changed_fraction'] for x in phases)>.06
 m=json.loads(path.with_suffix('.json').read_text())
 assert m['narration_embedded'] is False and m['publication_approved'] is False
 assert m['independent_typography_grammars']==8
 assert m['narrative_titles_aligned_to_real_source']
 assert len(set(m['title_grammars']))==8
 return {'file':str(path.name),'ok':True,'spec':{'width':1080,'height':1920,'fps':30,'duration_sec':14.5,'video_codec':vinfo['codec_name'],'audio_codec':ainfo['codec_name']},'audio':{k:val for k,val in signal.items() if k!='tail'},'phases':phases,'timing_words':32,'voice_embedded':False,'publication_approved':False}

A=R/'V37_NARRATIVA_CINETICA.mp4';B=R/'V37_NARRATIVA_CONTIDA.mp4';a=report_one(A);b=report_one(B)
compare=[]
for i,s in enumerate(v.STAGES):
 t=s[0]+min(.23,(s[1]-s[0])*.37)
 x=cv2.resize(sample(A,t)[200:700],(270,125));y=cv2.resize(sample(B,t)[200:700],(270,125))
 diff=float(np.mean(np.abs(x.astype('int16')-y.astype('int16')).mean(axis=2)>14))
 compare.append({'shot':i+1,'time_sec':round(t,3),'kinetic_vs_measured_difference':round(diff,4)})
assert sum(x['kinetic_vs_measured_difference']>.03 for x in compare)>=5
summary={'version':'v0.37','internal_preview_only':True,'a':a,'b':b,'ab_comparison':compare,'timed_words':32,'artist_score_verified_by_qa':False,'human_reviewed':False}
(R/'V37_AUDITORIA.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps({'a':a['audio'],'b':b['audio'],'min_scene_change':min(x['changed_fraction'] for x in a['phases']),'ab_mean':round(np.mean([x['kinetic_vs_measured_difference'] for x in compare]),3)},ensure_ascii=False))