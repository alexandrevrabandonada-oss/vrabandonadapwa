import json,sys, tempfile,copy
from pathlib import Path
import numpy as np
import pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.factory import load_project,validate,zoom_crop,transparent_overlay,scorecard,local_file,Engine,probe
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'examples/o_peso_do_aco.json'
TEST_ROOT=ROOT
if not (ROOT/'private_assets/csn_exterior.jpg').exists():
    # A source-only checkout carries no third-party archives. Generate temporary
    # deterministic image fixtures solely for tests, never for news publication.
    from PIL import Image,ImageDraw
    TEST_ROOT=Path(tempfile.mkdtemp(prefix='vr-reels-test-'))
    (TEST_ROOT/'synthetic').mkdir(parents=True,exist_ok=True)
    for j in range(6):
        im=Image.new('RGB',(640,820),(35+j*15,65+j*8,90+j*7))
        ImageDraw.Draw(im).rectangle((60,220,520,650),outline='white',width=6)
        im.save(TEST_ROOT/'synthetic'/f'{j}.jpg')

def project():
    m=load_project(MANIFEST)
    if TEST_ROOT != ROOT:
        for j,(aid,asset) in enumerate(m['assets'].items()):
            asset['file']=f'synthetic/{j}.jpg'
            asset.pop('sha256',None)
    return m

def test_internal_manifest_valid():
    r=validate(project(), TEST_ROOT)
    assert r['ok'] and r['asset_count']==6 and r['scene_count']==4
    assert r['duration_sec']==15.0
    assert any('narration not embedded' in x for x in r['warnings'])

def test_publication_blocked_when_rights_unknown():
    r=validate(project(),TEST_ROOT,'publish')
    assert not r['ok'] and not r['publishable']
    assert any('rights=' in x for x in r['errors'])
    assert any('human editorial approval' in x for x in r['errors'])

def test_claim_must_have_source():
    a=project();a['scenes'][2].pop('evidence_id')
    assert any('claim without evidence_id' in x for x in validate(a,TEST_ROOT)['errors'])

def test_traversal_fails():
    with pytest.raises(ValueError):local_file(TEST_ROOT,'../../etc/passwd')
    with pytest.raises(ValueError):local_file(TEST_ROOT,'https://example.com/abc.jpg')

def test_camera_frame_and_alpha():
    im=np.full((80,140,3),120,dtype=np.uint8)
    out=zoom_crop(im,54,96,.45,.55,1.05)
    assert out.shape==(96,54,3)
    mask=np.zeros((96,54),dtype=np.uint8);mask[:,10:20]=255
    other=np.full((96,54,3),30,dtype=np.uint8)
    dest=transparent_overlay(out,other,mask)
    assert int(dest[40,15,0])==30
    assert int(dest[40,25,0])==120

def test_scorecard_bounds_and_weights():
    data=json.loads((ROOT/'examples/scorecard_v7.json').read_text())
    out=scorecard(data['previous'],data['current'],data['weights'])
    assert 6.0<out['score']<7.0
    assert not out['approved']
    with pytest.raises(ValueError):scorecard(None,{'art_direction':11},{'art_direction':100})

def test_one_frame_of_real_project():
    eng=Engine(project(), TEST_ROOT,180,320,24)
    for sc in project()['scenes']:
        frame=eng.frame(sc,.4)
        assert frame.shape==(320,180,3)
        assert frame.std()>3
    eng.close()

def test_quality_gate_on_video_render():
    from studio.quality import audit
    vid=ROOT/'output/O_PESO_DO_ACO_FABRICA_DEMO_15s.mp4'
    if not vid.is_file(): pytest.skip('sample render not present')
    qa=audit(project(),TEST_ROOT,vid,False)
    assert not qa['passed'] and qa['audio_stream'] is False
    assert any('voice missing' in x for x in qa['issues'])
    assert qa['technical']['duration']==15.0


def test_one_second_other_story(tmp_path):
    """Proves renderer does not hardcode 1962, CSN or file paths."""
    from PIL import Image
    from studio.factory import render
    img=Image.new('RGB',(180,320),(90,111,143))
    image_path=tmp_path/'urbano.jpg'; img.save(image_path)
    mini={'project_id':'bairro-investigacao',
          'assets':{'urban':{'file':'urbano.jpg','role':'context','source':'sample generated test media','capture_date':'2026-11-01','rights_status':'cleared'}},
          'scenes':[{'id':'a','type':'photograph','asset':'urban','duration':0.3,'overlay':'CIDADE E MEMÓRIA'}]}
    result=render(mini,tmp_path,tmp_path/'other_reel.mp4','preview',sample_fps=6)
    assert result['frames']==2
    assert Path(result['output']).is_file()

def test_variants_keep_evidence_and_rights():
    from studio.iterate import create_variant
    baseline=project()
    for style in ('documental','cinematic','kinetic'):
        variant=create_variant(baseline,style)
        assert variant['assets']==baseline['assets']
        for orig,s in zip(baseline['scenes'],variant['scenes']):
            for fld in ['asset','claim','evidence_id','duration','context_label','source_label','overlay']:
                assert orig.get(fld)==s.get(fld)
        assert validate(variant,TEST_ROOT)['ok']

def test_priority_uses_weighted_deficits():
    from studio.iterate import prioritize
    inp=json.loads((ROOT/'examples/scorecard_v7.json').read_text())
    r=prioritize(inp)
    assert r['next_three'][0]['criterion']=='life'
    assert r['scorecard']['approved']==False

def test_voice_must_fit_timeline(tmp_path):
    import wave
    from studio.voice import attach_voice
    import numpy as np
    p=tmp_path/'project.json'
    m={'project_id':'voice-test','assets':{},'scenes':[{'duration':1.0}]}
    p.write_text(json.dumps(m))
    audio=tmp_path/'voice.wav'
    with wave.open(str(audio),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(8000)
        f.writeframes(np.zeros(16000,dtype='<i2').tobytes())
    with pytest.raises(ValueError,match='exceeds storyboard'):attach_voice(p,audio)


def test_voice_import_uses_resolvable_workspace_manifest(tmp_path):
    import wave
    from studio.voice import attach_voice
    from studio.factory import load_project,validate
    from PIL import Image
    workspace=tmp_path
    (workspace/'examples').mkdir();(workspace/'private_assets').mkdir()
    Image.new('RGB',(100,190),(32,50,65)).save(workspace/'private_assets'/'scene.jpg')
    proj={'project_id':'voice-attach-example','assets':{'scene':{'file':'private_assets/scene.jpg','role':'context','source':'synthetic test','capture_date':'2026-11-01','rights_status':'pending'}},
          'scenes':[{'id':'first','asset':'scene','type':'photograph','duration':1.5}],
          'narration':{'file':None,'timings_verified':False}}
    manifest=workspace/'examples'/'voice.json'
    manifest.write_text(json.dumps(proj))
    voice=workspace/'voice.wav'
    with wave.open(str(voice),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(8000)
        f.writeframes(np.zeros(8000,dtype='<i2').tobytes())
    got=attach_voice(manifest,voice)
    next_m=Path(got['manifest_draft'])
    assert next_m.exists()
    assert validate(load_project(next_m),workspace)['ok']
    assert Path(got['voice_imported']).is_file()
