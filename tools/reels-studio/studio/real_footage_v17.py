"""Aço Gráfico V17: real Commons footage, reproducible source hash and visual study.

CC BY-SA 4.0: credit 4MAPS/Demba Welle; this is SENEGAL 2024, never CSN 1962.
"""
from pathlib import Path
import argparse,hashlib,json,subprocess
SOURCE_PAGE="https://commons.wikimedia.org/wiki/File:Armature_en_acier_de_pliage.webm"
SOURCE_URL="https://upload.wikimedia.org/wikipedia/commons/f/f9/Armature_en_acier_de_pliage.webm"
SOURCE_SHA1="cacc1db79fd88d7da28eb8783a57514159a5a3c1"
LICENSE="https://creativecommons.org/licenses/by-sa/4.0/"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"

def command(src,out,width=720,height=1280,seconds=10):
    w,h=width,height
    v=(
    "[0:v]fps=24,split=2[back][front];"
    f"[back]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},"
    "boxblur=20:2,eq=brightness=-0.18:saturation=1.4[bg];"
    f"[front]scale={w}:-2,setsar=1,eq=contrast=1.10:saturation=1.25[subject];"
    "[bg][subject]overlay=x=0:y=(H-h)/2:shortest=1,"
    "drawbox=x=0:y=0:w=iw:h=90:color=0x1A1D53@0.92:t=fill,"
    "drawbox=x=0:y=90:w=iw:h=12:color=0xF03D82@0.95:t=fill,"
    f"drawbox=x=0:y={int(h*.835)}:w=iw:h={int(h*.165)}:color=0x090F23@0.87:t=fill,"
    f"drawtext=fontfile={FONT}:text=ACO GRAFICO:x={int(w*.07)}:y=24:fontsize={int(w*.056)}:fontcolor=0xF5DE5F,"
    f"drawtext=fontfile={FONT}:text=O TRABALHO TEM MOVIMENTO:x={int(w*.07)}:y={int(h*.20)}:fontsize={int(w*.045)}:fontcolor=white:box=1:boxcolor=0x161642@0.65:enable=between(t\\,0\\,3.4),"
    f"drawtext=fontfile={FONT}:text=MATERIA EM ACAO:x={int(w*.07)}:y={int(h*.25)}:fontsize={int(w*.064)}:fontcolor=0xF5DE5F:box=1:boxcolor=0x290F2F@0.65:enable=between(t\\,3.4\\,7.3),"
    f"drawtext=fontfile={FONT}:text=MOVIMENTO REAL:x={int(w*.07)}:y={int(h*.25)}:fontsize={int(w*.064)}:fontcolor=white:box=1:boxcolor=0x260A35@0.65:enable=gte(t\\,7.3),"
    f"drawtext=fontfile={FONT}:text=SENEGAL 2024 - IMAGEM DE CONTEXTO:x={int(w*.065)}:y={int(h*.872)}:fontsize={int(w*.032)}:fontcolor=0xF5DE5F,"
    f"drawtext=fontfile={FONT}:text=4MAPS / DEMBA WELLE - CC BY-SA 4.0:x={int(w*.065)}:y={int(h*.923)}:fontsize={int(w*.024)}:fontcolor=white,"
    "format=yuv420p[v]"
    )
    return ["ffmpeg","-y","-hide_banner","-loglevel","error","-i",str(src),
        "-filter_complex",v,"-map","[v]","-map","0:a?","-t",str(seconds),
        "-c:v","libx264","-preset","veryfast","-crf","21",
        "-c:a","aac","-b:a","128k","-movflags","+faststart",str(out)]

def verify_and_render(source:Path,output:Path,*,require_hash=True,width=720,height=1280):
    if not source.is_file() or source.stat().st_size<1000:
        raise ValueError("source file missing/empty")
    sha1=hashlib.sha1(source.read_bytes()).hexdigest()
    if require_hash and sha1!=SOURCE_SHA1:
        raise ValueError("Wikimedia original SHA1 mismatch; DO NOT render another file")
    output.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run(command(source,output,width,height),check=True)
    detail=json.loads(subprocess.check_output([
       "ffprobe","-v","error","-show_streams","-show_format","-of","json",str(output)]))
    video=next((s for s in detail["streams"] if s["codec_type"]=="video"),None)
    if not video:raise ValueError("no video track")
    result={"source_page":SOURCE_PAGE,"source_sha1":sha1,"source_author":"4MAPS / Demba Welle",
       "capture_country":"Senegal","capture_date":"2024-03-05",
       "license":"CC BY-SA 4.0","license_url":LICENSE,
       "editing":"crop/contrast/color/graphic overlays, source recording preserved separately",
       "width":video["width"],"height":video["height"],
       "fps":video["r_frame_rate"],"duration_sec":detail["format"]["duration"],
       "is_CSN_footage":False,"is_1962_recording":False,
       "distribution_approval":False,"rights_check":"CC BY-SA attribution and ShareAlike apply"}
    output.with_suffix(".json").write_text(json.dumps(result,indent=2,ensure_ascii=False))
    return result

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--source",type=Path,required=True);p.add_argument("--output",type=Path,required=True)
    p.add_argument("--synthetic-fixture-only",action="store_true")
    a=p.parse_args()
    print(json.dumps(verify_and_render(a.source,a.output,require_hash=not a.synthetic_fixture_only),indent=2))
