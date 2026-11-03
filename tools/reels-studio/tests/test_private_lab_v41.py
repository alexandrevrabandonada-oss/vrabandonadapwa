import hashlib
import json
from pathlib import Path
import pytest
from studio.archive_rights_gate_v40 import CINEMATECA_RECORD, can_use_film_frames, review_manifest
from studio.private_media_ingest_v41 import intake, gate


def test_1953_film_file_permitted_as_private_research():
    assert can_use_film_frames(CINEMATECA_RECORD, provided_media='/private/research.mov')


def test_1953_film_catalog_alone_is_not_video():
    assert can_use_film_frames(CINEMATECA_RECORD) is False


def test_public_release_requires_independent_clearance():
    with pytest.raises(PermissionError):
        can_use_film_frames({**CINEMATECA_RECORD, 'licensed': True},
                            provided_media='internal_copy.mp4', mode='public_release')


def test_1953_movie_is_not_1962_accident():
    with pytest.raises(ValueError):
        review_manifest([{**CINEMATECA_RECORD,'kind':'film_1953',
                          'path':'internal_copy.mp4','claimed_as_csn_accident_1962':True}])


def test_internal_film_manifest_passes():
    r=review_manifest([{**CINEMATECA_RECORD,'kind':'film_1953','path':'private_film.mp4'}])
    assert r['accepted'] and not r['publicly_releasable']


def test_private_intake_copies_and_pins_hash(tmp_path):
    src=tmp_path/'historical.webm'
    src.write_bytes(b'example reproducible test bytes')
    rec=intake(src,tmp_path/'private_assets',origin='catalogue://fixture',label='Context film',
               license_status='pending',capture_year=1953)
    dest=Path(rec['private_path'])
    assert dest.read_bytes()==src.read_bytes()
    assert rec['sha256']==hashlib.sha256(src.read_bytes()).hexdigest()
    assert rec['publication_approved'] is False
    assert gate([rec],'internal_research')['allowed']
    with pytest.raises(PermissionError): gate([rec],'public_release')


def test_no_origin_or_false_metadata(tmp_path):
    src=tmp_path/'photo.jpg';src.write_bytes(b'fixture')
    with pytest.raises(ValueError): intake(src,tmp_path/'vault',origin='',label='CSN')
    with pytest.raises(ValueError): intake(src,tmp_path/'vault',origin='local',label='')


def test_repeated_ingestion_is_idempotent(tmp_path):
    src=tmp_path/'photo.jpg';src.write_bytes(b'fixture')
    a=intake(src,tmp_path/'vault',origin='local',label='Context photograph')
    b=intake(src,tmp_path/'vault',origin='local',label='Context photograph')
    assert a['sha256']==b['sha256'] and a['private_path']==b['private_path']


def test_never_export_private_media_by_default(tmp_path):
    src=tmp_path/'recording.mp3';src.write_bytes(b'private recording')
    rec=intake(src,tmp_path/'vault',origin='user-supplied',label='Narration')
    assert rec['upload_to_public_repo'] is False
    receipt=tmp_path/'vault'/f'{rec["sha256"][:16]}_recording.receipt.json'
    assert json.loads(receipt.read_text())['mode']=='internal_research'


def test_bad_purpose_and_unpinned_source_fail():
    with pytest.raises(ValueError):gate([{'origin':'a'}],'internal_research')
    with pytest.raises(ValueError):
        gate([{'origin':'a','source_integrity_verified':True}],'publish_at_once')


def test_public_release_cannot_pass_pending_asset_even_with_approvals():
    rec={'origin':'private','source_integrity_verified':True,'license_status':'pending'}
    with pytest.raises(PermissionError):
        gate([rec],'public_release',rights_reviewed=True,
             editorial_approved=True,fact_checked=True)


def test_verified_public_release_requires_all_gates():
    rec={'origin':'test','source_integrity_verified':True,'license_status':'cleared'}
    assert gate([rec],'public_release',rights_reviewed=True,
                editorial_approved=True,fact_checked=True)['publication_approved']
