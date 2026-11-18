"""V28 mechanical video inspection. Does not assign artistic ratings."""
from __future__ import annotations
import argparse,json,math,re,subprocess
from pathlib import Path
import cv2,numpy as np


def probe(file:Path)->dict:
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(file)],text=True))


def loudness(file:Path)->dict:
    run=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(file),'-vn','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True)
    block=run.stderr.split('Summary:')[-1]
    def value(label):
        match=re.search(r'^\s*'+re.escape(label)+r':\s*([-+]?\d+(?:\.\d+)?|[-+]?inf)\s*(?:LUFS|dBFS|dBTP)?',block,re.M)
        return float(match.group(1)) if match else None
    # EBU R128 summary uses I: and Peak: or True peak: depending on version.
    return {'integrated_LUFS':value('I'), 'true_peak_dBTP':value('Peak') or value('True peak')}


def analyze(file:Path,meta:dict)->dict:
    file=Path(file)
    m=probe(file)
    vid=next((x for x in m['streams'] if x.get('codec_type')=='video'),None)
    aud=next((x for x in m['streams'] if x.get('codec_type')=='audio'),None)
    if not vid:raise ValueError('no real video stream')
    fps=vid.get('avg_frame_rate','0/1');num,den=(float(x) for x in fps.split('/'))
    frame_rate=num/den if den else 0.
    duration=float(m.get('format',{}).get('duration',0))
    cap=cv2.VideoCapture(str(file));black=[];sharp=[];nearby=[];frames=[]
    if not cap.isOpened():raise ValueError('video decoder unavailable')
    try:
        for t in np.linspace(.2,max(.2,duration-.4),18):
            cap.set(cv2.CAP_PROP_POS_MSEC,float(t*1000))
            ok,f=cap.read()
            if not ok:raise ValueError('failed to decode sample frame')
            # Only the actual image canvas is sampled; black overlay margins ignored.
            core=f[145:660,22:-22]
            gray=cv2.cvtColor(core,cv2.COLOR_BGR2GRAY)
            black.append(round(float(np.mean(gray<12)),4))
            sharp.append(round(float(cv2.Laplacian(gray,cv2.CV_64F).var()),2))
            frames.append(cv2.resize(gray,(54,70)))
        nearby=[round(float(np.mean(np.abs(frames[i].astype(float)-frames[i-1].astype(float)))),2)
                for i in range(1,len(frames))]
    finally:cap.release()
    issues=[]
    if vid.get('codec_name')!='h264' or not aud:issues.append('missing H264 or audio stream')
    if (vid.get('width'),vid.get('height'))!=(540,960):issues.append('unexpected output geometry')
    if not 23.9<frame_rate<24.1:issues.append('unexpected framerate')
    if not 14.4<duration<14.62:issues.append('incorrect runtime')
    if max(black)>.50:issues.append('image canvas near-black in a reviewed scene')
    # Voice is optional in internal previews. When a real source MP3 was
    # ingested by the renderer, require its source-byte SHA; metadata alone
    # still does not prove perceptual synchronization.
    voice_claimed=meta.get('voice_embedded') is True
    voice_sha=meta.get('voice_sha256')
    if voice_claimed and (not isinstance(voice_sha,str) or len(voice_sha)!=64):
        issues.append('voiced master has no source-audio SHA256')
    if not voice_claimed and voice_sha:
        issues.append('silent-preview metadata unexpectedly contains narration hash')
    if meta.get('visual_engine')!='ARANHAVERSO_BRUTALISTA_V28':issues.append('wrong visual engine')
    if meta.get('publication_approved') is not False:issues.append('publication not approved')
    shots=meta.get('plan',{}).get('shots',[])
    unique=len({round(s['source_window_start'],1) for s in shots if s.get('source_window_start') is not None})
    if unique<2:issues.append('moving archive footage lacks distinct temporal windows')
    audio=loudness(file)
    if audio['integrated_LUFS'] is None or audio['true_peak_dBTP'] is None:issues.append('audio loudness could not be measured')
    elif not (-25< audio['integrated_LUFS']<-12 and audio['true_peak_dBTP']<-1):issues.append('audio level outside preview range')
    return {'technical_ok':not issues,'technical_issues':issues,'asset_file':file.name,
            'seconds':round(duration,3),'resolution':[vid['width'],vid['height']],
            'fps':round(frame_rate,2),'video_codec':vid['codec_name'],
            'audio_codec':aud['codec_name'] if aud else None,
            'average_visual_change_px':round(float(np.mean(nearby)),2),
            'median_visual_change_px':round(float(np.median(nearby)),2),
            'black_share_max_image_canvas':max(black),
            'sharpness_laplacian_median':round(float(np.median(sharp)),1),
            'distinct_source_video_windows':unique,
            'compositions':len(shots),'headline_retreat_sec':meta.get('headlines_retreat_after_sec'),
            'primary_image_zone_height_px':672,
            'subtitle_timestamps_from_real_voice':bool(meta.get('word_timings_real')),
            'voice_embedded':voice_claimed,'voice_audibility_independently_verified':False,'loudness':audio,
            'automatic_artistic_score':None,'independent_review':False,
            'publication_approved':False}


def main():
    p=argparse.ArgumentParser();p.add_argument('--video',type=Path,required=True)
    p.add_argument('--manifest',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
    a=p.parse_args();report=analyze(a.video,json.loads(a.manifest.read_text(encoding='utf8')))
    a.out.parent.mkdir(parents=True,exist_ok=True)
    a.out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if not report['technical_ok']:raise SystemExit(2)

if __name__=='__main__':main()

