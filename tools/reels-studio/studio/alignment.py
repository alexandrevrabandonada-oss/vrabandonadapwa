"""Convert externally supplied word timecodes into captions, never infer timing from text."""
from __future__ import annotations
import argparse,json,math
from pathlib import Path
from .captions import normalize,load_timeline

def validate_words(words:list,transcript:str,duration:float)->list[dict]:
    if not isinstance(words,list) or not words:raise ValueError('word timestamps must be nonempty')
    clean=[];last=0.
    for i,item in enumerate(words):
        if not isinstance(item,dict) or not str(item.get('text','')).strip():raise ValueError(f'word {i}: no text')
        try:start,end=float(item['start']),float(item['end'])
        except (KeyError,ValueError,TypeError):raise ValueError(f'word {i}: invalid timestamps')
        if not all(map(math.isfinite,(start,end))) or start<0 or end<=start or start<last-.02 or end>duration+.1:
            raise ValueError(f'word {i}: out of bounds or overlapping')
        clean.append({'text':str(item['text']).strip(),'start':start,'end':end});last=end
    if normalize(' '.join(w['text'] for w in clean))!=normalize(transcript):
        raise ValueError('timed words do not reproduce approved transcript')
    return clean

def cues_from_words(words:list[dict],max_chars:int=38,max_duration:float=3.5,max_gap:float=.42)->list[dict]:
    if max_chars<15 or max_duration<=.2:raise ValueError('caption layout limits invalid')
    cues=[];line=[]
    for word in words:
        candidate=' '.join(w['text'] for w in line+[word])
        start=(line[0] if line else word)['start']
        long=len(candidate)>max_chars or word['end']-start>max_duration
        pause=bool(line and word['start']-line[-1]['end']>max_gap)
        if line and (long or pause):
            cues.append({'start':round(line[0]['start'],3),'end':round(line[-1]['end'],3),
                         'text':' '.join(w['text'] for w in line)});line=[]
        if len(word['text'])>max_chars:raise ValueError('word wider than subtitle line')
        line.append(word)
    if line:cues.append({'start':round(line[0]['start'],3),'end':round(line[-1]['end'],3),'text':' '.join(w['text'] for w in line)})
    return cues

def stamp(seconds:float)->str:
    ms=round(seconds*1000);h,rem=divmod(ms,3600000);m,rem=divmod(rem,60000);s,sub=divmod(rem,1000)
    return f'{h:02}:{m:02}:{s:02},{sub:03}'

def export_alignment(words:list,transcript:str,duration:float,out_base:Path)->dict:
    clean=validate_words(words,transcript,duration);cues=cues_from_words(clean)
    out_base.parent.mkdir(parents=True,exist_ok=True)
    payload={'cues':cues,'status':'DRAFT_TIME_CODES_NOT_HUMAN_REVIEWED',
             'words_count':len(clean),'source':'provided_word_timestamps'}
    path=out_base.with_suffix('.json')
    path.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf8')
    load_timeline(path,transcript,duration)
    content='\n\n'.join(f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(cues,1))+'\n'
    out_base.with_suffix('.srt').write_text(content,encoding='utf8')
    return {'json':str(path),'srt':str(out_base.with_suffix('.srt')),'cues':len(cues),
            'status':payload['status']}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--words',type=Path,required=True);p.add_argument('--transcript',type=Path,required=True)
    p.add_argument('--duration',type=float,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();payload=json.loads(a.words.read_text(encoding='utf8'))
    words=payload.get('words') if isinstance(payload,dict) else payload
    print(json.dumps(export_alignment(words,a.transcript.read_text(encoding='utf8').strip(),a.duration,a.output),ensure_ascii=False,indent=2))
if __name__=='__main__':main()
