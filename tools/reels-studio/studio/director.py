"""Scene-first direction checks. This is editorial assistance, not aesthetic scoring."""
from __future__ import annotations
from collections import Counter


REQUIRED=('subject','intent','camera_motive','cut_motive')


def shotlist(project:dict)->dict:
    """A storyboard breakdown with conservative, checkable improvements."""
    problems=[];shots=[];time=0.0
    scenes=project.get('scenes',[])
    asset_ids=project.get('assets',{})
    if not isinstance(scenes,list):raise ValueError('scenes should be a list')
    patterns=Counter()
    for i,scene in enumerate(scenes):
        name=scene.get('id') or f'shot-{i+1:02d}'
        duration=float(scene.get('duration',0))
        design=scene.get('direction') or {}
        missing=[k for k in REQUIRED if not isinstance(design.get(k),str) or not design[k].strip()]
        if missing:problems.append({'shot':name,'severity':'warning','reason':'missing director metadata: '+', '.join(missing)})
        cam=scene.get('camera') or {}
        frm=cam.get('from',[.5,.5,1]);to=cam.get('to',[.5,.5,1.08])
        if len(frm)==3 and len(to)==3:
            xdelta=abs(to[0]-frm[0])+abs(to[1]-frm[1]); zdelta=abs(to[2]-frm[2])
            pattern=(scene.get('type'),round(xdelta,1),round(zdelta,1))
            patterns[pattern]+=1
            if xdelta<.012 and zdelta<.012:problems.append({'shot':name,'severity':'warning','reason':'almost static shot — requires narrative reason'})
        if scene.get('type')=='document' and scene.get('overlay'):
            problems.append({'shot':name,'severity':'blocking','reason':'text overlay risks obscuring original documentary evidence'})
        if scene.get('type')=='clip' and not design.get('visible_action'):
            problems.append({'shot':name,'severity':'warning','reason':'clip lacks described visible action'})
        asset=asset_ids.get(scene.get('asset'),{})
        if scene.get('type') in ('photograph','parallax','clip') and asset.get('capture_date') in (None,'') and not (scene.get('context_label') or scene.get('disclaimer')):
            problems.append({'shot':name,'severity':'blocking','reason':'undated visual not labelled in scene'})
        shots.append({'id':name,'start':round(time,3),'end':round(time+duration,3),'seconds':duration,
                      'type':scene.get('type'),'asset_id':scene.get('asset'),'subject':design.get('subject'),
                      'intent':design.get('intent'),'visible_action':design.get('visible_action'),
                      'camera_motive':design.get('camera_motive'),'cut_motive':design.get('cut_motive')})
        time+=duration
    for pattern,n in patterns.items():
        if n>=3:problems.append({'shot':'sequence','severity':'warning','reason':f'repeated camera grammar in {n} shots: {pattern}'})
    return {'project_id':project.get('project_id'),'duration_sec':round(time,3),'shots':shots,
            'blocking':sum(x['severity']=='blocking' for x in problems),
            'warnings':sum(x['severity']=='warning' for x in problems),'issues':problems,
            'assessment':'SCENE DESIGN CHECK — not a machine-generated professional art score'}