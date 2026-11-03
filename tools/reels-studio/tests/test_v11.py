"""v0.11 tests generate synthetic media locally; never rely on user's restricted images."""
import sys,cv2,numpy as np,pytest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.actionqa import motion_between,inspect_clip
from studio.render_v11 import V11World

@pytest.fixture
def synthetic_workspace(tmp_path):
    (tmp_path/'lab_assets').mkdir();(tmp_path/'private_assets').mkdir()
    w,h=200,320;back=np.full((h,w,3),(18,47,100),np.uint8)
    assert cv2.imwrite(str(tmp_path/'private_assets/frame.png'),back)
    clip=tmp_path/'lab_assets/motion.mp4'
    writer=cv2.VideoWriter(str(clip),cv2.VideoWriter_fourcc(*'mp4v'),15,(w,h))
    if not writer.isOpened():raise RuntimeError('MP4v codec unavailable')
    for j in range(45):
        fr=back.copy();cv2.circle(fr,(30+j*3,158),32,(230,157,95),-1,cv2.LINE_AA)
        cv2.line(fr,(0,20+j//3),(w,20+j//3),(50,200,230),2)
        writer.write(fr)
    writer.release()
    manifest={'project_id':'test-v11','output':{'width':180,'height':320,'fps':12},
       'visual_rules':{'publication_blocked':True},
       'sources':{'photo':{'path':'private_assets/frame.png','role':'industrial_context','rights':'restricted',
                           'on_screen_label':'SIMULAÇÃO DE TESTE'}},
       'motion_clips':{'motion':{'path':'lab_assets/motion.mp4','role':'simulation','rights':'cleared',
                        'on_screen_label':'SIMULAÇÃO GRÁFICA · NÃO HISTÓRICA'}},
       'scenes':[{'id':'action','source':'photo','kind':'industrial_world','duration':1.,
                   'title':'TESTE','accent':'electric','motion':'moving_footage','clip_source':'motion'}]}
    return tmp_path,manifest,clip

def test_global_camera_vs_actual_subject():
    rng=np.random.default_rng(25)
    first=cv2.GaussianBlur(rng.integers(0,256,(180,320,3),dtype=np.uint8),(9,9),2)
    second=cv2.warpAffine(first,np.float32([[1,0,7],[0,1,3]]),(320,180),borderMode=cv2.BORDER_REFLECT)
    cam=motion_between(first,second)
    assert cam['camera_motion_px']>3
    assert cam['local_motion_p95_px']<1.5
    assert motion_between(first,first)['local_motion_p95_px']<.01

def test_small_moving_subject_detected():
    bg=np.full((180,320,3),(10,40,80),np.uint8);a=bg.copy();b=bg.copy()
    cv2.rectangle(a,(40,30),(110,110),(250,150,60),-1)
    cv2.rectangle(b,(65,38),(135,118),(250,150,60),-1)
    assert motion_between(a,b)['local_motion_p95_px']>2

def test_video_inspection_does_not_claim_certification(synthetic_workspace):
    _,_,clip=synthetic_workspace
    r=inspect_clip(clip)
    assert r['has_substantial_local_action']
    assert r['analyzed_pairs']>=4
    assert r['status']=='HEURISTIC_REQUIRES_HUMAN_INSPECTION'

def test_simulated_moving_media_cannot_claim_history(synthetic_workspace):
    root,m,_=synthetic_workspace
    assert m['visual_rules']['publication_blocked']
    m['motion_clips']['motion']['on_screen_label']='CSN 1962'
    with pytest.raises(ValueError,match='visibly marked'):V11World(m,root)
    m['motion_clips']['motion']['on_screen_label']='SIMULAÇÃO GRÁFICA'
    m['scenes'][0]['kind']='document_world'
    with pytest.raises(ValueError):V11World(m,root)

def test_reusable_video_scene_has_internal_action(synthetic_workspace):
    root,m,_=synthetic_workspace
    engine=V11World(m,root)
    try:a=engine.frame(.08);b=engine.frame(.83)
    finally:engine.close()
    assert a.shape==(320,180,3)
    assert np.abs(a.astype(float)-b.astype(float)).mean()>4
    assert m['visual_rules']['publication_blocked']