"""Aço Gráfico V18: actual sources, rights labels and independent scene designs."""
import cv2
import numpy as np
import pytest
from studio.editorial_multisource_v18 import SOURCES,source_check,Reader,stage,text_frame

def fixture(tmp_path):
    paths={}
    for k,seed in [('senegal',4),('france',13)]:
        p=tmp_path/(k+'.avi')
        wr=cv2.VideoWriter(str(p),cv2.VideoWriter_fourcc(*'MJPG'),8,(120,90))
        for i in range(100):
            frame=np.full((90,120,3),(seed*2,seed*3,seed*4),np.uint8)
            cv2.circle(frame,(int(20+i*.65),45),15,(240,95,120),-1)
            wr.write(frame)
        wr.release()
        paths[k]=p
    return paths

def test_wrong_or_fake_footage_rejected(tmp_path):
    p=fixture(tmp_path)
    with pytest.raises(ValueError,match='HASH_MISMATCH'):
        source_check(p['senegal'],'senegal')
    assert SOURCES['senegal']['country']=='Senegal'
    assert SOURCES['france']['license']=='CC BY 3.0'

def test_multiple_recorded_sources_drive_distinct_scenes(tmp_path):
    p=fixture(tmp_path);r={k:Reader(v) for k,v in p.items()}
    try:
        frames=[stage(r,t,270,480) for t in (0.8,4.1,7.2,11.0)]
    finally:
        for reader in r.values():reader.close()
    assert all(f.shape==(480,270,3) for f in frames)
    assert np.mean(abs(frames[0].astype(float)-frames[1].astype(float)))>3
    assert np.mean(abs(frames[1].astype(float)-frames[2].astype(float)))>3
    for i,t in enumerate((.8,4.1,7.2,11.)):
        rendered=text_frame(frames[i],t,270,480)
        assert rendered.shape==frames[i].shape

def test_sources_have_full_provenance():
    for key in ('senegal','france'):
        s=SOURCES[key]
        assert len(s['sha1'])==40
        assert 'creativecommons.org' in s['license_url']
        assert 'commons.wikimedia.org' in s['url']
        assert s['credit']
