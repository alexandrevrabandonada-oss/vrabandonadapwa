"""Editorial temporal QA: source truth, genuine aligned words and actual frame motion.
No aesthetic certification; no provider network calls or voice synthesis.
"""
from __future__ import annotations
import argparse,json
from pathlib import Path
import cv2,numpy as np

CUTS=(.92,1.90,4.08,6.16,8.46,9.66,11.56)
ANCHORS=('memória.','Aqui,','em','As','francês.','Nossa','em')
MOTIONS=('collision','accordion','vertical_shutters','oblique_camera',
         'diagonal_reveal','counterpoint','moving_beam','documentary_rest')

def read_words(path):
    data=json.loads(Path(path).read_text(encoding='utf-8'))
    if abs(float(data['duration_sec'])-14.071292517)>.05 or len(data['words'])!=32:
        raise ValueError('Wrong original aligned narration')
    words=[(str(w[0]),float(w[1]),float(w[2])) for w in data['words']]
    if any(end<=start for _,start,end in words):
        raise ValueError('Nonpositive word timestamp')
    return words

def cut_alignment(words):
    table={}
    for word,start,end in words:table.setdefault(word.casefold(),[]).append(start)
    rows=[]
    for cut,word in zip(CUTS,ANCHORS):
        candidates=table.get(word.casefold(),[])
        if not candidates:raise ValueError('Missing semantic anchor '+word)
        start=min(candidates,key=lambda x:abs(x-cut))
        rows.append({'cut_sec':cut,'word':word,'word_start_sec':start,
                     'drift_sec':round(abs(start-cut),4)})
    return rows

def video_dynamics(video):
    cap=cv2.VideoCapture(str(video))
    if not cap.isOpened():raise ValueError('Cannot decode video')
    fps=cap.get(cv2.CAP_PROP_FPS)
    w,h=int(cap.get(3)),int(cap.get(4))
    duration=cap.get(cv2.CAP_PROP_FRAME_COUNT)/fps
    if (w,h)!=(1080,1920) or abs(fps-30)>.1 or abs(duration-14.5)>.12:
        cap.release();raise ValueError('Not a native Full HD 30fps master')
    scenes=[]
    try:
        for i,(start,end) in enumerate(zip((0.,)+CUTS,CUTS+(14.5,))):
            images=[]
            for fraction in (.16,.38,.65,.84):
                t=start+(end-start)*fraction
                cap.set(cv2.CAP_PROP_POS_MSEC,t*1000)
                ok,frame=cap.read()
                if not ok:raise ValueError('Missing frame at '+str(t))
                gray=cv2.cvtColor(frame[235:1390,45:1035],cv2.COLOR_BGR2GRAY)
                images.append(cv2.resize(gray,(198,231)))
            changed=[float(np.mean(cv2.absdiff(a,b)>15)) for a,b in zip(images,images[1:])]
            scenes.append({'shot':i+1,'motion':MOTIONS[i],
                           'changed_fraction_mean':round(float(np.mean(changed)),4),
                           'changed_fraction_min':round(min(changed),4)})
    finally:cap.release()
    return {'width':w,'height':h,'fps':round(fps,3),'duration':round(duration,3),'scenes':scenes}

def audit(video,words_path):
    video=Path(video)
    m=json.loads(video.with_suffix('.json').read_text(encoding='utf-8'))
    if m.get('version')!='v0.37' or m.get('narration_embedded') is not False:
        raise ValueError('Incorrect source or false voice claim')
    if m.get('historical_photo_source_years')!=[1941,1969,2014] or tuple(m.get('choreography',[]))!=MOTIONS:
        raise ValueError('Unverified archival media or movement')
    if m.get('film_source')!='France, 2011 (NOT CSN)':
        raise ValueError('French film incorrectly attributed to CSN')
    cuts=cut_alignment(read_words(words_path))
    if max(item['drift_sec'] for item in cuts)>.11:
        raise ValueError('Semantic cut not synchronized')
    motion=video_dynamics(video)
    if any(s['changed_fraction_mean']<.02 for s in motion['scenes']):
        raise ValueError('Motion missing from internal scenes')
    return {'version':'v0.38','ok':True,'master':video.name,'semantic_cuts':cuts,
            'max_drift_sec':max(x['drift_sec'] for x in cuts),
            'motion':motion,'voice_embedded':False,
            'artistic_grade_certified':False,'human_reviewed':False,
            'published':False}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--video',required=True,type=Path)
    p.add_argument('--words',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    a=p.parse_args();result=audit(a.video,a.words)
    a.out.parent.mkdir(parents=True,exist_ok=True)
    a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'ok':result['ok'],'max_cut_drift_sec':result['max_drift_sec']},
                     ensure_ascii=False))
if __name__=='__main__':main()
