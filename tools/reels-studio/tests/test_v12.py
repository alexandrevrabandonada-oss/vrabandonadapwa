"""V0.12 provenance gates; independent of private images and external services."""
from pathlib import Path
from studio.media_registry import analyze_catalog,inspect_usage,local_integrity
from studio.preflight_v12 import check

CAT={'assets':[
    {'id':'a','type':'photo','source_description':'archival photo','license_gate':'pending','capture_date':None},
    {'id':'b','type':'video','source_description':'synthetic video','license_gate':'synthetic','capture_date':None},
    {'id':'c','type':'video','source_url':'https://commons.wikimedia.org','license_gate':'pending',
     'capture_date':'2017-12-08','license_review_pending':True}
]}
PLAN={'project_id':'archival-test','shots':[
    {'asset_id':'a','editorial_role':'context','on_screen_disclosure':'CONTEXTO · DATA NÃO VERIFICADA'},
    {'asset_id':'b','editorial_role':'graphic_simulation','on_screen_disclosure':'SIMULAÇÃO GRÁFICA'},
]}
VOICE={'status':'GENERATED_NOT_IMPORTED','duration_sec_reported':20.7122}

def test_catalog_is_not_rights_certification():
    r=analyze_catalog(CAT)
    assert not r['errors'] and r['rights_verified_count']==0

def test_internal_preview_can_use_labeled_sources():
    assert inspect_usage(CAT,PLAN['shots'])['pass']

def test_publication_is_blocked_for_unlicensed_stills_and_generated_content():
    r=check(CAT,PLAN,VOICE,public=True)
    assert not r['ready_for_publication']
    assert any('rights' in s for s in r['failures'])
    assert any('voice audio' in s for s in r['failures'])

def test_2017_source_cannot_be_used_as_1962_event_proof():
    claim=[{'asset_id':'c','editorial_role':'event_evidence','event_date':'1962-01-27'}]
    assert not inspect_usage(CAT,claim)['pass']

def test_unlabeled_synthetic_is_rejected():
    bad=[{'asset_id':'b','editorial_role':'graphic_simulation','on_screen_disclosure':'VIDEO REAL'}]
    assert not inspect_usage(CAT,bad)['pass']

def test_hash_never_grants_rights(tmp_path):
    a=tmp_path/'file.bin';a.write_bytes(b'original test')
    catalog={'assets':[{'id':'local','type':'photo','source_description':'test','license_gate':'pending','local_path':'file.bin'}]}
    report=local_integrity(catalog,tmp_path)
    assert report['assets'][0]['sha256']
    assert inspect_usage(catalog,[{'asset_id':'local','editorial_role':'context','on_screen_disclosure':'CONTEXTO'}],public=True)['blocked']

def test_nonexistent_voice_is_not_synchronized():
    report=check(CAT,PLAN,VOICE)
    assert report['voice']['audio_present'] is False
    assert report['distribution_action_taken'] is False
