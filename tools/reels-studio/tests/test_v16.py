"""V0.16 recorded footage: chronology, disclosure, integrity and no synthetic-as-news."""
from pathlib import Path
import cv2
import numpy as np
import pytest
from studio.moving_source_v16 import MovingSource,required_label,staged_frame,verify_clip

def make_clip(tmp_path):
    p=tmp_path/'clip.avi'
    w=cv2.VideoWriter(str(p),cv2.VideoWriter_fourcc(*'MJPG'),12,(128,192))
    for i in range(18):
        a=np.zeros((192,128,3),np.uint8);cv2.circle(a,(18+i*5,88),15,(220,150,60),-1);w.write(a)
    w.release()
    return p

def test_synthetic_clip_never_self_authorizes(tmp_path):
    src=MovingSource(make_clip(tmp_path),'synthetic_lab','laboratorio','VR Abandonada')
    assert not src.errors()
    assert src.errors(publish=True)
    assert 'SIMULAÇÃO GRÁFICA' in required_label(src)
    assert src.provenance()['publication_approved'] is False

def test_recorded_context_needs_complete_license(tmp_path):
    p=make_clip(tmp_path)
    a=MovingSource(p,'licensed_recorded','Senegal','4MAPS',capture_date='2024-03-05')
    assert any('incomplete' in x for x in a.errors())

def test_real_location_never_claimed_as_other_year(tmp_path):
    p=make_clip(tmp_path)
    a=MovingSource(p,'unverified_recorded','Senegal','4MAPS',capture_date='2024-03-05')
    assert 'SENEGAL' in required_label(a) and '2024-03-05' in required_label(a)
    assert a.errors(publish=True)

def test_frame_loader_reports_actual_moving_frame(tmp_path):
    p=make_clip(tmp_path)
    src=MovingSource(p,'synthetic_lab','lab','creator')
    cap=cv2.VideoCapture(str(p))
    try:
        a=staged_frame(cap,.0,108,192,src)
        b=staged_frame(cap,.7,108,192,src)
        assert a.shape==(192,108,3)
        assert float(np.mean(np.abs(a.astype(float)-b.astype(float))))>1
    finally:cap.release()
    assert verify_clip(p)['recorded_action_verified'] is False

def test_missing_file_fails_closed(tmp_path):
    a=MovingSource(tmp_path/'missing.webm','licensed_recorded','Senegal','author')
    assert a.errors()
    with pytest.raises(ValueError):verify_clip(a.path)
