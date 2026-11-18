"""V42 visual shot scout: ranks *actual source frames* for private video editing.

Never infers what an event depicts from motion. Each source has an explicit
editorial label and role; action-role cannot silently use interview footage.
No network or model API calls. Does not download, redistribute or publish media.
"""
from __future__ import annotations
import json, math, hashlib
from pathlib import Path
import cv2
import numpy as np

EXPECTED_SHA1={
 'france_2011':'c1129cac8654866856c7bec31196206f16eac6c7',
 'rodovia_2017':'0974ee5e46efa3599f623e32c94fc0e0fd7da46a',
 'csn_1941':'91d061df6f5fb7962d17c86948e656c335f1b0ca',
 'csn_1969':'1e16caba06722d121eaf3b88b39d89be910bb2a0',
 'csn_2014':'6a792f0fd16ddd4c8bed2ca981788c9b9accb7a4',
}
SOURCES={
 'france_2011': {'role':'industrial_context','year':2011,'origin':'França','truth':'NÃO É CSN','genre':'industrial_action'},
 'rodovia_2017': {'role':'regional_news_interview','year':2017,'origin':'Volta Redonda, RJ','truth':'REPORTAGEM DA RODOVIA DO CONTORNO','genre':'interview'},
 'csn_1941': {'role':'csn_archive_still','year':1941,'origin':'CSN · Volta Redonda','truth':'FOTOGRAFIA DE ARQUIVO','genre':'historical_still'},
 'csn_1969': {'role':'csn_archive_still','year':1969,'origin':'CSN · Volta Redonda','truth':'FOTOGRAFIA DE ARQUIVO','genre':'historical_still'},
 'csn_2014': {'role':'csn_archive_still','year':2014,'origin':'CSN · Volta Redonda','truth':'FOTOGRAFIA DE ARQUIVO','genre':'historical_still'},
}

def digest(path):
 h=hashlib.sha1()
 with Path(path).open('rb') as f:
  for chunk in iter(lambda:f.read(1<<20),b''):h.update(chunk)
 return h.hexdigest()

def verify_media(key,path):
 if key not in SOURCES:raise ValueError('unknown registered source')
 if key in EXPECTED_SHA1 and digest(path)!=EXPECTED_SHA1[key]:
  raise ValueError(f'{key}: original footage hash mismatch')
 return {'id':key,'sha1':digest(path),**SOURCES[key]}

def _grab(cap,second,shape=(192,108)):
 cap.set(cv2.CAP_PROP_POS_MSEC,int(second*1000))
 ok,frame=cap.read()
 if not ok: return None
 return cv2.cvtColor(cv2.resize(frame,shape),cv2.COLOR_BGR2GRAY)

def analyze_video(path, key, *, step=2.6, start=1.0, stop=None, window=1.8):
 if key not in SOURCES or SOURCES[key]['genre'] not in ('industrial_action','interview'):
  raise ValueError('Video analysis requires a registered video source')
 meta=verify_media(key,path)
 cap=cv2.VideoCapture(str(path))
 if not cap.isOpened():raise ValueError('unreadable video')
 duration=cap.get(cv2.CAP_PROP_FRAME_COUNT)/max(1.,cap.get(cv2.CAP_PROP_FPS))
 stop=min(float(stop) if stop is not None else duration-window-.1,duration-window-.1)
 results=[]
 try:
  for t in np.arange(start,stop,step):
   f0=_grab(cap,t);f1=_grab(cap,t+.5);f2=_grab(cap,t+1.0)
   if any(f is None for f in (f0,f1,f2)):continue
   # Motion is measured only inside the source's visual field, excluding
   # a narrow frame border but retaining original broadcaster captions.
   r=lambda x:x[8:-8,10:-10].astype('float32')
   d01=np.mean(np.abs(r(f1)-r(f0)))/255
   d12=np.mean(np.abs(r(f2)-r(f1)))/255
   motion=round(float((d01+d12)/2),5)
   # Similarity helps avoid selecting three almost identical interview frames.
   h=cv2.resize(f1,(9,8))
   bits=(h[:,1:]>h[:,:-1]).astype('uint8').ravel()
   results.append({'source_id':key,'at_sec':round(float(t),2),'motion':motion,
     'hash64':''.join(map(str,bits.tolist())),'duration':window,
     'region':meta['origin'],'kind':meta['role']})
 finally:cap.release()
 return {'meta':meta,'duration':round(duration,3),'candidates':results}

def hamming(a,b):
 if not (len(a)==len(b)==64):raise ValueError('invalid visual fingerprints')
 return sum(x!=y for x,y in zip(a,b))

def select_windows(report, *, role, count=2, min_gap=3.5):
 if role not in ('industrial_action','interview') or report['meta']['genre']!=role:
  raise ValueError('Requested role must match independently labeled source')
 if count<1:raise ValueError('positive shot count required')
 candidates=report['candidates'];selected=[]
 for item in sorted(candidates,key=lambda x:x['motion'],reverse=True):
  if any(abs(item['at_sec']-j['at_sec'])<min_gap for j in selected):continue
  # Prefer diverse source composition even if one candidate is slightly faster.
  if any(hamming(item['hash64'],j['hash64'])<5 for j in selected):continue
  selected.append(item)
  if len(selected)==count:break
 if len(selected)<count:raise ValueError('insufficient visually distinct windows')
 return selected

def build_edit_plan(scouts):
 france=scouts['france_2011'];road=scouts['rodovia_2017']
 f=select_windows(france,role='industrial_action',count=2,min_gap=5)
 r=select_windows(road,role='interview',count=1)
 # This is a PRIVATE MULTI-SOURCE ENGINE STUDY, not a single-event report.
 raw=[
  (0.,2.5,'csn_1941',None,'CONSTRUÇÃO • 1941','archive_unfold','FOTOGRAFIA · CSN · 1941'),
  (2.5,5.,'csn_1969',None,'INTERIOR DA USINA','archive_parallax','FOTOGRAFIA · CSN · 1969'),
  (5.,7.6,'rodovia_2017',r[0]['at_sec'],'A CIDADE EM 2017','news_window','RODOVIA DO CONTORNO · TV BRASILGOV · 2017'),
  (7.6,10.2,'france_2011',f[0]['at_sec'],'O AÇO EM MOVIMENTO','industrial_split','FILMAGEM FRANCESA · 2011 · NÃO É CSN'),
  (10.2,12.8,'france_2011',f[1]['at_sec'],'ORIGENS DIFERENTES','industrial_rail','FRANÇA, 2011 · NÃO É CSN · COMPARATIVO'),
  (12.8,16.0,'csn_2014',None,'CADA IMAGEM, UMA ORIGEM','editorial_hold','FOTOGRAFIA · CSN · 2014'),
 ]
 shots=[{'start':s,'end':e,'source_id':id,'source_at':at,'headline':title,'grammar':gram,'credit':credit}
        for s,e,id,at,title,gram,credit in raw]
 check_edit_plan(shots)
 return {'version':'v0.42','purpose':'INTERNAL_ONLY','story':'DEMONSTRACAO DE CURADORIA AUTOMATICA MULTIFONTE',
  'shots':shots,'scout_metrics':{'france_candidates':len(france['candidates']),
   'regional_candidates':len(road['candidates']),'selected_film_windows':f,
   'selected_interview_window':r},'publication_approved':False,'voice_embedded':False}

def check_edit_plan(shots):
 if len(shots)<3:raise ValueError('insufficient scene diversity')
 if shots[0]['start']!=0.:raise ValueError('timeline must begin at zero')
 for i,s in enumerate(shots):
  if s['end']<=s['start']:raise ValueError('negative or empty scene')
  if i and abs(s['start']-shots[i-1]['end'])>0.0001:raise ValueError('discontinuous sequence')
  key=s['source_id']
  if key not in SOURCES:raise ValueError('unverified source id')
  if s['source_at'] is not None and SOURCES[key]['genre']=='historical_still':raise ValueError('still with video offset')
  if key=='france_2011' and ('FRANÇA' not in s['credit'] and 'FRANCESA' not in s['credit'] or 'NÃO É CSN' not in s['credit']):
   raise ValueError('French moving media missing visual disclosure')
  if key=='rodovia_2017' and ('RODOVIA' not in s['credit'] or '2017' not in s['credit']):
   raise ValueError('2017 interview cannot masquerade as CSN industrial action')
 return True

if __name__=='__main__':
 import argparse
 p=argparse.ArgumentParser();p.add_argument('--france',type=Path,required=True);p.add_argument('--road',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
 data={'france_2011':analyze_video(a.france,'france_2011',step=2.1,stop=37),
       'rodovia_2017':analyze_video(a.road,'rodovia_2017',step=3.8,start=44,stop=154)}
 result=build_edit_plan(data)
 a.out.parent.mkdir(parents=True,exist_ok=True)
 a.out.write_text(json.dumps({'sources':{k:v['meta'] for k,v in data.items()},'edit_plan':result},indent=2,ensure_ascii=False))
 print('candidate_windows', {k:len(v['candidates']) for k,v in data.items()})
 print('chosen',[(s['source_id'],s['source_at']) for s in result['shots']])
