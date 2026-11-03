"""Editorial motion identity contract: no palette-only release passes as kinetic."""
from __future__ import annotations
import json
from pathlib import Path

def inspect(plan:dict)->dict:
    errors=[]
    if plan.get('graphics_fps') not in (12,15,20,24,30):errors.append('invalid graphics cadence')
    if plan.get('documentary_fps')!=30:errors.append('original footage must retain 30-fps master cadence')
    if plan.get('animation_only_editorial_layers') is not True:errors.append('archive source may not be altered as print graphics')
    if plan.get('publication_approved') is not False:errors.append('internal-only identity contract')
    cues=plan.get('cues',[])
    if not isinstance(cues,list) or len(cues)<3:
        errors.append('at least 3 motion cues required');cues=[]
    distinct={c.get('pattern') for c in cues if isinstance(c,dict)}
    if len(distinct)<3:errors.append('motion grammar repetition')
    movement=0
    for index,c in enumerate(cues):
        if not isinstance(c,dict):errors.append(f'cue {index}: bad object');continue
        if c.get('layers',0)<2:errors.append(f'cue {index}: flat single-layer zoom')
        else:movement+=1
        if len(set(c.get('trajectories',[])))<2:errors.append(f'cue {index}: no independent layer trajectories')
        if c.get('narrative_reason','').strip()=='':errors.append(f'cue {index}: lacks narrative reason')
        if c.get('flash_rate_hz',0)>3:errors.append(f'cue {index}: too many flashes')
        if c.get('reduces_original_video_fps') is True:errors.append(f'cue {index}: altered archive timebase')
    return {'ok':not errors,'errors':errors,'distinct_grammars':len(distinct),
            'independent_cues':movement,'palette_only':movement==0,
            'artistic_score':None,'technical_capability_score':None}

def main():
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument('profile',type=Path)
    args=parser.parse_args()
    result=inspect(json.loads(args.profile.read_text(encoding='utf8')))
    print(json.dumps(result,ensure_ascii=False,indent=2))
    if not result['ok']:raise SystemExit(2)

if __name__=='__main__':main()
