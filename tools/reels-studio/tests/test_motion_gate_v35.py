"""V35 motion evidence contract tests. Does not certify aesthetics."""
import numpy as np
import pytest
from studio.motion_gate_v35 import change_fraction, validate_identity, CHOREOGRAPHY

def good_manifest():
    return {
        "real_film_sha1":"c1129cac8654866856c7bec31196206f16eac6c7",
        "choreography":list(CHOREOGRAPHY),
        "narration_embedded":False,"publication_approved":False,
        "historical_photo_source_years":[1941,1969,2014],
    }

def test_sources_and_eight_grammars():
    validate_identity(good_manifest())
    assert len(set(CHOREOGRAPHY))==8

def test_cannot_fake_embedded_voice():
    m=good_manifest();m["narration_embedded"]=True
    with pytest.raises(ValueError,match="speech"):validate_identity(m)

def test_foreign_footage_not_replaced():
    m=good_manifest();m["real_film_sha1"]="CSN_RJ"
    with pytest.raises(ValueError,match="French"):validate_identity(m)

def test_historical_chronology_is_immutable():
    m=good_manifest();m["historical_photo_source_years"]=[1941,1962,2014]
    with pytest.raises(ValueError,match="Historical"):validate_identity(m)

def test_publication_gate_cannot_be_bypassed():
    m=good_manifest();m["publication_approved"]=True
    with pytest.raises(ValueError,match="published"):validate_identity(m)

def test_motion_computation_detects_real_changes():
    a=np.zeros((100,80,3),dtype="uint8")
    b=np.ones((100,80,3),dtype="uint8")*200
    assert change_fraction(a,a)==0
    assert change_fraction(a,b)==1

def test_audio_flag_is_not_visual_motion():
    m=good_manifest();m["narration_embedded"]=False
    validate_identity(m)

def test_missing_frame_rejected():
    with pytest.raises(ValueError):change_fraction(None,np.zeros((20,20,3),dtype="uint8"))

def test_incompatible_resolution_rejected():
    with pytest.raises(ValueError):change_fraction(np.zeros((20,20,3),dtype="uint8"),np.zeros((30,20,3),dtype="uint8"))

def test_invalid_detection_threshold_rejected():
    a=np.zeros((20,20,3),dtype="uint8")
    with pytest.raises(ValueError):change_fraction(a,a,threshold=0)
