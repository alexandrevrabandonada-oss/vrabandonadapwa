"""Measure loudness and true peak. Technical results never replace listening or approval."""
from __future__ import annotations
import json,re,subprocess
from pathlib import Path

def inspect_audio(filename:Path)->dict:
    if not filename.is_file():raise FileNotFoundError(filename)
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries',
        'format=duration:stream=codec_type','-of','json',str(filename)],text=True))
    if not any(s.get('codec_type')=='audio' for s in info.get('streams',[])):
        return {'ok':False,'errors':['audio stream missing'],'duration':float(info['format']['duration'])}
    cmd=['ffmpeg','-nostats','-i',str(filename),'-filter_complex','ebur128=peak=true','-f','null','-']
    ret=subprocess.run(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
    tail=ret.stderr.rsplit('Summary:',1)[-1]
    integrated=re.search(r'Integrated loudness:\s*I:\s*([+-]?\d+(?:\.\d+)?) LUFS',tail)
    truepeak=re.search(r'True peak:\s*Peak:\s*([+-]?\d+(?:\.\d+)?) dBFS',tail)
    if ret.returncode!=0 or not integrated:return {'ok':False,'errors':['audio loudness analysis failed']}
    lufs=float(integrated.group(1));peak=float(truepeak.group(1)) if truepeak else None
    warnings=[]
    if lufs<-20 or lufs>-12:warnings.append('integrated loudness outside -20 to -12 LUFS provisional reference')
    if peak is not None and peak>-1:warnings.append('true peak above -1 dBTP reference')
    return {'ok':True,'integrated_lufs':lufs,'true_peak_dbtp':peak,
      'duration':float(info['format']['duration']),'warnings':warnings,
      'note':'Technical only; voice clarity and rights need human review'}
