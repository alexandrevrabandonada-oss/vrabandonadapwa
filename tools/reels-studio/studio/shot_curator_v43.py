"""V0.43: explainable motion-first editing from verified, role-labelled media.

This is *not* visual scene understanding. User/editor asserts a source's topic,
origin and possible roles. The engine measures only sharpness, motion, scene-cut
risk, exposure and visual redundancy; role mismatch is a hard error. Existing
video bytes and archive photos remain unchanged in the private lab.
"""
from __future__ import annotations
import argparse, copy, json, math, subprocess, time
from pathlib import Path
import cv2
import numpy as np
from . import shot_scout_v42 as prior

PACE = {
    # Lower peak motion reduces jump-cut, flash and camera-whip preference.
    'cinematic': {'interview': 0.047, 'industrial_action': 0.115},
    'documental': {'interview': 0.027, 'industrial_action': 0.060},
}
ROLE_SAFETY = {
    'rodovia_2017': ('regional_news_interview', 'interview'),
    'france_2011': ('industrial_context', 'industrial_action'),
}

def _grayscale(cap, at_sec, size=(240, 135)):
    cap.set(cv2.CAP_PROP_POS_MSEC, round(float(at_sec) * 1000))
    ok, frame = cap.read()
    if not ok: return None
    return cv2.cvtColor(cv2.resize(frame, size), cv2.COLOR_BGR2GRAY)

def _dhash(gray):
    x = cv2.resize(gray, (9, 8), interpolation=cv2.INTER_AREA)
    return ''.join(str(int(v)) for v in (x[:, 1:] > x[:, :-1]).ravel())

def _finite01(x):
    return float(max(0, min(1, x)))

def _metrics(frames):
    a, b, c = [f.astype(np.float32) for f in frames]
    # Analyze center rather than broadcaster frame borders or logos.
    clip = lambda x: x[12:-12, 16:-16]
    a, b, c = clip(a), clip(b), clip(c)
    delta1 = float(np.abs(b-a).mean()/255)
    delta2 = float(np.abs(c-b).mean()/255)
    motion = (delta1+delta2)*.5
    continuity_penalty = abs(delta1-delta2)/(delta1+delta2+1e-7)
    sharpness = float(cv2.Laplacian(b.astype('uint8'), cv2.CV_64F).var())
    # Smooth saturating scale, useful across news and archive resolutions.
    sharpness_quality = _finite01(math.log1p(sharpness)/math.log1p(1100))
    brightness = float(b.mean()/255)
    near_black = float((b < 12).mean())
    near_white = float((b > 245).mean())
    exposure_quality = _finite01(1-abs(brightness-.5)*1.2-near_black*.4-near_white*.4)
    return dict(motion=round(motion, 5), cut_risk=round(continuity_penalty, 5),
                sharpness=round(sharpness, 1), sharpness_quality=round(sharpness_quality, 4),
                exposure_quality=round(exposure_quality, 4),
                brightness=round(brightness, 4), near_black=round(near_black, 4),
                near_white=round(near_white, 4))

def scan(path: Path, source_id: str, *, start=1.0, stop=None, step=2.0,
         shot_duration=2.7):
    """Samples actual original footage for whole usable windows.

    A candidate is valid only if a whole scene-length interval fits.
    """
    if source_id not in ROLE_SAFETY: raise ValueError('source not registered as a source video')
    if shot_duration <= 1.0 or step <= 0 or start < 0:raise ValueError('invalid scout geometry')
    metadata=prior.verify_media(source_id,path)
    if (metadata['role'],metadata['genre'])!=ROLE_SAFETY[source_id]:
        raise ValueError('editorial role mismatch')
    cap=cv2.VideoCapture(str(path))
    if not cap.isOpened():raise ValueError('unreadable original footage')
    fps=cap.get(cv2.CAP_PROP_FPS)
    duration=cap.get(cv2.CAP_PROP_FRAME_COUNT)/max(1.,fps)
    cap.release()
    max_start=duration-shot_duration-0.15
    limit=min(float(stop) if stop is not None else max_start,max_start)
    if limit < start:raise ValueError('source is too short for a complete shot')
    # Decode the whole low-resolution strip in ONE FFmpeg pass. Random seeking
    # dozens of times is prohibitively slow on keyframe-sparse WebM reports.
    sampling_fps=5
    span=limit-start+shot_duration+.10
    command=['ffmpeg','-hide_banner','-loglevel','error','-ss',str(start),
             '-i',str(path),'-t',str(span),'-an','-vf',
             f'fps={sampling_fps},scale=240:135,format=gray',
             '-f','rawvideo','-pix_fmt','gray','pipe:1']
    completed=subprocess.run(command,capture_output=True,timeout=120)
    if completed.returncode:
        raise ValueError('source scan failed: '+completed.stderr.decode(errors='replace')[-200:])
    bytes_per_frame=240*135
    n=len(completed.stdout)//bytes_per_frame
    if n<15:raise ValueError('source scan decoded too few frames')
    video=np.frombuffer(completed.stdout[:n*bytes_per_frame],np.uint8).reshape(n,135,240)
    def approximate(t):
        idx=int(round((t-start)*sampling_fps))
        return video[min(max(idx,0),n-1)]
    rows=[]
    for at in np.arange(start,limit+.001,step):
        stamps=(at+.12,at+shot_duration*.40,at+shot_duration*.83)
        imgs=[approximate(t) for t in stamps]
        features=_metrics(imgs)
        features.update(source_id=source_id, at_sec=round(float(at),2),
                        duration=round(float(shot_duration),2),
                        hash64=_dhash(imgs[1]), role=metadata['role'],
                        origin=metadata['origin'])
        rows.append(features)
    if not rows:raise ValueError('source contains no decodable full-length windows')
    return {'source':metadata,'duration':round(duration,3),'candidates':rows,
            'parameters':{'start':start,'stop':limit,'step':step,'shot_duration':shot_duration}}

def score(item, role, pace):
    if pace not in PACE:raise ValueError('invalid pace')
    if role not in ('interview','industrial_action'):raise ValueError('invalid role')
    required = ('motion','cut_risk','sharpness_quality','exposure_quality')
    if any(k not in item or not isinstance(item[k],(float,int)) or not math.isfinite(item[k]) for k in required):
        raise ValueError('candidate is missing valid visual measurements')
    target=PACE[pace][role]
    # Broad motion sweet spot, not fastest-shot-wins; other axes independent.
    pace_score=math.exp(-abs(float(item['motion'])-target)/max(.013,target*.9))
    steady=1-_finite01(item['cut_risk'])
    quality=(.37*pace_score+.23*_finite01(item['sharpness_quality'])+
             .22*_finite01(item['exposure_quality'])+.18*steady)
    return round(quality,5)

def rank(report, *, role, pace, count, min_gap=3.5, min_hash_distance=6):
    if report.get('source',{}).get('genre')!=role:
        raise ValueError('source genre does not match editorial role')
    if count<1 or min_gap<0:raise ValueError('invalid shot count or distance')
    rows=[]
    for item in report['candidates']:
        if item['source_id']!=report['source']['id']:
            raise ValueError('candidate source spoofing')
        row=dict(item);row['editor_score']=score(item,role,pace);rows.append(row)
    rows.sort(key=lambda x:(-x['editor_score'],x['at_sec']))
    selected=[];rejected=[]
    for row in rows:
        issue=None
        for accepted in selected:
            if abs(row['at_sec']-accepted['at_sec'])<min_gap:
                issue='temporal_overlap';break
            if prior.hamming(row['hash64'],accepted['hash64'])<min_hash_distance:
                issue='near_duplicate';break
        if issue:rejected.append({'at_sec':row['at_sec'],'reason':issue,'score':row['editor_score']});continue
        if len(selected)<count:selected.append(row)
        else:rejected.append({'at_sec':row['at_sec'],'reason':'outside_editing_budget','score':row['editor_score']})
    if len(selected)!=count:raise ValueError('insufficient distinct source windows')
    return {'selected':selected,'alternatives':rejected,'inventory':rows,
            'role':role,'pace':pace,'ranking_is_visual_not_semantic':True}

def visual_cluster_report(report, *, max_hash_distance=7):
    """Greedy reproducible dHash grouping; no semantic classification claim.

    Use to warn about visually repetitive reports even if timecodes differ.
    """
    rows=report['candidates']
    if not rows:raise ValueError('no candidates available for clustering')
    clusters=[]
    for row in rows:
        if row.get('source_id')!=report['source']['id']:
            raise ValueError('candidate source spoofing')
        if len(row.get('hash64',''))!=64:raise ValueError('invalid visual fingerprint')
        for cluster in clusters:
            if prior.hamming(row['hash64'],cluster[0]['hash64'])<=max_hash_distance:
                cluster.append(row);break
        else:clusters.append([row])
    largest=max(map(len,clusters))
    return {'candidates':len(rows),'visual_clusters':len(clusters),
            'largest_cluster':largest,
            'largest_cluster_fraction':round(largest/len(rows),4),
            'repetitive_source_warning':largest/len(rows)>.60,
            'method':'greedy_dhash_hamming_le_7',
            'interpretation':'Visual redundancy only; does not identify people or events'}

def revise_v42_plan(original_plan, industrial, broadcast, *, pace='cinematic'):
    """Keeps original story and source disclosures; replaces only source offsets.

    This method does not invent a different news story or rewrite source roles.
    """
    if pace not in PACE: raise ValueError('invalid pace')
    plan=copy.deepcopy(original_plan)
    data=plan['edit_plan'] if 'edit_plan' in plan else plan
    shots=data['shots']
    prior.check_edit_plan(shots)
    if [(s['source_id'],s['grammar']) for s in shots[2:5]] != [
        ('rodovia_2017','news_window'),('france_2011','industrial_split'),('france_2011','industrial_rail')]:
        raise ValueError('unexpected narrative/source roles, refusing automatic overwrite')
    choose_interview=rank(broadcast,role='interview',pace=pace,count=1)
    choose_industry=rank(industrial,role='industrial_action',pace=pace,count=2,min_gap=5)
    shots[2]['source_at']=choose_interview['selected'][0]['at_sec']
    shots[3]['source_at']=choose_industry['selected'][0]['at_sec']
    shots[4]['source_at']=choose_industry['selected'][1]['at_sec']
    # QA must be able to identify the video frame source for every scene.
    prior.check_edit_plan(shots)
    data['version']='v0.43'
    data['scout_metrics']={'version':'v0.43','selector':'quality_pace_diversity_v43',
       'pace':pace,'industry':choose_industry,'interview':choose_interview}
    data['visual_diversity_diagnostics']={'industry':visual_cluster_report(industrial),
                                      'interview':visual_cluster_report(broadcast)}
    data['publication_approved']=False
    data['voice_embedded']=False
    data['requires_human_semantic_review']=True
    return plan

def contact(report, ranking, path:Path, *, source_path:Path, rows=4, columns=4):
    """Contact board from actual source frames via one efficient FFmpeg decode."""
    selected={x['at_sec'] for x in ranking['selected']}
    all_rows=sorted(report['candidates'],key=lambda x:score(x,report['source']['genre'],ranking['pace']),reverse=True)
    shown=all_rows[:rows*columns]
    start=min(x['at_sec'] for x in shown)
    stop=max(x['at_sec']+x['duration']*.40 for x in shown)+.6
    fps=2;w,h=320,183
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-ss',str(start),'-i',str(source_path),
         '-t',str(stop-start),'-an','-vf',f'fps={fps},scale={w}:{h},format=bgr24',
         '-f','rawvideo','-pix_fmt','bgr24','pipe:1']
    completed=subprocess.run(cmd,capture_output=True,timeout=120)
    if completed.returncode:raise ValueError('contact source decode failed')
    bytes_per_frame=w*h*3;n=len(completed.stdout)//bytes_per_frame
    if n<2:raise ValueError('contact source has no frames')
    video=np.frombuffer(completed.stdout[:n*bytes_per_frame],np.uint8).reshape(n,h,w,3)
    sheet=np.full((rows*225,columns*320,3),26,dtype=np.uint8)
    for i,item in enumerate(shown):
        idx=min(n-1,max(0,round((item['at_sec']+item['duration']*.40-start)*fps)))
        thumb=video[idx]
        x=i%columns*320;y=i//columns*225
        sheet[y:y+183,x:x+320]=thumb
        cv2.rectangle(sheet,(x,y+183),(x+319,y+224),(9,12,22),-1)
        scoreval=score(item,report['source']['genre'],ranking['pace'])
        flag='SELECT' if item['at_sec'] in selected else 'ALT'
        cv2.putText(sheet,f'{flag} t={item["at_sec"]:.1f}s score={scoreval:.3f}',(x+7,y+201),cv2.FONT_HERSHEY_SIMPLEX,.46,(120,255,255) if flag=='SELECT' else (235,235,235),1,cv2.LINE_AA)
        cv2.putText(sheet,f'mot={item["motion"]:.3f} cut={item["cut_risk"]:.2f} focus={item["sharpness_quality"]:.2f}',(x+7,y+218),cv2.FONT_HERSHEY_SIMPLEX,.39,(205,205,205),1,cv2.LINE_AA)
    path.parent.mkdir(parents=True,exist_ok=True)
    if not cv2.imwrite(str(path),sheet):raise ValueError('cannot write evidence contact sheet')
    return path

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--france',required=True,type=Path)
    p.add_argument('--road',required=True,type=Path)
    p.add_argument('--baseline',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--pace',choices=tuple(PACE),default='cinematic')
    p.add_argument('--contact-dir',type=Path)
    a=p.parse_args()
    industrial=scan(a.france,'france_2011',start=1,stop=34,step=1.5,shot_duration=2.6)
    broadcast=scan(a.road,'rodovia_2017',start=44,stop=154,step=3.,shot_duration=2.6)
    baseline=json.loads(a.baseline.read_text())
    plan=revise_v42_plan(baseline,industrial,broadcast,pace=a.pace)
    a.out.parent.mkdir(parents=True,exist_ok=True)
    a.out.write_text(json.dumps(plan,ensure_ascii=False,indent=2))
    if a.contact_dir:
        contact(industrial,rank(industrial,role='industrial_action',pace=a.pace,count=2,min_gap=5),a.contact_dir/'INDUSTRIA.jpg',source_path=a.france)
        contact(broadcast,rank(broadcast,role='interview',pace=a.pace,count=1),a.contact_dir/'TELEJORNAL.jpg',source_path=a.road)
    old=baseline['edit_plan']['shots']
    new=plan['edit_plan']['shots']
    print(json.dumps({'pace':a.pace,'source_offsets_before':[(s['source_id'],s['source_at']) for s in old if s['source_at'] is not None],
        'source_offsets_after':[(s['source_id'],s['source_at']) for s in new if s['source_at'] is not None]},ensure_ascii=False))
if __name__=='__main__':main()