"""Import the already generated narration from a user-supplied local audio file. No TTS calls."""
from __future__ import annotations
from pathlib import Path
import argparse,hashlib,json,subprocess,shutil

def inspect(original:Path,expected_duration:float|None=None)->dict:
    if not original.is_file():raise FileNotFoundError(original)
    if original.suffix.lower() not in ('.mp3','.wav','.m4a','.flac'):raise ValueError('unsupported audio extension')
    if original.stat().st_size<512:raise ValueError('audio file too small')
    metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(original)],text=True))
    streams=[s for s in metadata.get('streams',[]) if s.get('codec_type')=='audio']
    if not streams:raise ValueError('not an audio recording')
    duration=float(metadata['format']['duration'])
    if duration<=0:raise ValueError('invalid voice duration')
    match=expected_duration is None or abs(duration-float(expected_duration))<=.4
    return {'filename':original.name,'bytes':original.stat().st_size,'sha256':hashlib.sha256(original.read_bytes()).hexdigest(),
            'codec':streams[0].get('codec_name'),'duration_sec':round(duration,3),
            'expected_duration_sec':expected_duration,'matching_expected_duration':match,
            'transcript_verified':False,'timings_verified':False,'consent_to_publication':False}

def import_existing(original:Path,destination:Path,expected_duration:float|None=None)->dict:
    report=inspect(original,expected_duration)
    if not report['matching_expected_duration']:raise ValueError('duration differs from chosen voice take')
    if destination.exists():raise FileExistsError('will not overwrite a prior recording')
    destination.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(original,destination)
    report['local_path']=str(destination)
    destination.with_suffix('.ingest.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
    return report

def main():
    p=argparse.ArgumentParser(description='Ingest EXISTING narration, no new generation')
    p.add_argument('--source',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--expected-duration',type=float,default=20.7122)
    a=p.parse_args()
    print(json.dumps(import_existing(a.source,a.output,a.expected_duration),ensure_ascii=False,indent=2))
if __name__=='__main__':main()
