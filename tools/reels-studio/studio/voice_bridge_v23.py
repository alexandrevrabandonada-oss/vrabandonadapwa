"""Direct ElevenLabs TTS-to-timed-words bridge for Aço Gráfico.

An explicit --generate and a secret ELEVENLABS_API_KEY are both required for
credit-spending calls. Once received, cache by request hash (no auto retries).
Pre-existing MP3s can still be imported with studio.voice_delivery.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import math
import os
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ENDPOINT='https://api.elevenlabs.io/v1/text-to-speech'
MODEL='eleven_multilingual_v2'
FORMAT='mp3_44100_128'

def request_hash(text:str,voice_id:str,model_id=MODEL,output_format=FORMAT)->str:
    if not text.strip() or len(text)>5000 or not re.fullmatch(r'[A-Za-z0-9_-]{12,100}',voice_id):
        raise ValueError('TTS text or voice_id invalid')
    item={'text':text.strip(),'voice_id':voice_id,'model_id':model_id,'output_format':output_format}
    return hashlib.sha256(json.dumps(item,ensure_ascii=False,sort_keys=True).encode('utf8')).hexdigest()

def alignment_to_words(alignment:dict)->dict:
    if not isinstance(alignment,dict):raise ValueError('provider alignment missing')
    chars=alignment.get('characters')
    starts=alignment.get('character_start_times_seconds')
    ends=alignment.get('character_end_times_seconds')
    if not isinstance(chars,list) or not chars or not all(isinstance(c,str) and len(c)==1 for c in chars):
        raise ValueError('provider characters invalid')
    if not isinstance(starts,list) or not isinstance(ends,list) or not (len(chars)==len(starts)==len(ends)):
        raise ValueError('provider timestamp lengths mismatch')
    last=0.
    for i,(a,b) in enumerate(zip(starts,ends)):
        if not all(isinstance(v,(int,float)) and math.isfinite(v) for v in (a,b)):
            raise ValueError('non-finite character timing')
        if a<-.001 or b<a or a+0.045<last:
            raise ValueError(f'non-monotonic character timing at {i}')
        last=max(last,b)
    transcript=''.join(chars)
    words=[]
    for match in re.finditer(r'\S+',transcript):
        left,right=match.span()
        start=float(starts[left]);end=float(ends[right-1])
        if end<=start:raise ValueError('word has zero duration')
        words.append({'text':match.group(),'start':round(start,3),'end':round(end,3)})
    if not words:raise ValueError('speech contains no words')
    return {'transcript':transcript,'words':words,'duration_of_spoken_words_sec':round(words[-1]['end'],3),
            'source':'elevenlabs_with_timestamps','status':'PROVIDER_ALIGNED_HUMAN_UNREVIEWED'}

def inspect_cached(audio_path:Path,req_sha:str)->dict|None:
    meta_path=audio_path.with_suffix('.generation.json')
    if not audio_path.exists() and not meta_path.exists():return None
    if not audio_path.is_file() or not meta_path.is_file():
        raise ValueError('partial generation found: manual recovery required; do not charge again')
    meta=json.loads(meta_path.read_text(encoding='utf8'))
    if meta.get('request_sha256')!=req_sha:
        raise ValueError('output path reused for a different TTS request')
    if hashlib.sha256(audio_path.read_bytes()).hexdigest()!=meta.get('audio_sha256'):
        raise ValueError('cached audio integrity mismatch')
    if not audio_path.with_suffix('.words.json').is_file():
        raise ValueError('cached audio lacks word timing file')
    return {'cache_hit':True,**meta}

def generate_timed_speech(text:str,voice_id:str,audio_path:Path,*,generate:bool=False,
                          api_key:str|None=None,model_id=MODEL)->dict:
    digest=request_hash(text,voice_id,model_id)
    previous=inspect_cached(audio_path,digest)
    if previous is not None:return previous
    if not generate:
        raise ValueError('requires explicit --generate (spends ElevenLabs credits)')
    token=api_key or os.environ.get('ELEVENLABS_API_KEY')
    if not token:
        raise ValueError('ELEVENLABS_API_KEY absent; use connected app or configure a secret')
    url=f'{ENDPOINT}/{urllib.parse.quote(voice_id,safe="")}/with-timestamps?output_format={FORMAT}'
    payload=json.dumps({'text':text.strip(),'model_id':model_id}).encode('utf8')
    request=urllib.request.Request(url,data=payload,headers={
        'xi-api-key':token,'Content-Type':'application/json','Accept':'application/json',
        'User-Agent':'VRAbandonada-AcoGrafico/0.23'},method='POST')
    # Exactly one call: network errors never trigger a second charge automatically.
    try:
        with urllib.request.urlopen(request,timeout=90) as response:
            obj=json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f'ElevenLabs request failed with status {error.code}; inspect account or key') from None
    if not isinstance(obj,dict) or not obj.get('audio_base64'):
        raise ValueError('provider gave no audio; do not retry without inspection')
    timed=alignment_to_words(obj.get('normalized_alignment') or obj.get('alignment'))
    try:
        data=base64.b64decode(obj['audio_base64'],validate=True)
    except (ValueError,base64.binascii.Error):
        raise ValueError('provider audio invalid base64')
    if not 512<len(data)<20*1024*1024:
        raise ValueError('provider audio output length suspicious')
    audio_path.parent.mkdir(parents=True,exist_ok=True)
    temp=audio_path.with_suffix('.incomplete.mp3')
    temp.write_bytes(data)
    # Preserve .incomplete.mp3 after uncertain errors to prevent automatic double charge.
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format',
                           '-show_streams','-of','json',str(temp)],text=True))
    if not any(x.get('codec_type')=='audio' for x in probe.get('streams',[])):
        raise ValueError('provider payload is not audio')
    duration=float(probe['format']['duration'])
    if not 0<duration<300 or timed['duration_of_spoken_words_sec']>duration+.2:
        raise ValueError('timings do not fit provider audio')
    meta={'request_sha256':digest,'audio_sha256':hashlib.sha256(data).hexdigest(),
          'model_id':model_id,'voice_id':voice_id,'duration_sec':round(duration,3),
          'words_count':len(timed['words']),'provider_word_alignment':True,
          'human_timing_reviewed':False,'public_release_approved':False,
          'credit_spend_occurred':True}
    temp.rename(audio_path)
    audio_path.with_suffix('.words.json').write_text(json.dumps(timed,ensure_ascii=False,indent=2),encoding='utf8')
    audio_path.with_suffix('.generation.json').write_text(json.dumps(meta,indent=2),encoding='utf8')
    return {'cache_hit':False,**meta}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--text-file',type=Path,required=True)
    ap.add_argument('--voice-id',required=True)
    ap.add_argument('--audio-out',type=Path,required=True)
    ap.add_argument('--generate',action='store_true',help='Explicitly authorize an API charge')
    opts=ap.parse_args()
    text=opts.text_file.read_text(encoding='utf8').strip()
    print(json.dumps(generate_timed_speech(text,opts.voice_id,opts.audio_out,generate=opts.generate),ensure_ascii=False,indent=2))
if __name__=='__main__':main()
