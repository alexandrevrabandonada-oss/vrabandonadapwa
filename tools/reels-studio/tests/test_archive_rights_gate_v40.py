import pytest
from studio.archive_rights_gate_v40 import can_use_film_frames, review_manifest, CINEMATECA_RECORD

def test_catalog_metadata_alone_is_not_media():
    assert can_use_film_frames(CINEMATECA_RECORD) is False

def test_accessible_film_allowed_in_private_research_even_if_rights_pending():
    assert can_use_film_frames(CINEMATECA_RECORD, provided_media='private_lab.mp4') is True

def test_self_declared_license_not_sufficient_for_public_distribution():
    with pytest.raises(PermissionError):
        can_use_film_frames({**CINEMATECA_RECORD,'licensed':True},
                            provided_media='private_lab.mp4', mode='public_release')

def test_wrong_catalog_number_fails():
    with pytest.raises(ValueError):
        can_use_film_frames({**CINEMATECA_RECORD,'catalog':'999999'})

def test_context_photo_label_cannot_be_movie_frame():
    with pytest.raises(ValueError):
        review_manifest([{'kind':'photo_context','year':1941,'sha1':'x',
                          'claimed_as_1953_frame':True}])

def test_approved_internal_context_photo_metadata():
    report=review_manifest([{'kind':'photo_context','year':1969,'sha1':'pinned'}])
    assert report['accepted'] and not report['publicly_releasable']
