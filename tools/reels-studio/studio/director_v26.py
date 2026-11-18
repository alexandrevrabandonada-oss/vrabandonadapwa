"""Aço Gráfico v0.26: word-timed semantic editor, not seven hard-coded scenes.

Inputs: editorial chapters (not shotlists) plus real Scribe word timings.
The moving image shortlist ranks optical movement, not factual authenticity.
No source rights or publication are inferred by any automated step.
"""
from __future__ import annotations
import argparse
import json
import math
import re
import unicodedata
from pathlib import Path
import cv2
import numpy as np

LAYOUT_VOCAB={'photo':['imprint','monument','printer'],
              'film':['furnace','filmstrip'],'both':['collision','resolution']}

def norm(s):
    s=unicodedata.normalize('NFKD',s).casefold()
    return re.sub(r'[^a-z0-9]+',' ',''.join(c for c in s if not unicodedata.combining(c))).strip()

def parse_words(doc):
    raw=doc.get('words',[])
    if not raw:raise ValueError('real timed words required')
    out=[];prev=0.
    for item in raw:
        if isinstance(item,list):
            if len(item)!=3:raise ValueError('word needs text/start/end')
            word,start,end=item
        else:word,start,end=item['text'],item['start'],item['end']
        start=float(start);end=float(end)
        if not word or not all(map(math.isfinite,[start,end])) or start<prev-.03 or end<=start:
            raise ValueError('invalid word timeline')
        out.append({'text':str(word),'start':start,'end':end});prev=end
    if norm(' '.join(w['text'] for w in out))!=norm(doc.get('transcript','')):
        raise ValueError('transcript and word timing disagree')
    if abs(float(doc.get('duration_sec',0))-out[-1]['end'])>.48:
        raise ValueError('audio duration mismatch')
    return out

def validate_brief(brief,words):
    chapters=brief.get('chapters',[])
    if not isinstance(chapters,list) or not 2<=len(chapters)<=20:
        raise ValueError('requires 2..20 editorial chapters')
    ids=set();assembled=[]
    for c in chapters:
        sid=c.get('id')
        if not isinstance(sid,str) or not re.fullmatch('[a-z][a-z0-9_-]{2,35}',sid) or sid in ids:
            raise ValueError('duplicate or unsafe chapter ID')
        ids.add(sid)
        if c.get('source') not in LAYOUT_VOCAB:raise ValueError('unknown source role')
        if not 0<=c.get('energy',.6)<=1:raise ValueError('invalid energy')
        if not c.get('headline') or len(c['headline'])>68:raise ValueError('headline invalid')
        if not c.get('source_credit') or len(c['source_credit'])>95:raise ValueError('source credit invalid')
        assembled.extend(norm(c.get('spoken_text','')).split())
    if assembled!=norm(' '.join(w['text'] for w in words)).split():
        raise ValueError('chapter narration and real word timing disagree')
    if brief.get('publication_approved') is not False:raise ValueError('internal brief required')
    return chapters

def _cut_chapter(words,start,end,count):
    if count<2:return [start,end]
    candidates=[round((a['end']+b['start'])/2,3) for a,b in zip(words,words[1:])]
    cuts=[]
    for n in range(1,count):
        ideal=start+(end-start)*n/count
        valid=[x for x in candidates if x>(cuts[-1] if cuts else start)+.92 and x<end-(count-n)*.92]
        if not valid:break
        cuts.append(min(valid,key=lambda x:abs(x-ideal)))
    return [start]+cuts+[end]

def auto_plan(brief,word_doc,variant='graphic'):
    if variant not in ('graphic','cinema'):raise ValueError('invalid A/B variant')
    words=parse_words(word_doc);chapters=validate_brief(brief,words)
    duration=round(float(word_doc['duration_sec'])+float(brief.get('end_padding_sec',.429)),3)
    if not words[-1]['end']<duration<=words[-1]['end']+1.2:raise ValueError('invalid padding')
    parts=[];cursor=0
    for c in chapters:
        n=len(norm(c['spoken_text']).split());ws=words[cursor:cursor+n]
        if len(ws)!=n:raise ValueError('chapter exceeds actual words')
        parts.append((c,ws));cursor+=n
    starts=[0.]+[round((a[-1]['end']+b[0]['start'])/2,3) for (ca,a),(cb,b) in zip(parts,parts[1:])]
    starts.append(duration)
    shots=[];prior=None
    for i,((c,ws),start,end) in enumerate(zip(parts,starts[:-1],starts[1:])):
        energy=float(c.get('energy',.6))
        target=(2.65 if variant=='graphic' else 3.15)-.38*energy
        count=min(4,max(1,round((end-start)/target)))
        while count>1 and (end-start)/count<1.08:count-=1
        edges=_cut_chapter(ws,start,end,count)
        vocab=LAYOUT_VOCAB[c['source']][:]
        if variant=='cinema':
            if c['source']=='film':vocab.reverse()
            if c['source']=='photo':vocab=['printer','monument','imprint']
        for j,(a,b) in enumerate(zip(edges,edges[1:])):
            choices=[vocab[(j+i+k)%len(vocab)] for k in range(len(vocab))]
            grammar=next((s for s in choices if s!=prior),choices[0]);prior=grammar
            shots.append({'index':len(shots),'chapter_id':c['id'],'start':round(a,3),
                'end':round(b,3),'source':c['source'],'layout':grammar,
                'headline':c['headline'],'eyebrow':c.get('eyebrow','ARQUIVO / CONTEXTO'),
                'credit':c['source_credit'],'energy':energy,'source_window_start':None})
    if not shots or abs(shots[0]['start'])>.001 or abs(shots[-1]['end']-duration)>.001:
        raise ValueError('incomplete timeline')
    if any(abs(a['end']-b['start'])>.001 for a,b in zip(shots,shots[1:])):
        raise ValueError('gaps in timeline')
    return {'version':'v0.26','variant':variant,'duration_sec':duration,
        'chapters':len(chapters),'shots':shots,'shot_count':len(shots),
        'word_count':len(words),'source_role_sequence':[s['source'] for s in shots],
        'voice_embedded':False,'publication_approved':False,
        'artistic_score':None,'human_quality_review':False}

def scan_motion_windows(source,window_sec=2.8,step_sec=2.6,max_samples=28):
    cap=cv2.VideoCapture(str(source))
    if not cap.isOpened():raise ValueError('video not decodable')
    fps=cap.get(cv2.CAP_PROP_FPS);frames=cap.get(cv2.CAP_PROP_FRAME_COUNT)
    if fps<=0 or frames<=0:raise ValueError('unreadable timebase')
    duration=frames/fps
    def sample(t):
        cap.set(cv2.CAP_PROP_POS_MSEC,t*1000)
        ok,im=cap.read()
        return cv2.cvtColor(cv2.resize(im,(320,180)),cv2.COLOR_BGR2GRAY) if ok else None
    result=[]
    try:
        for i in range(min(max_samples,max(0,int((duration-window_sec)/step_sec)+1))):
            start=i*step_sec;diff=[];light=[]
            for offset in (.3,1.25,2.15):
                a=sample(start+offset);b=sample(start+offset+.2)
                if a is None or b is None:continue
                diff.append(float(cv2.absdiff(a,b).mean()));light.append(float(a.mean()))
            if len(diff)<2:continue
            result.append({'start':round(start,2),'end':round(start+window_sec,2),
                'median_frame_change':round(float(np.median(diff)),3),
                'median_brightness':round(float(np.median(light)),2)})
    finally:cap.release()
    return {'duration':round(duration,3),'windows':result,'screened_for_actual_event':False,
        'note':'Flicker, edits and camera movement can produce false action candidates.'}

def schedule_source_windows(plan,motion,minimum_gap=4.):
    shots=[s for s in plan['shots'] if s['source'] in ('film','both')]
    if not shots:return {'scheduled_video_shots':0,'different_windows':0,
        'verified_human_action':False,'publication_approved':False}
    pool=[]
    for x in motion['windows']:
        v=x['median_frame_change'];score=v-max(0,v-30)*2.8
        if not 20<=x['median_brightness']<=240:score-=6
        pool.append((score,x))
    pool.sort(key=lambda t:-t[0]);chosen=[]
    for _,x in pool:
        if all(abs(x['start']-y['start'])>=minimum_gap for y in chosen):chosen.append(x)
        if len(chosen)==len(shots):break
    if len(chosen)<len(shots):
        for _,x in pool:
            if x['start'] not in [y['start'] for y in chosen]:chosen.append(x)
            if len(chosen)==len(shots):break
    if len(chosen)<len(shots):raise ValueError('too few independent source windows')
    chosen.sort(key=lambda x:x['start'])
    for shot,x in zip(shots,chosen):
        shot['source_window_start']=x['start']
        shot['source_window_score']=x['median_frame_change']
    return {'scheduled_video_shots':len(shots),'different_windows':len(chosen),
        'chronological_source_order':True,'verified_human_action':False,'publication_approved':False}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--brief',required=True,type=Path)
    p.add_argument('--words',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--film',type=Path)
    p.add_argument('--variant',choices=('graphic','cinema'),default='graphic')
    a=p.parse_args()
    d=auto_plan(json.loads(a.brief.read_text(encoding='utf8')),
                json.loads(a.words.read_text(encoding='utf8')),a.variant)
    if a.film:
        motion=scan_motion_windows(a.film)
        d['motion_analysis']=motion
        d['window_schedule']=schedule_source_windows(d,motion)
    a.out.parent.mkdir(parents=True,exist_ok=True)
    a.out.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'shots':d['shot_count'],'seconds':d['duration_sec'],
                      'windows':d.get('window_schedule')},ensure_ascii=False))

if __name__=='__main__':main()
