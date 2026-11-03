"""v0.26 verified media QA and a clearly subjective, NOT certified creative score."""
from __future__ import annotations
import argparse
import json
import re
import subprocess
from pathlib import Path
import cv2
import numpy as np

WEIGHTS={'identidade_aranhaverso_brutalista':.20,'composicao_visual':.15,
    'movimento_montagem':.15,'qualidade_e_variedade_do_acervo':.15,
    'narrativa_jornalistica':.10,'legendas_e_leitura_mobile':.10,'som_e_voz':.15}
EDITORIAL={
 'v0.25_zine':{'identidade_aranhaverso_brutalista':8.3,'composicao_visual':7.5,
   'movimento_montagem':7.,'qualidade_e_variedade_do_acervo':5.8,
   'narrativa_jornalistica':6.2,'legendas_e_leitura_mobile':7.7,'som_e_voz':3.4},
 'v0.26_graphic':{'identidade_aranhaverso_brutalista':8.1,'composicao_visual':7.65,
   'movimento_montagem':7.5,'qualidade_e_variedade_do_acervo':6.05,
   'narrativa_jornalistica':6.5,'legendas_e_leitura_mobile':7.7,'som_e_voz':3.4},
 'v0.26_cinema':{'identidade_aranhaverso_brutalista':7.65,'composicao_visual':7.8,
   'movimento_montagem':7.65,'qualidade_e_variedade_do_acervo':6.05,
   'narrativa_jornalistica':6.5,'legendas_e_leitura_mobile':7.7,'som_e_voz':3.4}
}

def editorial_notes():
    if abs(sum(WEIGHTS.values())-1)>1e-8:raise ValueError('rubric does not sum to one')
    return {'type':'INTERNAL_EDITORIAL_ESTIMATE_NOT_AUDIENCE_OR_INDEPENDENT_SCORE',
        'weighted_scores_10':{k:round(sum(v[x]*WEIGHTS[x] for x in WEIGHTS),2)
                              for k,v in EDITORIAL.items()},
        'weights':WEIGHTS,'dimension_scores':EDITORIAL,
        'limitations':['Visual grammar still uses a limited source vocabulary',
                       'Professional Alexandre audio not present in these samples',
                       'French steel video is NOT filmed inside the CSN',
                       '540x960 technical preview, not a native 1080x1920 master',
                       'No real audience retention or independent mobile evaluation'],
        'technical_validation_is_not_approval':True}

def probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format',
        '-show_streams','-of','json',str(path)],text=True))

def audio_metrics(path):
    r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(path),
        '-filter_complex','ebur128=peak=true','-f','null','-'],
        capture_output=True,text=True,check=True)
    tail=r.stderr.rsplit('Summary:',1)[-1]
    loud=re.search(r'\bI:\s*(-?\d+(?:\.\d+)?)\s*LUFS',tail)
    peak=re.search(r'True peak:\s*\n\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS',tail)
    if not loud or not peak:raise ValueError('unreadable loudness output')
    return float(loud.group(1)),float(peak.group(1))

def inspect(video,manifest):
    meta=probe(video);errors=[]
    visual=next((x for x in meta['streams'] if x.get('codec_type')=='video'),None)
    audio=next((x for x in meta['streams'] if x.get('codec_type')=='audio'),None)
    if not visual or not audio:raise ValueError('missing streams')
    if visual['codec_name']!='h264' or audio['codec_name']!='aac':errors.append('codecs mismatch')
    if (visual['width'],visual['height'])!=(540,960):errors.append('resolution mismatch')
    fps=eval_fraction(visual['r_frame_rate'])
    if abs(fps-24)>.01:errors.append('framerate mismatch')
    runtime=float(meta['format']['duration'])
    plan=manifest['plan'];shots=plan['shots']
    if abs(runtime-plan['duration_sec'])>.06:errors.append('runtime mismatch')
    if len(set(s['layout'] for s in shots))<4:errors.append('insufficient visual grammar')
    selected={s['source_window_start'] for s in shots if s.get('source_window_start') is not None}
    if len(selected)<2:errors.append('too few distinct moving source takes')
    reader=cv2.VideoCapture(str(video))
    previews=[];movement=[]
    for index,s in enumerate(shots):
        mid=(s['start']+s['end'])/2
        reader.set(cv2.CAP_PROP_POS_MSEC,mid*1000);ok,frame=reader.read()
        if not ok:errors.append(f'frame missing in shot {index}');continue
        std=float(np.std(frame));dark=float((frame.mean(axis=2)<14).mean())
        if std<30 or dark>.67:errors.append(f'flat/black shot {index}')
        previews.append({'index':index,'layout':s['layout'],'stddev':round(std,1),
            'dark_ratio':round(dark,3),'clip_start':s['source_window_start']})
        if s['source'] in ('film','both'):
            reader.set(cv2.CAP_PROP_POS_MSEC,(s['start']+.2)*1000);ok1,a=reader.read()
            reader.set(cv2.CAP_PROP_POS_MSEC,(s['start']+min(s['end']-s['start']-.1,1.0))*1000)
            ok2,b=reader.read()
            if ok1 and ok2:movement.append(float(np.mean(cv2.absdiff(a,b))))
    reader.release()
    if len(previews)!=len(shots):errors.append('missing review samples')
    if not movement or max(movement)<5:errors.append('moving footage lacks sampled movement')
    lufs,peak=audio_metrics(video)
    if not(-21<=lufs<=-14) or peak>-1:errors.append('loudness/peak failed')
    if manifest.get('voice_embedded') and not manifest.get('voice_sha256'):
        errors.append('false voice provenance')
    return {'ok':not errors,'errors':errors,'seconds':runtime,'resolution':'540x960',
        'fps':fps,'LUFS':lufs,'dBTP':peak,'video_windows':len(selected),
        'visual_grammars':len(set(s['layout'] for s in shots)),
        'motion_probe':round(max(movement),2) if movement else 0,
        'voice_embedded':manifest.get('voice_embedded',False),
        'real_word_timestamps_used':manifest.get('word_timings_real',False),
        'scenes':previews,'publication_approved':False,
        'artistic_score_certified':False}

def eval_fraction(txt):
    n,d=(int(i) for i in txt.split('/'))
    if d==0:raise ValueError('invalid video frame rate')
    return n/d

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--video',required=True,type=Path)
    p.add_argument('--manifest',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    args=p.parse_args()
    result={'technical':inspect(args.video,json.loads(args.manifest.read_text(encoding='utf8'))),
            'editorial':editorial_notes()}
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'technical_pass':result['technical']['ok'],
          'scores':result['editorial']['weighted_scores_10'],
          'LUFS':result['technical']['LUFS'],'dBTP':result['technical']['dBTP']}))
    if not result['technical']['ok']:raise SystemExit(2)

if __name__=='__main__':main()
