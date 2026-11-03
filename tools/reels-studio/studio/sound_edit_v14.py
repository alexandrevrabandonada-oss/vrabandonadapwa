"""Audio-led EDL: global pause matching, frame-accurate boundaries; not word sync."""
from __future__ import annotations
import math
from functools import lru_cache
import numpy as np

def compile_edl(pauses:dict,scenes:list[dict],fps:int=24,tolerance:float=1.75,min_shot:float=.8)->dict:
    if fps not in (18,20,24,25,30,50,60):raise ValueError('unsupported fps')
    total=float(pauses['duration_sec'])
    if not math.isfinite(total) or total<=0 or not scenes:raise ValueError('bad duration/scenes')
    weights=[float(s['duration']) for s in scenes]
    if any(not math.isfinite(x) or x<=0 for x in weights) or total<len(scenes)*min_shot:
        raise ValueError('insufficient time for shots')
    frames=round(total*fps);minframes=math.ceil(min_shot*fps)
    targets=[round(float(v)*frames/sum(weights)) for v in np.cumsum(weights)[:-1]]
    pools={}
    for i,goal in enumerate(targets):
        low=minframes*(i+1);high=frames-minframes*(len(scenes)-i-1)
        options=[(max(low,min(high,goal)),'fallback',0.)]
        for candidate in pauses.get('candidate_pauses',[]):
            f=round(float(candidate['second'])*fps)
            if low<=f<=high and abs(f-goal)<=tolerance*fps:
                options.append((f,'pause',min(1.,float(candidate.get('confidence',0)))))
        options_by_frame={}
        for opt in options:
            if opt[0] not in options_by_frame or opt[1]=='pause':options_by_frame[opt[0]]=opt
        pools[i]=tuple(options_by_frame.values())
    @lru_cache(None)
    def solve(i,last):
        if i==len(targets):return 0.,()
        best=float('inf'),()
        for frame,kind,confidence in pools[i]:
            if frame-last<minframes:continue
            rest,path=solve(i+1,frame)
            deviation=abs(frame-targets[i])/fps
            score=(deviation/max(.1,tolerance))**2+(1.7 if kind=='fallback' else .12*(1-confidence))+rest
            if score<best[0]:best=(score,((frame,kind),)+path)
        return best
    cost,solution=solve(0,0)
    if not math.isfinite(cost):raise ValueError('no valid edit solution')
    points=[0]+[p[0] for p in solution]+[frames]
    shots=[]
    for i,scene in enumerate(scenes):
        src='recording_end' if i==len(scenes)-1 else ('acoustic_pause' if solution[i][1]=='pause' else 'duration_fallback_NOT_AUDIO_SYNC')
        shots.append({'scene_id':scene['id'],'first_frame':points[i],'last_frame_exclusive':points[i+1],
           'start_sec':round(points[i]/fps,5),'end_sec':round(points[i+1]/fps,5),
           'duration_sec':round((points[i+1]-points[i])/fps,5),'source':src,'human_approved':False})
    assert all(a['last_frame_exclusive']==b['first_frame'] for a,b in zip(shots,shots[1:]))
    return {'fps':fps,'frame_count':frames,'video_duration_sec':round(frames/fps,5),
      'audio_duration_sec':total,'duration_difference_sec':round(frames/fps-total,5),
      'shots':shots,'cuts_on_pauses':sum(s['source']=='acoustic_pause' for s in shots),
      'status':'AUDIO_LED_LAB_PROPOSAL_NOT_WORD_SYNCED','publication_allowed':False,
      'source_originals_unchanged':True,'approver':None}
