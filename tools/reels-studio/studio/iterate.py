"""Quality iteration planner and safe deterministic camera variants.
Maintains evidence, images, captions and rights intact while testing motion direction.
"""
from __future__ import annotations
import copy
from .factory import scorecard

IMPROVEMENTS={
  'life': {'action':'Replace passive archival pans with scene action: verifiable archival footage, foreground interactions and motivated cuts.',
           'acceptance':'At least two shots with action visible in source footage or explicitly labelled illustrations; no invented activity.'},
  'art_direction':{'action':'Build a shot-specific art board (color script, depth plan, focal subject, lighting) before rendering.',
                   'acceptance':'Every shot has a visual purpose and unique composition; external review finds no template repetition.'},
  'depth':{'action':'Increase true 2.5D foreground/background occlusion on selected sources; avoid random zoom.',
           'acceptance':'At least 3 shots visibly pass the foreground/background depth and edge inspection at 100%.'},
  'audio_sync':{'action':'Import approved Alexandre MP3 and verified word timestamps, synchronize cuts/voice and mix music below speech.',
           'acceptance':'No dubbed speech mismatch; checked actual playback with word-level timing and peak/loudness audit.'},
  'editing':{'action':'Storyboard each cut around new evidence, visual action or a narrated beat.',
           'acceptance':'At least 2 meaningful associations/cut matches; no title-card-only sequence.'},
  'real_assets':{'action':'Add licensed, relevant footage and historically contextualized archival material.',
           'acceptance':'Source IDs, date, author, licence and rights verified for each public use.'},
  'type_legibility':{'action':'Place concise text in mobile-safe positions and audit at actual phone size.',
           'acceptance':'No caption covers evidence; all words legible in 9:16 mobile test.'},
  'color':{'action':'Use coherent expressive lighting motivated by original imagery and editorial tone.',
           'acceptance':'Color script approved: no crushed source documents or synthetic-looking alteration of evidence.'},
  'editorial_integrity':{'action':'Cross-check numbers, chronology, provenance, rights and contradiction notes.',
           'acceptance':'Every assertion tied to primary source; rights cleared; human approval recorded.'}
}


def prioritize(ratings:dict):
    weights=ratings['weights'];new=ratings['current'];previous=ratings.get('previous')
    current=scorecard(previous,new,weights)
    todo=[]
    for k,w in weights.items():
        gap=round((10-new[k])*w/100,3)
        rule=IMPROVEMENTS.get(k,{'action':'Review weakest criterion','acceptance':'Independent review passes'})
        todo.append({'criterion':k,'current_score':new[k],'weighted_gap_to_10':gap,**rule})
    todo.sort(key=lambda x:-x['weighted_gap_to_10'])
    return {'scorecard':current,'improvement_backlog':todo,
            'next_three':todo[:3],
            'note':'Priorities are weighted score deficits; not proof that any proposed change will improve subjective quality.'}


def create_variant(original:dict,style:str)->dict:
    """Create a camera-only variation; NEVER mutate text, source, evidence or rights."""
    if style not in ('documental','cinematic','kinetic'):raise ValueError('unknown style')
    obj=copy.deepcopy(original)
    obj['edition']=str(obj.get('edition',''))+'-'+style
    if style=='documental':strength=.65;shift=.65
    elif style=='cinematic':strength=1.0;shift=1.0
    else:strength=1.3;shift=1.2
    for sc in obj.get('scenes',[]):
        cam=sc.get('camera',{})
        if 'from' not in cam or 'to' not in cam:continue
        a,b=list(cam['from']),list(cam['to'])
        # Preserve start point and number of frames. Documents receive special restrained treatment.
        if sc.get('type')=='document':scale=min(strength,0.85);translation=min(shift,.75)
        else:scale=strength;translation=shift
        for i in (0,1):b[i]=max(.05,min(.95,a[i]+(b[i]-a[i])*translation))
        b[2]=max(1.,min(1.38,a[2]+(b[2]-a[2])*scale))
        cam['to']=b
    return obj