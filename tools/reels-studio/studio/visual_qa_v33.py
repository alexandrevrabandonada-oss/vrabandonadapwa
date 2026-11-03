"""v30 QA = objective metadata and signal checks, not an artistic score."""
from __future__ import annotations
import argparse,hashlib,json,subprocess
from pathlib import Path
from . import master_qa_v29 as prior
from .visual_director_v33 import SCENES, inspect_plan


def analyze(master:Path,manifest:dict,word_file:Path):
    if manifest.get('version')!='v0.33':raise ValueError('wrong generation manifest')
    base=prior.technical(master,manifest,word_file)
    motion=manifest.get('motion_language',{})
    if motion.get('distinct_grammars')!=8 or not motion.get('independent_layers'):
        raise ValueError('missing real V33 animated spatial grammar')
    plan=inspect_plan()
    errors=list(base['errors'])
    photos=manifest.get('photo_source_ids',[])
    if photos!=['csn_construction_1941','csn_interior_1969','csn_2014_02','csn_2014_01']:
        errors.append('source diversity missing: four different local historical photos required')
    distances=manifest.get('photo_perceptual_hash_distances',[])
    if len(distances)!=6 or min(distances)<6:
        errors.append('still photo sources look duplicative')
    if manifest.get('voice_embedded') and not manifest.get('voice_sha256'):
        errors.append('voice false-positive manifest')
    if not manifest.get('word_timing_from_real_recording'):
        errors.append('caption word timing not original')
    if not manifest.get('source_archival_construction_1941_and_real_interior_1969'):
        errors.append('1941 workers or 1969 real CSN interior context missing')
    report={'version':'v0.33','technical_ok':not errors,'errors':errors,
            'signal_qa':base,'image_diversity':plan,'motion_language':motion,
            'photo_hash_distances':distances,
            'narration_in_mp4':bool(manifest.get('voice_embedded')),
            'artistic_score_certified':False,'human_review_completed':False,
            'publication_approved':False}
    return report


def main():
    p=argparse.ArgumentParser();p.add_argument('--video',type=Path,required=True)
    p.add_argument('--words',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    args=p.parse_args()
    manifest=json.loads(args.video.with_suffix('.json').read_text())
    r=analyze(args.video,manifest,args.words)
    args.out.write_text(json.dumps(r,ensure_ascii=False,indent=2))
    prior.export_srt(prior.read_words(args.words),args.out.with_suffix('.srt'))
    print(json.dumps({'technical_ok':r['technical_ok'],'errors':r['errors'],
                      'image_diversity':r['image_diversity'],
                      'narration_in_mp4':r['narration_in_mp4']},ensure_ascii=False,indent=2))
    if not r['technical_ok']:raise SystemExit(1)

if __name__=='__main__':main()
