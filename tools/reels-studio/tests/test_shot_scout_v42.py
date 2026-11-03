"""Tests of motion-first auto-shot selection independent of private media bytes."""
from pathlib import Path
import json
import cv2,numpy as np,pytest
from studio import shot_scout_v42 as S
from studio import auto_director_v42 as R


def dummy_reports():
 def cand(key,t,score,bits):
  return {'source_id':key,'at_sec':t,'motion':score,'hash64':bits,'duration':1.8,'region':'test','kind':S.SOURCES[key]['role']}
 return {'france_2011':{'meta':{'id':'france_2011',**S.SOURCES['france_2011']},
   'candidates':[cand('france_2011',1,0.15,'0'*64),cand('france_2011',10,0.14,'1'*64),cand('france_2011',19,0.13,'0'*32+'1'*32)]},
  'rodovia_2017':{'meta':{'id':'rodovia_2017',**S.SOURCES['rodovia_2017']},
   'candidates':[cand('rodovia_2017',70,.03,'1'*64)]}}

def test_builds_six_timeline_shots():
 plan=S.build_edit_plan(dummy_reports());shots=plan['shots']
 assert len(shots)==6 and shots[-1]['end']==16
 assert S.check_edit_plan(shots)
 assert len({x['source_id'] for x in shots})==5
 assert len({x['grammar'] for x in shots})==6

def test_preserves_original_sources_and_years():
 plan=S.build_edit_plan(dummy_reports())
 assert [x['source_id'] for x in plan['shots'][:3]]==['csn_1941','csn_1969','rodovia_2017']
 assert plan['purpose']=='INTERNAL_ONLY' and plan['publication_approved'] is False
 assert plan['voice_embedded'] is False

def test_never_misattributes_french_film_to_csn():
 shots=S.build_edit_plan(dummy_reports())['shots'];shots[3]['credit']='VIDEO CSN 2011'
 with pytest.raises(ValueError,match='French'):S.check_edit_plan(shots)

def test_interview_video_cannot_be_called_industrial_action():
 with pytest.raises(ValueError,match='Requested role'):
  S.select_windows(dummy_reports()['rodovia_2017'],role='industrial_action',count=1)

def test_regional_news_must_be_labeled_as_2017_road_report():
 shots=S.build_edit_plan(dummy_reports())['shots'];shots[2]['credit']='FILMAGEM INDUSTRIAL CSN'
 with pytest.raises(ValueError,match='2017 interview'):S.check_edit_plan(shots)

def test_cannot_hide_timeline_gap():
 shots=S.build_edit_plan(dummy_reports())['shots'];shots[2]['start']=6
 with pytest.raises(ValueError,match='discontinuous'):S.check_edit_plan(shots)

def test_source_hash_blocked(tmp_path):
 f=tmp_path/'source.webm';f.write_bytes(b'not video')
 with pytest.raises(ValueError,match='hash mismatch'):S.verify_media('france_2011',f)

def test_unknown_source_fails_before_render(tmp_path):
 with pytest.raises(ValueError,match='unknown'):S.verify_media('inexistent',tmp_path/'any.file')

def test_auto_selection_rejects_near_duplicate():
 data=dummy_reports()['france_2011']
 data['candidates'][1]['hash64']='0'*64
 selected=S.select_windows(data,role='industrial_action',count=2,min_gap=3)
 assert [x['at_sec'] for x in selected]==[1,19]

def test_window_requires_diverse_material():
 data=dummy_reports()['roadovia_2017'] if False else dummy_reports()['rodovia_2017']
 with pytest.raises(ValueError,match='insufficient'):
  S.select_windows(data,role='interview',count=2)

def test_direction_grammar_uses_real_pixel_motion():
 img=np.zeros((600,900,3),np.uint8)
 img[:,:,0]=np.tile(np.linspace(20,230,900,dtype='uint8'),(600,1))
 shot=S.build_edit_plan(dummy_reports())['shots'][0]
 a=R.dynamic_stage(img,shot,.1,'kinetic')
 b=R.dynamic_stage(img,shot,1.3,'kinetic')
 assert a.shape==(R.Y1-R.Y0,1016,3)
 assert np.mean(np.abs(a.astype('float32')-b.astype('float32')))>5

def test_variants_have_same_sources_but_different_camera():
 img=np.random.default_rng(5).integers(0,255,(400,630,3),dtype='uint8')
 shot=S.build_edit_plan(dummy_reports())['shots'][1]
 a=R.dynamic_stage(img,shot,.3,'kinetic')
 b=R.dynamic_stage(img,shot,.3,'restrained')
 assert a.shape==b.shape
 assert np.mean(np.abs(a.astype('float32')-b.astype('float32')))>0.15

def test_actual_frame_has_two_cadences_for_type():
 shot=S.build_edit_plan(dummy_reports())['shots'][0]
 a=R.title_layer(shot,'kinetic')
 assert a.shape==(1080,205,4) or a.shape==(205,1080,4)
 image=np.zeros((1920,1080,3),np.uint8)
 R.animated_title(image,a,.12,2.5,'kinetic',0)
 assert image[:223].sum()>0

def test_source_type_rejects_invalid_video_role():
 with pytest.raises(ValueError,match='registered video'):
  S.analyze_video(Path('/unlikely'), 'csn_1969')

def test_hamming_rejects_malformed_bits():
 with pytest.raises(ValueError,match='invalid'):
  S.hamming('000','111')
