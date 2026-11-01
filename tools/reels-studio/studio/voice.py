"""Import an already approved voice recording. Never regenerates or claims timed captions."""
from __future__ import annotations
import argparse,hashlib,json,shutil
from pathlib import Path
from .factory import load_project,probe,validate,hash_file


def attach_voice(manifest:Path,audio_source:Path,timing_path:Path|None=None)->dict:
    project=load_project(manifest)
    root=manifest.resolve().parent
    if root.name=='examples':root=root.parent
    wav=audio_source.resolve()
    if not wav.is_file():raise FileNotFoundError(wav)
    media=probe(wav)
    duration=float(media['format']['duration'])
    timeline=sum(float(s['duration']) for s in project['scenes'])
    if duration>timeline+.25:
        raise ValueError(f'Voice duration {duration:.2f}s exceeds storyboard {timeline:.2f}s; edit scenes first (no truncation allowed).')
    target_dir=root/'private_assets'/'voice';target_dir.mkdir(parents=True,exist_ok=True)
    hash=hash_file(wav)
    target=target_dir/(f'approved_{hash[:12]}'+wav.suffix.lower())
    if not target.is_file():shutil.copyfile(wav,target)
    project['narration']['file']=str(target.relative_to(root))
    project['narration']['sha256']=hash
    project['narration']['timings_verified']=False
    if timing_path:
        cue_data=json.loads(timing_path.read_text())
        words=cue_data.get('words',[])
        if not isinstance(words,list) or not words:raise ValueError('word timings missing')
        last=0.
        for i,w in enumerate(words):
            start,end=float(w['start']),float(w['end'])
            if start<last-.01 or end<=start or end>duration+.1:raise ValueError(f'invalid timing at index {i}')
            last=end
        # Technical timing sanity does not equal human review.
        project['narration']['word_timings_file']=str(timing_path.resolve())
        project['narration']['timings_verified']=False
        project['narration']['timings_status']='NEEDS_HUMAN_SPOT_CHECK'
    out=root/'output'/(project['project_id']+'-voice-attached.json')
    out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(project,ensure_ascii=False,indent=2),encoding='utf-8')
    return {'voice_imported':str(target),'sha256':hash,'duration_sec':duration,'storyboard_duration_sec':timeline,
            'manifest_draft':str(out),'timings_verified':False}


def main():
    p=argparse.ArgumentParser();p.add_argument('--project',type=Path,required=True);p.add_argument('--audio',type=Path,required=True);p.add_argument('--timings',type=Path)
    a=p.parse_args();print(json.dumps(attach_voice(a.project,a.audio,a.timings),ensure_ascii=False,indent=2))
if __name__=='__main__':main()