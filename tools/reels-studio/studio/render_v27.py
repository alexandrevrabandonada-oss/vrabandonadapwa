"""V27 adapter: keep v26 deterministic media pipeline; replace only art direction.

Avoids duplicating the 24fps source integrity, FFmpeg mix, QA and timebase engine.
The scene-map closure is per render invocation; no global painter state is persisted.
"""
from __future__ import annotations
import argparse, json
from pathlib import Path
try:
    from . import render_v26 as prior
    from . import kinetic_editor_v27 as visual
    from .director_v26 import auto_plan,scan_motion_windows,schedule_source_windows
except ImportError:
    import render_v26 as prior
    import kinetic_editor_v27 as visual
    from director_v26 import auto_plan,scan_motion_windows,schedule_source_windows


def render(plan,photo:Path,video:Path,words:Path,out:Path,voice=None):
    """Per-shot visual change, identical evidence/audio behavior to prior render."""
    lookup={(round(s['start'],3),round(s['end'],3)):s for s in plan['shots']}
    def stage(photo_frame,film_frame,beat,p,_variant='zine'):
        k=(round(beat.start,3),round(beat.end,3))
        shot=lookup.get(k)
        if shot is None:raise ValueError('render beat absent in generated shot plan')
        return visual._visible_photo(photo_frame,film_frame,shot,p)
    backend=prior.core if hasattr(prior,'core') else prior.old
    prev_stage=backend.scene_background
    prev_overlay=prior.graphic_overlay
    try:
        backend.scene_background=stage
        prior.graphic_overlay=visual._draw_overlay
        report=prior.render(plan,photo,video,words,out,voice)
    finally:
        backend.scene_background=prev_stage
        prior.graphic_overlay=prev_overlay
    report['visual_engine']='ARANHAVERSO_BRUTALISTA_V27'
    report['image_forward_presets']={s['index']:visual.composition_for(s) for s in plan['shots']}
    report['autonomous_artistic_certification']=False
    return report


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--photo',type=Path,required=True)
    p.add_argument('--film',type=Path,required=True)
    p.add_argument('--words',type=Path,required=True)
    p.add_argument('--brief',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--variant',choices=('graphic','cinema'),default='graphic')
    p.add_argument('--voice',type=Path)
    args=p.parse_args()
    plan=auto_plan(json.loads(args.brief.read_text(encoding='utf8')),
                   json.loads(args.words.read_text(encoding='utf8')),args.variant)
    motion=scan_motion_windows(args.film)
    plan['motion_analysis']=motion
    plan['window_schedule']=schedule_source_windows(plan,motion)
    report=render(plan,args.photo,args.film,args.words,args.out,args.voice)
    report['plan']=plan
    prior.contact(args.out,plan,args.out.with_suffix('.jpg'))
    report['contact']=str(args.out.with_suffix('.jpg'))
    args.out.with_suffix('.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'video':str(args.out),'shots':len(plan['shots']),
                      'voice_embedded':report['voice_embedded'],'duration':report['duration'],
                      'visual_engine':report['visual_engine']},ensure_ascii=False))

if __name__=='__main__':main()

