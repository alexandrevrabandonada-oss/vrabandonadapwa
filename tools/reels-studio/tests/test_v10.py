"""V0.10: real mask-registered photo depth, integrity and factory integration."""
import sys
from pathlib import Path
import numpy as np,cv2,pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.depth_stage import DepthStage
from studio.factory import validate,Engine

def layers():
    h,w=170,260
    bg=np.zeros((h,w,3),np.uint8);bg[:]=[18,36,70]
    fg=bg.copy();cv2.circle(fg,(120,78),45,(190,165,100),-1)
    mask=np.zeros((h,w),np.uint8);cv2.circle(mask,(120,78),45,255,-1)
    return fg,bg,mask

def test_parallax_has_real_animated_occlusion():
    fg,bg,mask=layers();stage=DepthStage(fg,bg,mask,108,192)
    start=stage.frame(0);end=stage.frame(1)
    assert start.shape==(192,108,3)
    assert abs(start.astype(float)-end.astype(float)).mean()>1.
    assert np.array_equal(end,stage.frame(1))

def test_registered_sources_and_immutability():
    fg,bg,mask=layers();original=fg.copy()
    with pytest.raises(ValueError):DepthStage(fg,bg,mask[:10],108,192)
    stage=DepthStage(fg,bg,mask,108,192)
    stage.frame(.7)
    assert np.array_equal(fg,original)

def test_safe_staging_geometry():
    fg,bg,mask=layers()
    with pytest.raises(ValueError):DepthStage(fg,bg,mask,108,192,strength=4)
    assert DepthStage(fg,bg,mask,108,192).frame(.5,subtle=True).shape==(192,108,3)

def test_factory_uses_physical_mode_without_unblocking_publish(tmp_path):
    fg,bg,mask=layers()
    for file,img in [('fg.png',fg),('bg.png',bg),('mask.png',mask)]:
        assert cv2.imwrite(str(tmp_path/file),img)
    assets={name:{'file':file,'role':'illustration','source':'synthetic pytest fixture',
                   'rights_status':'restricted','capture_date':'generated'}
            for name,file in [('fg','fg.png'),('bg','bg.png'),('mask','mask.png')]}
    p={'project_id':'parallax-smoke','assets':assets,'human_approval':{'approved':False},'narration':{},
       'scenes':[{'id':'physical','type':'parallax','asset':'fg','background_asset':'bg',
             'mask_asset':'mask','depth_mode':'physical','duration':1.0,
             'direction':{'subject':'Synthetic coil','intent':'Test layer occlusion',
             'camera_motive':'Move subject relative to background','cut_motive':'Change of scale'}}]}
    assert validate(p,tmp_path)['ok']
    assert not validate(p,tmp_path,'publish')['ok']
    engine=Engine(p,tmp_path,108,192,8)
    try:
        a=engine.frame(p['scenes'][0],.0,decorate=False)
        b=engine.frame(p['scenes'][0],.9,decorate=False)
        assert np.mean(np.abs(a.astype(float)-b.astype(float)))>1.
    finally:engine.close()

def test_document_must_not_enable_physical_context():
    p={'project_id':'bad','assets':{},'narration':{},'human_approval':{'approved':False},
       'scenes':[{'id':'a','type':'document','depth_mode':'physical','duration':1}]}
    assert any('restricted to parallax' in x for x in validate(p,Path('.'))['errors'])
