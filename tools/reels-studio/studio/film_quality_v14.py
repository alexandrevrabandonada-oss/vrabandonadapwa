"""Visual direction warnings for a sound-led cut plan. Never an automated taste score."""
def inspect_edl(edl:dict,scenes:list[dict])->dict:
    by_id={s['id']:s for s in scenes}
    alerts=[]
    for shot in edl['shots']:
        src=by_id[shot['scene_id']];duration=shot['duration_sec']
        if duration>4 and src.get('motion')!='moving_footage':
            alerts.append({'scene':src['id'],'issue':'LONG_NON_FILMED_SCENE',
                'detail':f'{duration:.2f}s without recorded action: review composition'})
        if shot['source']=='duration_fallback_NOT_AUDIO_SYNC':
            alerts.append({'scene':src['id'],'issue':'UNANCHORED_CUT',
                'detail':'No acoustic pause close enough; editor review needed'})
    if not any(s.get('motion')=='moving_footage' for s in scenes):
        alerts.append({'issue':'NO_MOVING_SOURCE','detail':'Only animated stills in timeline'})
    else:
        alerts.append({'issue':'VERIFY_MOTION_LICENSE',
              'detail':'Every video source needs factual origin/rights or a visible simulation label'})
    return {'visual_review_required':True,'aesthetic_quality_certified':False,
      'warnings':alerts,'publication_allowed':False}
