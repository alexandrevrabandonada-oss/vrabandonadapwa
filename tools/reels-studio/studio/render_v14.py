"""Render an existing-audio EDL through the reusable Aço Gráfico world.

The audio may be a laboratory fixture; the renderer does NOT certify speech,
rights or true word alignment. Internal audiovisual prototype only.
"""
from __future__ import annotations
import argparse,copy,json,subprocess
from pathlib import Path
import cv2
from .soundfirst import analyze
from .sound_edit_v14 import compile_edl
from .render_v11 import V11World
from .expressive_world import load_manifest

def render(project:Path,audio:Path,out:Path,size=(540,960),fps=24):
    root=project.resolve().parent.parent
    base=load_manifest(project)
    analysis=analyze(audio,base['scenes'])
    edl=compile_edl(analysis['audio_analysis'],base['scenes'],fps=fps)
    man=copy.deepcopy(base)
    man['output']={'width':size[0],'height':size[1],'fps':fps}
    for s,shot in zip(man['scenes'],edl['shots']):
        s['duration']=shot['duration_sec']
    world=V11World(man,root)
    out.parent.mkdir(parents=True,exist_ok=True)
    silent=out.with_name(out.stem+'_NO_AUDIO.mp4')
    writer=cv2.VideoWriter(str(silent),cv2.VideoWriter_fourcc(*'mp4v'),fps,size)
    if not writer.isOpened():raise RuntimeError('cannot open encoder')
    try:
        for i in range(edl['frame_count']):
            writer.write(cv2.cvtColor(world.frame(i/fps),cv2.COLOR_RGB2BGR))
    finally:
        writer.release();world.close()
    work=out.with_suffix('.work.mp4')
    cmd=['ffmpeg','-y','-v','error','-i',str(silent),'-i',str(audio),
        '-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','fast',
        '-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k',
        '-af','acompressor=threshold=0.08:ratio=3:attack=10:release=130,loudnorm=I=-16:LRA=8:TP=-1.5',
        '-video_track_timescale','30000','-movflags','+faststart',str(work)]
    subprocess.run(cmd,check=True,stdout=subprocess.DEVNULL)
    work.replace(out)
    edl.update(render_path=str(out),publication_allowed=False,
       audio_type='LABORATORY_OR_EXTERNAL_UNVERIFIED_NOT_ALEXANDRE',
       verified_spoken_words=False,rights_publication_ready=False)
    (out.parent/(out.stem+'_EDL.json')).write_text(json.dumps(edl,ensure_ascii=False,indent=2))
    return edl

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--project',type=Path,required=True)
    p.add_argument('--audio',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--width',type=int,default=540)
    p.add_argument('--height',type=int,default=960)
    p.add_argument('--fps',type=int,default=24)
    a=p.parse_args()
    print(json.dumps(render(a.project,a.audio,a.output,(a.width,a.height),a.fps),ensure_ascii=False,indent=2))
