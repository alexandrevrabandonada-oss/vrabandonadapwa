"""VR Abandonada: V10 depth stage integrated with expressive editorial grammar.
Run: python -m studio.render_v10 --project examples/ferro_em_ebulicao_v10.json --output output/v10.mp4
"""
from __future__ import annotations
import argparse, json
from pathlib import Path
import numpy as np,cv2
from .expressive_world import ExpressiveWorld,load_manifest,blend,type_image,PALETTE,micro_label,vignette_bar,draw_speckle,halftone_corner,ease_out
from .depth_stage import DepthStage

def validate_v10(man,root):
    problems=[]
    for s in man.get('scenes',[]):
        if s.get('motion')=='physical_parallax':
            for key in ('background_source','mask_source'):
                if s.get(key) not in man.get('sources',{}):problems.append(s.get('id','?')+': '+key+' missing')
            if s.get('kind')!='industrial_world':problems.append('physical parallax cannot animate evidence as illustration')
    return problems

class V10World(ExpressiveWorld):
    def __init__(self,man,root):
        if problems:=validate_v10(man,root):raise ValueError('; '.join(problems))
        super().__init__(man,root)
        self.depth_stages={}
        for s in man['scenes']:
            if s.get('motion')!='physical_parallax':continue
            fore=self.sources[s['source']]
            back=self.sources[s['background_source']]
            mask=self.sources[s['mask_source']]
            self.depth_stages[s['id']]=DepthStage(fore,back,mask,self.w,self.h,
                       pan_x=float(s.get('pan_x',.5)),pan_y=float(s.get('pan_y',.48)),strength=float(s.get('strength',1)))
    def industrial(self,s,p,t):
        if s.get('motion')!='physical_parallax':return super().industrial(s,p,t)
        w,h=self.w,self.h
        # Real foreground occludes a reconstructed neutral background as camera passes.
        photo=self.depth_stages[s['id']].frame(p,accent=PALETTE['signal'])
        out=np.copy(photo)
        # Localized ink geometry, outside source: animated perspective and industrial typography.
        a=PALETTE[s['accent']]
        top_h=round(h*.12)
        cv2.fillConvexPoly(out,np.int32([[0,0],[w,0],[w,top_h-16],[0,top_h+30]]),PALETTE['cobalt'])
        for k in range(3):
            y=int(h*.13+k*h*.06+25*p)
            cv2.line(out,(0,y),(int(w*.14),y-int(w*.04)),PALETTE['signal'],2,cv2.LINE_AA)
        # A physical black title plane cuts in front of the photographic scene.
        y=int(h*.70+16*(1-ease_out(min(1,p*3))))
        quad=np.int32([[0,y],[w,y-int(h*.08)],[w,y+int(h*.17)],[0,y+int(h*.23)]])
        cv2.fillConvexPoly(out,quad,PALETTE['ink'])
        cv2.line(out,(0,y),(w,y-int(h*.08)),a,max(3,w//75),cv2.LINE_AA)
        txt=type_image('MEMÓRIA',round(w*.164),PALETTE['cream'],1,PALETTE['ink'])
        if txt.shape[1]>w-24:txt=cv2.resize(txt,(w-24,round(txt.shape[0]*(w-24)/txt.shape[1])))
        blend(out,txt,round(w*.025),y+int(h*.025))
        bar_x=int(w*.66+40*np.sin(p*np.pi))
        cv2.rectangle(out,(bar_x,0),(bar_x+4,int(h*.27)),PALETTE['signal'],-1)
        halftone_corner(out,int(p*5),PALETTE['signal'],int(h*.15))
        draw_speckle(out,t)
        vignette_bar(out,h-45,PALETTE['ink'])
        blend(out,micro_label(self.man['sources'][s['source']]['on_screen_label']),max(9,round(w*.02)),h-32)
        return out

def render(manifest_path:Path,output:Path,only_scene:str|None=None,override_size:tuple[int,int]|None=None,fps:int|None=None):
    manifest=load_manifest(manifest_path);root=manifest_path.resolve().parent.parent
    if only_scene:
        manifest['scenes']=[s for s in manifest['scenes'] if s['id']==only_scene]
        if not manifest['scenes']:raise ValueError('scene not found')
    if override_size:manifest['output']['width'],manifest['output']['height']=override_size
    if fps:manifest['output']['fps']=fps
    engine=V10World(manifest,root)
    output.parent.mkdir(parents=True,exist_ok=True)
    writer=cv2.VideoWriter(str(output),cv2.VideoWriter_fourcc(*'mp4v'),engine.fps,(engine.w,engine.h))
    frames=round(engine.duration*engine.fps)
    for i in range(frames):writer.write(cv2.cvtColor(engine.frame(i/engine.fps),cv2.COLOR_RGB2BGR))
    writer.release()
    return {'frames':frames,'duration_sec':engine.duration,'width':engine.w,'height':engine.h,'fps':engine.fps,
      'output':str(output),'source_originals_preserved':True,'narration':False,'publication_blocked':True}

def main():
    p=argparse.ArgumentParser();p.add_argument('--project',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--scene');p.add_argument('--master',action='store_true')
    a=p.parse_args();print(json.dumps(render(a.project,a.output,a.scene,(1080,1920) if a.master else None,30 if a.master else None)))
if __name__=='__main__':main()