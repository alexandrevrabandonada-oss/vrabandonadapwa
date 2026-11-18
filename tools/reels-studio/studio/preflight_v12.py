"""Fail-closed production readiness; only inspects media and review flags."""
from __future__ import annotations
from pathlib import Path
from .media_registry import analyze_catalog,inspect_usage,local_integrity
from .voice_delivery import inspect as inspect_voice

def check(catalog,shot_plan,voice,*,root:Path|None=None,public=False,human_review=None):
    cat=analyze_catalog(catalog)
    usage=inspect_usage(catalog,shot_plan.get('shots',[]),public=public)
    failures=list(cat['errors'])+list(usage['errors'])
    warnings=list(cat['warnings'])+list(usage['warnings'])
    voice_state={'audio_present':False,'audio_decode_validated':False,
        'duration_sec_reported':voice.get('duration_sec_reported'),
        'spoken_text_verified':bool(voice.get('verified_spoken_text')),
        'timestamps_human_approved':bool(voice.get('words_aligned_to_audio') and voice.get('timings_reviewed_by'))}
    audio=voice.get('local_audio_path')
    if audio:
        if root is None:failures.append('voice path requires workspace')
        else:
            p=(root/audio).resolve()
            if not p.is_relative_to(root.resolve()):failures.append('voice path outside workspace')
            elif p.is_file():
                try:
                    info=inspect_voice(p,voice.get('duration_sec_reported'))
                    voice_state.update(audio_present=True,audio_decode_validated=info['matching_expected_duration'],
                        measured_duration_sec=info['duration_sec'],sha256=info['sha256'])
                    if not info['matching_expected_duration']:failures.append('narration duration mismatch')
                except (ValueError,OSError) as e:failures.append('audio invalid: '+str(e))
            else:failures.append('narration file missing')
    if public:
        if not voice_state['audio_decode_validated']:failures.append('voice audio not imported or verified')
        if not voice_state['spoken_text_verified']:failures.append('recorded transcript not reviewed')
        if not voice_state['timestamps_human_approved']:failures.append('caption times not reviewed')
        for name in ('editorial_approved','mobile_visual_approved','sound_mix_approved','rights_editor_signoff'):
            if (human_review or {}).get(name) is not True:failures.append('missing approval: '+name)
    elif not voice_state['audio_present']:
        warnings.append('PILOT_NO_REAL_NARRATION')
    out={'project_id':shot_plan.get('project_id'),'mode':'publish' if public else 'internal',
      'ready_for_publication':bool(public and not failures),'failures':failures,
      'warnings':warnings,'voice':voice_state,'rights_verified_assets':cat['rights_verified_count'],
      'distribution_action_taken':False}
    if root:out['local_media_integrity']=local_integrity(catalog,root)
    return out
