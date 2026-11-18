"""Aço Gráfico v0.11: moving footage in the expressive documentary scene world.

All dynamic plates retain source provenance; laboratory plates are explicitly
identified as simulation, never footage of the historical incident.
"""
from __future__ import annotations
import json,argparse
from pathlib import Path
import cv2,numpy as np
from .render_v10 import V10World,render as render_v10
from .expressive_world import PALETTE,blend,type_image,micro_label,halftone_corner,draw_speckle,skew_photo,load_manifest,ease_out
from .actionqa import inspect_clip

class V11World(V10World):
    def __init__(self,man:dict,root:Path):
        self.motion_caps={}
        self._files={}
        video_clips=man.get('motion_clips',{})
        for s in man['scenes']:
            if s.get('motion')!='moving_footage':continue
            if s['kind']!='industrial_world':raise ValueError('moving footage cannot be treated as evidence')
            item=video_clips.get(s.get('clip_source'))
            if not isinstance(item,dict):raise ValueError('moving scene lacks a footage manifest entry')
            if item.get('rights')!='cleared' and item.get('role')!='simulation':
                raise ValueError('moving footage rights or simulation label required')
            if item.get('role')=='simulation' and not str(item.get('on_screen_label','')).startswith('SIMULAÇÃO'):
                raise ValueError('synthetic footage must be visibly marked as simulation')
            local=(root/item['path']).resolve()
            if not local.is_relative_to(root.resolve()) or not local.is_file():raise ValueError('clip missing or unsafe path')
            self._files[s['id']]=local
        super().__init__(man,root)
        for sid,path in self._files.items():
            cap=cv2.VideoCapture(str(path))
            if not cap.isOpened():raise ValueError('clip cannot be decoded: '+sid)
            self.motion_caps[sid]=cap
        self.action_reports={sid:inspect_clip(path) for sid,path in self._files.items()}

    def industrial(self,s,p,t):
        if s.get('motion')!='moving_footage':return super().industrial(s,p,t)
        w,h=self.w,self.h;cap=self.motion_caps[s['id']]
        dur=max(.1,float(cap.get(cv2.CAP_PROP_FRAME_COUNT))/cap.get(cv2.CAP_PROP_FPS))
        clip_pos=min(dur-.1,float(s.get('clip_offset',0))+p*float(s['duration']))
        cap.set(cv2.CAP_PROP_POS_MSEC,clip_pos*1000)
        ok,frame=cap.read()
        if not ok:raise ValueError('video decode failure during moving shot')
        frame=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
        # Full spatial scene: perspective plate above and beneath a diagonal ink element.
        bg=np.full((h,w,3),PALETTE['ink'],dtype=np.uint8)
        cv2.fillConvexPoly(bg,np.int32([[0,0],[w,0],[w,420],[0,610]]),PALETTE['cobalt'])
        cv2.fillConvexPoly(bg,np.int32([[0,530],[w,310],[w,h],[0,h]]),PALETTE['rust'])
        video=cv2.resize(frame,(w,h),interpolation=cv2.INTER_LINEAR)
        drive=ease_out(min(1,p*1.5))
        dx=int(40*(1-drive));dy=int(25*np.sin(p*np.pi))
        quad=np.float32([[40+dx,110+dy],[w-20+dx,45+dy],[w+45,810+dy],[-25,840+dy]])
        warped,mask=skew_photo(video,quad,w,h)
        a=(mask.astype(np.float32)/255)[:,:,None]
        bg[:]=np.uint8(bg*(1-a)+warped*a)
        cv2.polylines(bg,[quad.astype(np.int32)],True,PALETTE['signal'],4,cv2.LINE_AA)
        # The graphic foreground is outside the plate and does not rewrite its pixels.
        cv2.fillConvexPoly(bg,np.int32([[0,0],[w*.19,0],[w*.68,h],[w*.48,h]]),PALETTE['ink'])
        cv2.line(bg,(int(w*.17),0),(int(w*.67),h),PALETTE['electric'],6,cv2.LINE_AA)
        bar_y=int(h*.60+20*(1-drive))
        cv2.fillConvexPoly(bg,np.int32([[0,bar_y],[w,bar_y-72],[w,bar_y+140],[0,bar_y+210]]),PALETTE['ink'])
        title=type_image('MATÉRIA VIVA',int(w*.095),PALETTE['cream'],1,PALETTE['ink'])
        if title.shape[1]>w-34:
            size=w-34;title=cv2.resize(title,(size,round(title.shape[0]*size/title.shape[1])))
        blend(bg,title,18,bar_y+12)
        halftone_corner(bg,int(t*3),PALETTE['signal'],180)
        draw_speckle(bg,t,rate=.5)
        cv2.rectangle(bg,(0,h-75),(w,h),PALETTE['ink'],-1)
        # Explicitly mark lab footage so it can't silently become historical imagery.
        item=self.man['motion_clips'][s['clip_source']]
        if item['role']=='simulation':
            top=type_image('SIMULAÇÃO GRÁFICA',max(22,round(w*.045)),PALETTE['signal'])
            bottom=type_image('NÃO É ARQUIVO HISTÓRICO',max(20,round(w*.040)),PALETTE['cream'])
            blend(bg,top,14,h-77)
            blend(bg,bottom,14,h-43)
        else:
            lab=micro_label(item['on_screen_label'])
            if lab.shape[1]>w-30:lab=cv2.resize(lab,(w-30,max(12,round(lab.shape[0]*(w-30)/lab.shape[1]))))
            blend(bg,lab,14,h-58)
        return bg

    def close(self):
        for cap in self.motion_caps.values():cap.release()


def render(manifest_path:Path,output:Path,fps:int|None=None,size:tuple[int,int]|None=None)->dict:
    man=load_manifest(manifest_path);root=manifest_path.resolve().parent.parent
    if fps:man['output']['fps']=fps
    if size:man['output']['width'],man['output']['height']=size
    eng=V11World(man,root);output.parent.mkdir(exist_ok=True,parents=True)
    writer=cv2.VideoWriter(str(output),cv2.VideoWriter_fourcc(*'mp4v'),eng.fps,(eng.w,eng.h))
    if not writer.isOpened():raise RuntimeError('video writer unavailable')
    try:
        frames=round(eng.duration*eng.fps)
        for i in range(frames):
            writer.write(cv2.cvtColor(eng.frame(i/eng.fps),cv2.COLOR_RGB2BGR))
    finally:writer.release();eng.close()
    return {'duration_sec':eng.duration,'frames':frames,'fps':eng.fps,'dimensions':[eng.w,eng.h],
       'moving_footage_action_qa':eng.action_reports,'status':'INTERNAL_REVIEW_ONLY',
       'voice_integrated':False,'publish_allowed':False,'output':str(output)}

def main():
    p=argparse.ArgumentParser();p.add_argument('--project',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();print(json.dumps(render(a.project,a.output),ensure_ascii=False,indent=2))
if __name__=='__main__':main()