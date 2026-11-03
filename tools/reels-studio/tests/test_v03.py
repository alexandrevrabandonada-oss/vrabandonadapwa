"""V0.3 proof: cinema compositing without synthetic archival evidence."""
import sys
from pathlib import Path
import cv2
import numpy as np
import pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio.cinema import filmic_grade,camera_plane,light_pass,depth_compose,documentary_stage
from studio.factory import validate,render

def make_project(tmp_path):
    a=np.zeros((100,180,3),np.uint8);a[:]=(140,90,50)
    b=np.zeros_like(a);b[:]=(30,30,40)
    mask=np.zeros((100,180),np.uint8);cv2.rectangle(mask,(50,10),(110,89),255,-1)
    cv2.imwrite(str(tmp_path/'src.jpg'),a)
    cv2.imwrite(str(tmp_path/'bg.jpg'),b)
    cv2.imwrite(str(tmp_path/'mask.png'),mask)
    return {'project_id':'v03-fixture','assets':{
      k:{'file':n,'source':'synthetic unit test','capture_date':'generated','rights_status':'cleared','role':'illustration'}
      for k,n in [('photo','src.jpg'),('bg','bg.jpg'),('mask','mask.png')]},
      'narration':{},'human_approval':{'approved':False},
      'scenes':[{'id':'sh1','asset':'photo','background_asset':'bg','mask_asset':'mask','type':'parallax','duration':1.,
      'cinema':{'grade':'molten','grade_intensity':.7,'light':'warm','perspective':.01,'depth_focus':.22},
      'camera':{'from':[.48,.52,1.],'to':[.56,.5,1.08]}}]}

def test_deterministic_film_grade():
    a=np.full((160,96,3),86,np.uint8);a[:20,:,:]=220
    assert np.array_equal(filmic_grade(a,'molten',.7,10),filmic_grade(a,'molten',.7,10))
    assert not np.array_equal(filmic_grade(a,'molten',.7,10),filmic_grade(a,'steel-blue',.7,10))
    assert np.array_equal(a,filmic_grade(a,'neutral',.7,10))

def test_layer_depth_and_motion():
    bg=np.full((40,40,3),20,np.uint8);fg=np.full((40,40,3),220,np.uint8)
    mask=np.zeros((40,40),np.uint8);mask[10:30,10:30]=255
    out=depth_compose(bg,fg,mask,0)
    assert out[20,20,0]>190 and out[0,0,0]<40
    assert not np.array_equal(camera_plane(fg,.7),light_pass(fg,.7))

def test_whole_document_not_cropped():
    a=np.zeros((200,130,3),np.uint8)
    a[:4,:4]=(255,0,0);a[:4,-4:]=(0,255,0)
    a[-4:,:4]=(0,0,255);a[-4:,-4:]=(250,250,250)
    stage=documentary_stage(a,300,520)
    for color in [(255,0,0),(0,255,0),(0,0,255),(250,250,250)]:
        assert np.any(np.all(stage==color,axis=2))

def test_primary_document_rejects_visual_fiction(tmp_path):
    p=make_project(tmp_path);sc=p['scenes'][0]
    sc['type']='document';sc['source_label']='TEST';sc['cinema']={'grade':'industrial-ink'}
    assert any('evidence cannot receive' in e for e in validate(p,tmp_path)['errors'])

def test_render_variants_and_block_unknown_grade(tmp_path):
    p=make_project(tmp_path)
    assert validate(p,tmp_path)['ok']
    report=render(p,tmp_path,tmp_path/'demo.mp4','preview',sample_fps=4)
    assert report['frames']==4
    p['scenes'][0]['cinema']['grade']='synthetic_explosion'
    assert any('grade unknown' in e for e in validate(p,tmp_path)['errors'])

def test_effect_parameters_have_bounded_limits(tmp_path):
    p=make_project(tmp_path)
    p['scenes'][0]['cinema']['perspective']=0.9
    assert any('perspective exceeds safety limit' in e for e in validate(p,tmp_path)['errors'])
    p['scenes'][0]['cinema']['perspective']=.015
    p['scenes'][0]['cinema']['light_opacity']=.9
    assert any('light opacity invalid' in e for e in validate(p,tmp_path)['errors'])
