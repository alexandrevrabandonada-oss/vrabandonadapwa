"""Aço Gráfico v0.24 — real word timestamps, captions and safe voice delivery.

ElevenLabs produced 32 word timestamps and 14.071 s audio. The connected
generation URL is NOT the same as imported MP3 bytes. Never pretend it is.
"""
from __future__ import annotations
import argparse,hashlib,json,math,re,subprocess
from pathlib import Path

MAX_CHARS=33
MAX_WORDS=6
MAX_CUE_DURATION=2.2
MAX_GAP=.40

def load_words(path:Path):
    record=json.loads(path.read_text(encoding="utf8"))
    if not isinstance(record.get("words"),list) or not record["words"]:
        raise ValueError("word list required")
    words=[];previous=0.
    for i,item in enumerate(record["words"]):
        if isinstance(item,list) and len(item)==3:word,start,end=item
        elif isinstance(item,dict):word,start,end=item["text"],item["start"],item["end"]
        else:raise ValueError(f"word {i} malformed")
        if not isinstance(word,str) or not word.strip() or any(c in word for c in '{}\\'):
            raise ValueError("unsafe or empty word")
        if not all(isinstance(v,(int,float)) and math.isfinite(v) for v in (start,end)):
            raise ValueError("word timestamp invalid")
        if start<previous-.02 or start<0 or end<=start or end>float(record.get("duration_sec",0))+.15:
            raise ValueError("word overlap or out of bounds")
        words.append({"text":word,"start":float(start),"end":float(end)})
        previous=end
    actual=re.sub(r"\s+"," "," ".join(w["text"] for w in words).strip())
    reference=re.sub(r"\s+"," ",str(record.get("transcript","")).strip())
    if actual!=reference:
        raise ValueError("words do not match actual narrated transcript")
    return record,words

def cues(words):
    result=[];group=[]
    def push():
        if group:
            result.append({"start":group[0]["start"],"end":group[-1]["end"],
                           "text":" ".join(w["text"] for w in group),
                           "words":[dict(w) for w in group]})
    for w in words:
        if group:
            string=" ".join(q["text"] for q in group+[w])
            if (len(group)>=MAX_WORDS or len(string)>MAX_CHARS or
                w["end"]-group[0]["start"]>MAX_CUE_DURATION or
                w["start"]-group[-1]["end"]>MAX_GAP or
                group[-1]["text"].endswith((".","!","?"))):
                push();group=[]
        group.append(w)
    push();return result

def stamp(t):
    ms=round(t*1000);h,ms=divmod(ms,3600000)
    m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def export_srt(words_path:Path,out:Path):
    record,words=load_words(words_path)
    cuts=cues(words)
    out.parent.mkdir(parents=True,exist_ok=True)
    content="\n\n".join(f"{i}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}"
                       for i,c in enumerate(cuts,1))+"\n"
    out.write_text(content,encoding="utf8")
    return {"output":str(out),"cues":len(cuts),"words":len(words),
            "last_word_sec":words[-1]["end"],"provider_timings":True,
            "human_reviewed":False}

def ffprobe(path:Path):
    return json.loads(subprocess.check_output(
        ["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(path)],text=True))

def inspect_voice(voice:Path,words_path:Path):
    if not voice.is_file():raise FileNotFoundError("voice bytes not present")
    info,_=load_words(words_path)
    p=ffprobe(voice)
    if not any(s.get("codec_type")=="audio" for s in p.get("streams",[])):
        raise ValueError("provided recording is not audio")
    dur=float(p["format"]["duration"])
    if abs(dur-float(info["duration_sec"]))>.5:
        raise ValueError("voice recording does not match word timing duration")
    return {"voice_duration_sec":dur,"audio_sha256":hashlib.sha256(voice.read_bytes()).hexdigest()}

def mux_narration(video:Path,voice:Path,words_path:Path,out:Path):
    """No synthesis; put existing original vocal bytes in video with ducked music."""
    source=ffprobe(video)
    if not any(s.get("codec_type")=="audio" for s in source["streams"]):
        raise ValueError("original music missing from master")
    voice_info=inspect_voice(voice,words_path)
    _,words=load_words(words_path)
    if float(source["format"]["duration"])<words[-1]["end"]+.2:
        raise ValueError("film too short; narration would be truncated")
    out.parent.mkdir(parents=True,exist_ok=True)
    filt=("[0:a]volume=0.14[m];[m][1:a]amix=inputs=2:duration=first:"
          "weights=1 1.4:normalize=0,loudnorm=I=-16:TP=-2:LRA=8[a]")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(video),"-i",str(voice),
                    "-filter_complex",filt,"-map","0:v:0","-map","[a]",
                    "-c:v","copy","-c:a","aac","-b:a","160k",
                    "-movflags","+faststart",str(out)],check=True)
    return {"voice_embedded":True,"voice":voice_info,"word_count":len(words),
            "publication_approved":False,"word_timing_human_reviewed":False}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--words",type=Path,required=True)
    p.add_argument("--srt",type=Path,required=True)
    opt=p.parse_args()
    print(json.dumps(export_srt(opt.words,opt.srt),ensure_ascii=False,indent=2))

if __name__=="__main__":main()
