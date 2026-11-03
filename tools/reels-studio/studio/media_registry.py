"""Evidence-aware media catalog: usage, rights and dates, no automatic licensing."""
from __future__ import annotations
import hashlib
from pathlib import Path

KINDS={'video','photo','newspaper','audio','derived_visual'}
GATES={'verified_public_license','written_authorization','pending','restricted','synthetic'}
ROLES={'context','event_evidence','document_evidence','graphic_simulation','ambient_detail'}

def rights_approved(a):
    if a.get('license_gate')=='verified_public_license':
        return bool(a.get('license_url') and a.get('attribution') and a.get('rights_reviewed_by')) and not a.get('license_review_pending')
    if a.get('license_gate')=='written_authorization':
        return bool(a.get('authorization_reference') and a.get('rights_reviewed_by'))
    return False

def analyze_catalog(catalog):
    ids=set();errors=[];warnings=[]
    for a in catalog.get('assets',[]):
        aid=a.get('id','')
        if not aid or aid in ids:errors.append('missing/duplicated asset ID: '+str(aid));continue
        ids.add(aid)
        if a.get('type') not in KINDS:errors.append(f'{aid}: invalid media type')
        if a.get('license_gate') not in GATES:errors.append(f'{aid}: invalid license gate')
        if not (a.get('source_url') or a.get('source_description')):errors.append(f'{aid}: missing origin')
        if a.get('license_gate') in ('verified_public_license','written_authorization') and not rights_approved(a):
            warnings.append(f'{aid}: positive rights flag not yet documented')
        if a.get('license_review_pending'):warnings.append(f'{aid}: license review pending')
        if a.get('type')=='derived_visual' and not a.get('derived_from'):errors.append(f'{aid}: parent source missing')
        if a.get('type')=='video' and not a.get('capture_date'):warnings.append(f'{aid}: capture date unknown')
    return {'assets':len(catalog.get('assets',[])),'errors':errors,'warnings':warnings,
            'rights_verified_count':sum(rights_approved(a) for a in catalog.get('assets',[]))}

def inspect_usage(catalog,usages,*,public=False):
    assets={a['id']:a for a in catalog.get('assets',[]) if a.get('id')}
    errors=[];warnings=[]
    for i,shot in enumerate(usages):
        aid=shot.get('asset_id');source=assets.get(aid);label=f'shot {i} ({aid})'
        if source is None:errors.append(f'{label}: missing source');continue
        role=shot.get('editorial_role')
        if role not in ROLES:errors.append(f'{label}: invalid role');continue
        if source.get('license_gate')=='synthetic':
            if role!='graphic_simulation':errors.append(f'{label}: synthetic cannot be factual footage')
            if 'SIMULAÇÃO' not in shot.get('on_screen_disclosure','').upper():
                errors.append(f'{label}: synthetic shot requires visible SIMULAÇÃO label')
        if role=='event_evidence':
            if not shot.get('event_date') or source.get('capture_date')!=shot['event_date'] or not source.get('event_verified'):
                errors.append(f'{label}: event proof requires independently verified date')
        if role=='document_evidence' and source.get('type') not in ('newspaper','photo'):
            errors.append(f'{label}: unsupported documentary evidence type')
        if role=='context' and (not source.get('capture_date') or shot.get('event_date')):
            if 'CONTEXTO' not in shot.get('on_screen_disclosure','').upper():
                errors.append(f'{label}: contextual image needs CONTEXTO label')
        if public and not rights_approved(source):errors.append(f'{label}: publication blocked by unverified rights')
        if public and not shot.get('fact_checked_by'):errors.append(f'{label}: fact-check approval missing')
    return {'pass':not errors,'blocked':public and bool(errors),'errors':errors,'warnings':warnings,
            'scenes_checked':len(usages),'mode':'publish' if public else 'internal'}

def local_integrity(catalog,root:Path):
    rows=[]
    for asset in catalog.get('assets',[]):
        rel=asset.get('local_path')
        if not rel:rows.append({'id':asset['id'],'present':False,'sha256':None});continue
        p=(root/rel).resolve()
        if not p.is_relative_to(root.resolve()):raise ValueError('path outside workspace')
        if not p.is_file():rows.append({'id':asset['id'],'present':False,'sha256':None});continue
        h=hashlib.sha256()
        with p.open('rb') as fd:
            while chunk:=fd.read(1024*1024):h.update(chunk)
        rows.append({'id':asset['id'],'present':True,'sha256':h.hexdigest(),'bytes':p.stat().st_size})
    return {'assets':rows,'note':'checksums do not prove authorship or license'}
