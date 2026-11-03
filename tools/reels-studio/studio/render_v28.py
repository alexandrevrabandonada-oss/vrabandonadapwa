"""V28 dedicated image-forward design shim over tested v26 source/audio backend."""
from __future__ import annotations
import argparse,json,sys
from pathlib import Path
from . import director_v26 as d26
# Compatibility for the v26 renderer's historical top-level layout import.
sys.modules.setdefault("director_v26",d26)
from . import render_v26 as prior
from . import art_director_v28 as visual
from .director_v26 import auto_plan,scan_motion_windows,schedule_source_windows


def render(plan,photo,video,words,out,voice=None):
    by_beat={(round(s['start'],3),round(s['end'],3)):s for s in plan['shots']}
    def stage(photo_frame,moving_frame,beat,p,_style='zine'):
        shot=by_beat.get((round(beat.start,3),round(beat.end,3)))
        if shot is None:raise ValueError('undocumented shot timing')
        return visual.image_stage(photo_frame,moving_frame,shot,p,plan['variant'])
    def paint(base,shot,t,p,index,total,cues,variant):
        return visual.overlay(base,shot,t,p,index,total,cues,variant,voice_embedded=bool(voice))
    saved_stage=prior.old.scene_background
    saved_overlay=prior.graphic_overlay
    try:
        prior.old.scene_background=stage
        prior.graphic_overlay=paint
        report=prior.render(plan,photo,video,words,out,voice)
    finally:
        prior.old.scene_background=saved_stage
        prior.graphic_overlay=saved_overlay
    report.update({'visual_engine':'ARANHAVERSO_BRUTALISTA_V28',
                   'source_occupancy_priority':'IMAGE_FIRST',
                   'headlines_retreat_after_sec':.62,
                   'voice_embedded':bool(voice),
                   'artistic_score':None,
                   'human_review_completed':False})
    return report


def main():
    p=argparse.ArgumentParser()
    for arg in ('photo','film','words','brief','out'):
        p.add_argument('--'+arg,type=Path,required=True)
    p.add_argument('--variant',choices=('graphic','cinema'),default='graphic')
    p.add_argument('--voice',type=Path)
    a=p.parse_args()
    plan=auto_plan(json.loads(a.brief.read_text(encoding='utf8')),
                   json.loads(a.words.read_text(encoding='utf8')),a.variant)
    scan=scan_motion_windows(a.film)
    plan['motion_analysis']=scan
    plan['window_schedule']=schedule_source_windows(plan,scan)
    info=render(plan,a.photo,a.film,a.words,a.out,a.voice)
    prior.contact(a.out,plan,a.out.with_suffix('.jpg'))
    info['plan']=plan
    info['contact']=str(a.out.with_suffix('.jpg'))
    a.out.with_suffix('.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'video':str(a.out),'shots':len(plan['shots']),
                      'engine':info['visual_engine'],'voice_embedded':info['voice_embedded']},ensure_ascii=False))

if __name__=='__main__':main()

