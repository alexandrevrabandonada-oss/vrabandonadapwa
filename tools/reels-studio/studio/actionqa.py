"""Assess source footage motion AFTER removing global camera translation.

This is a heuristic for spotting scene-level action. Camera zoom and motion
within a photograph must not count as evidence of recorded action.
"""
from __future__ import annotations
from pathlib import Path
import cv2
import numpy as np


def motion_between(first: np.ndarray, second: np.ndarray) -> dict:
    if first.shape != second.shape or first.ndim != 3:
        raise ValueError('need two same-size BGR frames')
    if min(first.shape[:2]) < 32:
        raise ValueError('frames too small')
    h,w=first.shape[:2];sf=min(1,288/max(h,w))
    size=(max(32,int(round(w*sf))),max(32,int(round(h*sf))))
    a=cv2.cvtColor(cv2.resize(first,size),cv2.COLOR_BGR2GRAY)
    b=cv2.cvtColor(cv2.resize(second,size),cv2.COLOR_BGR2GRAY)
    flow=cv2.calcOpticalFlowFarneback(a,b,None,.5,3,15,3,5,1.2,0)
    median=np.median(flow.reshape(-1,2),axis=0)
    residual=np.linalg.norm(flow-median,axis=2)
    # Whole scene global panning is discounted; localized movement remains.
    return {'local_motion_p95_px':round(float(np.percentile(residual,95)),3),
            'local_motion_share':round(float(np.mean(residual>.75)),3),
            'camera_motion_px':round(float(np.linalg.norm(median)),3),
            'motion_method':'Farneback median-flow-compensated, downsampled, heuristic'}


def inspect_clip(path:Path, start_sec:float=0, samples:int=7, interval_sec:float=.30)->dict:
    if not path.is_file():raise FileNotFoundError(path)
    cap=cv2.VideoCapture(str(path))
    if not cap.isOpened():raise ValueError('invalid video')
    fps=cap.get(cv2.CAP_PROP_FPS)
    duration=cap.get(cv2.CAP_PROP_FRAME_COUNT)/fps if fps>0 else 0
    if duration < start_sec+interval_sec:cap.release();raise ValueError('clip too short')
    measures=[]
    try:
        for i in range(samples):
            t=start_sec+i*interval_sec
            if t+interval_sec>=duration:break
            cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,first=cap.read()
            cap.set(cv2.CAP_PROP_POS_MSEC,(t+interval_sec)*1000);ok2,second=cap.read()
            if not (ok and ok2):raise ValueError('failed to decode video frame')
            measures.append(motion_between(first,second))
    finally:cap.release()
    p95=float(np.median([m['local_motion_p95_px'] for m in measures])) if measures else 0
    share=float(np.median([m['local_motion_share'] for m in measures])) if measures else 0
    return {'duration_sec':round(duration,3),'analyzed_pairs':len(measures),
       'local_motion_p95_median':round(p95,3),'local_motion_share_median':round(share,3),
       'has_substantial_local_action':bool(p95>1.3 and share>.05),
       'status':'HEURISTIC_REQUIRES_HUMAN_INSPECTION',
       'note':'Cannot distinguish genuine footage from synthetic animation; check provenance separately.'}