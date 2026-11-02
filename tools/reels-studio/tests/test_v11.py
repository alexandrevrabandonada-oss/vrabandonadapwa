"""V0.11: actual clip action QA, simulated provenance and expressive video integration."""
import sys,cv2,numpy as np,pytest,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.actionqa import motion_between,inspect_clip
from studio.render_v11 import V11World,render

ROOT=Path(__file__).resolve().parents[1]
CLIP=ROOT/'lab_assets/kinetic_industrial_simulation.mp4'
MANIFEST=ROOT/'examples/ferro_em_ebulicao_v11.json'

def test_local_action_vs_global_camera_motion():
    rng=np.random.default_rng(25)
    first=cv2.GaussianBlur(rng.integers(0,256,(180,320,3),dtype=np.uint8),(9,9),2)
    second=cv2.warpAffine(first,np.float32([[1,0,7],[0,1,3]]),(320,180),borderMode=cv2.BORDER_REFLECT)
    cam=motion_between(first,second)
    assert cam['camera_motion_px']>3
    assert cam['local_motion_p95_px']<1.5
    assert motion_between(first,first)['local_motion_p95_px']<0.01

def test_small_moving_subject_detected_after_background_removal():
    bg=np.full((180,320,3),(10,40,80),np.uint8)
    a=bg.copy();b=bg.copy()
    cv2.rectangle(a,(40,30),(110,110),(250,150,60),-1)
    cv2.rectangle(b,(65,38),(135,118),(250,150,60),-1)
    assert motion_between(a,b)['local_motion_p95_px']>2

def test_real_video_reader_reports_motion_with_uncertainty():
    report=inspect_clip(CLIP)
    assert report['has_substantial_local_action']
    assert report['analyzed_pairs']>=4
    assert report['status']=='HEURISTIC_REQUIRES_HUMAN_INSPECTION'

def test_source_rights_and_simulation_not_misrepresented():
    man=json.loads(MANIFEST.read_text())
    assert man['visual_rules']['publication_blocked']
    assert man['motion_clips']['action_lab']['role']=='simulation'
    man['motion_clips']['action_lab']['on_screen_label']='CSN 1962'
    with pytest.raises(ValueError,match='visibly marked'):V11World(man,ROOT)
    man['motion_clips']['action_lab']['on_screen_label']='SIMULAÇÃO GRÁFICA'
    man['scenes'][1]['kind']='document_world'
    with pytest.raises(ValueError):V11World(man,ROOT)

def test_reusable_engine_on_independent_short_synthetic_clip(tmp_path):
    man=json.loads(MANIFEST.read_text())
    # Use existing safe and local media, plus abbreviated studio test. No publication.
    man['scenes']=[man['scenes'][1]]
    man['scenes'][0]['duration']=1.
    man['output']={'width':270,'height':480,'fps':8}
    engine=V11World(man,ROOT)
    frame_a=engine.frame(.10);frame_b=engine.frame(.78)
    engine.close()
    assert frame_a.shape==(480,270,3)
    assert float(np.mean(np.abs(frame_a.astype(float)-frame_b.astype(float))))>4
    assert man['visual_rules']['publication_blocked']