"""V17: the source hash must guard actual film, and scene labels cannot claim CSN."""
import subprocess
from pathlib import Path
import cv2,numpy as np,pytest
from studio.real_footage_v17 import SOURCE_SHA1,SOURCE_PAGE,command,verify_and_render

def fixture(tmp_path):
    p=tmp_path/"lab.mp4"
    w=cv2.VideoWriter(str(p),cv2.VideoWriter_fourcc(*"mp4v"),12,(480,270))
    for i in range(36):
        frame=np.full((270,480,3),(60,50,39),np.uint8)
        cv2.rectangle(frame,(i*5,20),(i*5+80,160),(240,130,40),-1)
        w.write(frame)
    w.release()
    return p

def test_cannot_replace_real_clipped_media_with_lab(tmp_path):
    p=fixture(tmp_path)
    with pytest.raises(ValueError,match="SHA1 mismatch"):
        verify_and_render(p,tmp_path/"output.mp4")

def test_expected_source_and_disclosure():
    assert len(SOURCE_SHA1)==40
    assert "commons.wikimedia.org" in SOURCE_PAGE
    cmd=command(Path("/tmp/documentary.webm"),Path("/tmp/reel.mp4"))
    filt=cmd[cmd.index("-filter_complex")+1]
    assert "SENEGAL 2024" in filt and "CC BY-SA 4.0" in filt
    assert "CSN" not in filt and "1962" not in filt
    assert "-map" in cmd and "-t" in cmd

def test_render_fixture_requires_explicit_testing_override(tmp_path):
    p=fixture(tmp_path);out=tmp_path/"test.mp4"
    # Shorter clip is allowed only for explicit synthetic fixture mode.
    r=verify_and_render(p,out,require_hash=False,width=360,height=640)
    assert out.exists() and r["is_CSN_footage"] is False
    assert r["distribution_approval"] is False
    assert r["width"]==360 and r["height"]==640
