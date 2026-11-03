import pytest
from studio.archive_rights_gate_v40 import can_use_film_frames,review_manifest,CINEMATECA_RECORD

def test_catalog_is_metadata_only():
    assert can_use_film_frames(CINEMATECA_RECORD) is False

def test_no_1953_video_allowed():
    with pytest.raises(PermissionError):
        can_use_film_frames(CINEMATECA_RECORD,provided_media="downloaded.mp4")

def test_unverified_license_claim_fails():
    with pytest.raises(PermissionError):
        can_use_film_frames({**CINEMATECA_RECORD,"licensed":True})

def test_wrong_catalog_number_fails():
    with pytest.raises(ValueError):
        can_use_film_frames({**CINEMATECA_RECORD,"catalog":"999999"})

def test_context_photo_label_cannot_be_movie_frame():
    with pytest.raises(ValueError):
        review_manifest([{"kind":"photo_context","year":1941,"sha1":"x","claimed_as_1953_frame":True}])

def test_approved_context_photo_metadata():
    assert review_manifest([{"kind":"photo_context","year":1969,"sha1":"pinned"}])
