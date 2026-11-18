"""Source-native kinetic QA gate; tests movement, not aesthetic merit.

V35 intentionally separates technical evidence from creative scores. Never infer
speaker identity, rights, audience retention or artistic quality from this gate.
"""
from __future__ import annotations
import json
from pathlib import Path
import cv2
import numpy as np

SHOT_BOUNDS = ((0.,.92),(.92,1.9),(1.9,4.08),(4.08,6.16),
               (6.16,8.46),(8.46,9.66),(9.66,11.56),(11.56,14.5))
CHOREOGRAPHY = ("collision","accordion","vertical_shutters","oblique_camera",
                "diagonal_reveal","counterpoint","moving_beam","documentary_rest")
FRANCE_ORIGINAL_SHA1 = "c1129cac8654866856c7bec31196206f16eac6c7"

def validate_identity(manifest: dict) -> None:
    if manifest.get("real_film_sha1") != FRANCE_ORIGINAL_SHA1:
        raise ValueError("Original French video hash missing")
    if manifest.get("choreography") != list(CHOREOGRAPHY):
        raise ValueError("Motion grammar not actually varied")
    if manifest.get("narration_embedded") is not False:
        raise ValueError("Do not claim unverified speech")
    if manifest.get("publication_approved") is not False:
        raise ValueError("Private rehearsal cannot be published")
    if manifest.get("historical_photo_source_years") != [1941,1969,2014]:
        raise ValueError("Historical sequence changed")

def change_fraction(a, b, threshold: float = 12.) -> float:
    if a is None or b is None or a.shape != b.shape:
        raise ValueError("Frames missing/mismatched")
    if not 0 < threshold < 255:
        raise ValueError("Bad threshold")
    if a.ndim != 3 or a.shape[2] != 3:
        raise ValueError("BGR images required")
    ga=cv2.cvtColor(cv2.resize(a,(144,174)),cv2.COLOR_BGR2GRAY)
    gb=cv2.cvtColor(cv2.resize(b,(144,174)),cv2.COLOR_BGR2GRAY)
    return float(np.mean(np.abs(ga.astype(np.float32)-gb.astype(np.float32))>threshold))

def scan(path: Path, threshold=.07):
    video=cv2.VideoCapture(str(path))
    if not video.isOpened(): raise ValueError("Cannot open MP4")
    fractions=[]
    try:
        for start,end in SHOT_BOUNDS:
            t0=start+.17*(end-start)
            t1=start+.73*(end-start)
            video.set(cv2.CAP_PROP_POS_MSEC,1000*t0);ok1,a=video.read()
            video.set(cv2.CAP_PROP_POS_MSEC,1000*t1);ok2,b=video.read()
            if not ok1 or not ok2:raise ValueError("Missing scene frame")
            fractions.append(round(change_fraction(a[270:1500],b[270:1500]),4))
    finally:
        video.release()
    return {"all_eight_checked":len(fractions)==8,
            "fraction_by_scene":fractions,
            "dynamic_scenes":sum(x>threshold for x in fractions),
            "min_fraction":min(fractions),
            "mean_fraction":round(float(np.mean(fractions)),4),
            "is_artistic_certification":False}

def main():
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("--video",type=Path,required=True)
    p.add_argument("--manifest",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    a=p.parse_args()
    manifest=json.loads(a.manifest.read_text(encoding="utf-8"))
    validate_identity(manifest)
    report=scan(a.video)
    a.out.write_text(json.dumps(report,indent=2),encoding="utf-8")
    if report["dynamic_scenes"]<6: raise SystemExit("Too few genuinely animated scenes")
if __name__=="__main__": main()
