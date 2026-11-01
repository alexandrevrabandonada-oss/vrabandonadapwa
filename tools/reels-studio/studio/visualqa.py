"""Conservative frame-level MP4 diagnostics. Measurements ≠ artistic review."""
from __future__ import annotations
import cv2
import numpy as np
from pathlib import Path


def sample_visual_health(media:Path, scenes:list[dict], interval:float=.65, max_samples:int=120)->dict:
    """Decode a bounded number of frames, report black/frozen shots without inventing score."""
    cap=cv2.VideoCapture(str(media))
    if not cap.isOpened():raise ValueError('cannot decode media for visual QA')
    try:
        duration=cap.get(cv2.CAP_PROP_FRAME_COUNT)/max(cap.get(cv2.CAP_PROP_FPS),1)
        timeline=0.0;samples=[];warnings=[]
        for scene in scenes:
            length=float(scene['duration']);start=timeline;timeline+=length
            pts=np.arange(start+min(.15,length*.15), min(timeline-.02,duration), interval)
            pts=pts[:max(0,max_samples-len(samples))]
            sampled=[]
            for pos in pts:
                cap.set(cv2.CAP_PROP_POS_MSEC,float(pos)*1000)
                ok,fr=cap.read()
                if not ok:continue
                # Crop center to discount dark theatrical letterboxing, then resize for bounded cost.
                h,w=fr.shape[:2];chip=cv2.resize(fr[h//10:h-h//10,w//10:w-w//10],(96,160))
                gray=cv2.cvtColor(chip,cv2.COLOR_BGR2GRAY)
                sampled.append({'position':round(float(pos),2),'mean_luma':round(float(gray.mean()),2),
                                'near_black_ratio':round(float((gray<12).mean()),3),'frame':gray})
            if not sampled: warnings.append({'scene':scene.get('id'),'reason':'no decodable frames at sample positions'})
            else:
                if any(q['near_black_ratio']>.98 for q in sampled):
                    warnings.append({'scene':scene.get('id'),'reason':'almost entirely black frame detected (review intentional fades)'})
                diffs=[float(np.abs(b['frame'].astype(np.float32)-a['frame']).mean()) for a,b in zip(sampled,sampled[1:])]
                if scene.get('type') not in ('document',) and len(diffs)>=2 and max(diffs)<.8:
                    warnings.append({'scene':scene.get('id'),'reason':'little detectable motion, consider actual scene activity'})
                samples.append({'scene':scene.get('id'),'frames_examined':len(sampled),
                                'darkest_frame_ratio':round(max(q['near_black_ratio'] for q in sampled),3),
                                'mean_adjacent_difference':round(float(np.mean(diffs)),3) if diffs else None})
            if len(samples)>=max_samples:break
        return {'available':True,'sampled_scenes':len(samples),'scenes':samples,'flags':warnings,
                'interpretation':'Frame diagnostics only; intentional stillness can be artistically valid'}
    finally:cap.release()