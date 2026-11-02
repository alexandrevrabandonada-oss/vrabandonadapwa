"""V0.7 regression tests: fidelity, bounded memory, deterministic cached transitions."""
import sys
from pathlib import Path
import numpy as np, cv2, pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.fast_stills import PreparedStill,BoundedStillCache
from studio.factory import zoom_crop
from studio.visual_grammar import composite,_threshold_field

def test_photo_camera_cache_matches_source_geometry():
    rng=np.random.default_rng(9)
    src=cv2.GaussianBlur(rng.integers(0,256,size=(250,420,3),dtype=np.uint8),(5,5),1.3)
    p=PreparedStill.build(src,180,320,1.14)
    for z in (1,1.035,1.085,1.14):
        a=zoom_crop(src,180,320,.51,.49,z)
        b=p.crop(.51,.49,z)
        assert a.shape==b.shape
        assert float(np.mean(np.abs(a.astype(np.float32)-b.astype(np.float32))))<11

def test_cache_is_bounded_and_does_not_reuse_wrong_source():
    arr=np.ones((200,320,3),np.uint8)*37
    cache=BoundedStillCache(limit_bytes=190_000)
    assert cache.get(('a',1),arr,150,250,1.03) is None
    assert cache.stats()['skipped']==1
    cache2=BoundedStillCache(limit_bytes=8_000_000)
    first=cache2.get(('scene1','photo'),arr,150,250,1.03)
    second=cache2.get(('scene1','photo'),arr,150,250,1.03)
    assert first is second and cache2.stats()['hits']==1
    assert cache2.stats()['resident_bytes']<=cache2.stats()['limit_bytes']

def reference_transition(prev,cur,t,style):
    h,w=prev.shape[:2]
    yy,xx=np.mgrid[0:h,0:w];nx=xx/max(1,w-1);ny=yy/max(1,h-1)
    if style=='print_registration':
        ridge=.045*np.sin(16*ny+3*np.sin(ny*7))+.025*np.sin(41*ny)
        mask=nx<t*1.20-.12+ridge
    elif style=='slag_reveal':
        phase=nx*.73+ny*.27
        jitter=.018*np.sin(19*nx+21*ny)+.018*np.sin(57*nx-13*ny)
        mask=phase+jitter<t*1.17-.08
    else:
        band=np.floor(ny*7).astype(int)
        mask=np.abs(nx-.5)+(band%3)*.038<t*.72
    return np.where(mask[:,:,None],cur,prev).astype(np.uint8)

@pytest.mark.parametrize('style',['print_registration','slag_reveal','press_gate'])
def test_cached_transitions_match_v06(style):
    a=np.full((128,72,3),(28,60,88),np.uint8)
    b=np.full((128,72,3),(222,77,41),np.uint8)
    for progress in (.1,.33,.58,.87):
        exact=reference_transition(a,b,progress,style)
        optimized=composite(a,b,progress,style)
        mismatches=np.any(exact!=optimized,axis=2)
        assert np.mean(mismatches)<.007

def test_transition_geometry_cache_reuses_matrix():
    assert _threshold_field(64,72,'slag_reveal') is _threshold_field(64,72,'slag_reveal')

def test_invalid_zoom_rejected():
    arr=np.zeros((48,60,3),np.uint8)
    with pytest.raises(ValueError):PreparedStill.build(arr,180,320,2.8)
    p=PreparedStill.build(arr,180,320,1.2)
    with pytest.raises(ValueError):p.crop(.5,.5,1.4)
