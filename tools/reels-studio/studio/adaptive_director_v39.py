"""Aço Gráfico v0.39: a motion director whose tempo follows evidentiary intent.

Builds every 1080x1920 output frame from hashes-verified archival stills and
original France 2011 footage; does not claim foreign footage is the CSN.
The historical image pixels are never fabricated. Does NOT invoke paid speech
or publish. A supplied voice file is only embedded if its bytes are verified.
"""
from __future__ import annotations
import argparse, hashlib, json, subprocess
from pathlib import Path
import cv2
from . import story_motion_v37 as base

# Evidence requires sustained reading; action may accelerate; disclosures need pauses.
PROFILES = (
    ('1941 construction evidence', 'measured'),
    ('1969 CSN interior evidence', 'measured'),
    ('2014 establishment', 'kinetic'),
    ('2014 city context', 'kinetic'),
    ('industrial action illustration', 'kinetic'),
    ('foreign-origin disclosure', 'measured'),
    ('second industrial context', 'kinetic'),
    ('documentary conclusion', 'measured'),
)


def editorial_plan(stages=base.STAGES):
    base.validate_plan(stages)
    if len(stages)!=len(PROFILES):
        raise ValueError('Expected eight shots')
    expected = ('1941', '1969', '2014', '2014', 'france', 'france', 'france', 'both')
    if tuple(s[2] for s in stages)!=expected:
        raise ValueError('Documentary source order changed; refusing misleading montage')
    if any('FRANÇA' not in stages[i][4] for i in range(4,8)):
        raise ValueError('Foreign footage cannot be mistaken for the CSN')
    if not (all(mode=='measured' for _,mode in (PROFILES[i] for i in (0,1,5,7)))
            and all(mode=='kinetic' for _,mode in (PROFILES[i] for i in (2,3,4,6)))):
        raise ValueError('Evidence/action/rest phase rhythm has regressed')
    return [dict(index=i+1, start=round(s[0],3), end=round(s[1],3),
                source=s[2], title=s[3], credit=s[4],
                motion_grammar=s[6], narrative_intent=PROFILES[i][0],
                motion_profile=PROFILES[i][1],
                provenance='CSN historic archive' if i<4 else 'Foreign industrial illustration')
            for i,s in enumerate(stages)]


def source_check(photo1941,photo1969,photo2014,film):
    expected={
        '1941':'91d061df6f5fb7962d17c86948e656c335f1b0ca',
        '1969':'1e16caba06722d121eaf3b88b39d89be910bb2a0',
        '2014':'6a792f0fd16ddd4c8bed2ca981788c9b9accb7a4',
        'foreign_film':base.FILM_SHA1,
    }
    paths={'1941':Path(photo1941),'1969':Path(photo1969),'2014':Path(photo2014),'foreign_film':Path(film)}
    for key,path in paths.items():
        if not path.is_file() or base.sha1(path)!=expected[key]:
            raise ValueError('Unverified or misidentified source '+key)
    return expected


def verify_word_anchor(words):
    base.narrative_events(words)
    all_starts=[w[1] for w in words]
    deviations=[]
    for shot in base.STAGES[1:]:
        nearest=min(all_starts,key=lambda t:abs(t-shot[0]))
        deviations.append(round(abs(nearest-shot[0]),4))
    if max(deviations)>.11:
        raise ValueError('Edit does not follow original measured word timing')
    return deviations


def render(photo1941,photo1969,photo2014,film,words_file,out,voice_file=None):
    sources=source_check(photo1941,photo1969,photo2014,film)
    plan=editorial_plan()
    words=base.words_load(words_file)
    drifts=verify_word_anchor(words)
    narration=base.inspect_local_narration(voice_file) if voice_file is not None else None
    images={name:cv2.imread(str(p)) for name,p in [('1941',photo1941),('1969',photo1969),('2014',photo2014)]}
    if any(x is None for x in images.values()):
        raise ValueError('Could not decode genuine historic still')
    cap=cv2.VideoCapture(str(film));source_fps=cap.get(cv2.CAP_PROP_FPS)
    if not cap.isOpened() or source_fps<1:raise ValueError('Real film is unreadable')
    out=Path(out);out.parent.mkdir(parents=True,exist_ok=True)
    raw=out.with_name(out.stem+'_frames.avi')
    writer=cv2.VideoWriter(str(raw),cv2.VideoWriter_fourcc(*'MJPG'),base.FPS,(base.W,base.H))
    if not writer.isOpened():raise RuntimeError('Cannot create 1080x1920 video frames')
    last=-1;last_scene=-1;moving=None
    try:
        for index in range(round(base.LENGTH*base.FPS)):
            t=index/base.FPS
            scene_idx=next(j for j,s in enumerate(base.STAGES) if s[0]<=t<s[1])
            stage=base.STAGES[scene_idx]
            if stage[5] is not None:
                frame_id=round((stage[5]+t-stage[0])*source_fps)
                if scene_idx!=last_scene or frame_id<last:
                    cap.set(cv2.CAP_PROP_POS_FRAMES,frame_id)
                    last=frame_id-1
                while last<frame_id:
                    ok,moving=cap.read()
                    if not ok:raise ValueError('Missing frame from original video')
                    last+=1
            src=images[stage[2]] if stage[2] in images else moving
            if src is None:raise ValueError('Missing visible source image')
            selected=PROFILES[scene_idx][1]
            img=base.frame(src,images['2014'],scene_idx,t,selected,bool(narration))
            _,caption,active=base.captions(words,t)
            img[1536:1846]=base.caption_layer(caption,active)
            cv2.rectangle(img,(0,base.H-7),(round((index+1)/(base.LENGTH*base.FPS)*base.W),base.H-1),(74,179,250),-1)
            writer.write(img)
            last_scene=scene_idx
    finally:
        writer.release();cap.release()
    wav=out.with_name(out.stem+'_original_instrumental.wav')
    base.audio_music(wav)
    cmd=['ffmpeg','-hide_banner','-y','-v','error','-i',str(raw),'-i',str(wav)]
    if narration:
        cmd+=['-i',str(voice_file),'-filter_complex',
              '[1:a]volume=0.38[m];[m][2:a]sidechaincompress=threshold=0.018:ratio=8:attack=6:release=230[d];'
              '[d][2:a]amix=inputs=2:duration=longest:weights=0.46 1.0,loudnorm=I=-16:TP=-2.0:LRA=8[a]',
              '-map','0:v','-map','[a]']
    else:
        cmd+=['-map','0:v','-map','1:a','-af','loudnorm=I=-16:TP=-2.0:LRA=8']
    cmd+=['-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-r',str(base.FPS),
          '-c:a','aac','-b:a','160k','-t',str(base.LENGTH),'-movflags','+faststart',str(out)]
    try:
        subprocess.run(cmd,check=True)
        probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(out)],text=True))
        video=next(s for s in probe['streams'] if s['codec_type']=='video')
        if (video['width'],video['height'],video['r_frame_rate'])!=(1080,1920,'30/1'):
            raise ValueError('Master dimensions/fps incorrect')
    finally:
        raw.unlink(missing_ok=True);wav.unlink(missing_ok=True)
    result=dict(version='v0.39',master=str(out),native_1080x1920=True,fps=30,duration_sec=base.LENGTH,
                narrative_source='factual local archival chronology, with explicitly foreign industrial video',
                shot_plan=plan,source_sha1=sources,word_anchor_drift_sec=drifts,
                voice_embedded=bool(narration),voice_sha256=narration['sha256'] if narration else None,
                speaker_identity_verified=False,original_alexandre_bytes_verified=False,
                choreography_source='source-led semantic profile',
                motion_grammar_count=len({x['motion_grammar'] for x in plan}),
                motion_profile_count=len({x['motion_profile'] for x in plan}),
                not_a_1962_event_reconstruction=True,
                publication_approved=False,external_art_review_completed=False,
                artistic_score_certified=False)
    out.with_suffix('.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    return result


def main():
    parser=argparse.ArgumentParser()
    for a in ('photo1941','photo1969','photo2014','film','words','out'):
        parser.add_argument('--'+a,type=Path,required=True)
    parser.add_argument('--voice',type=Path)
    args=parser.parse_args()
    r=render(args.photo1941,args.photo1969,args.photo2014,args.film,args.words,args.out,args.voice)
    print(json.dumps({k:r[k] for k in ('version','master','duration_sec','voice_embedded','motion_grammar_count')},ensure_ascii=False))
if __name__=='__main__':main()
