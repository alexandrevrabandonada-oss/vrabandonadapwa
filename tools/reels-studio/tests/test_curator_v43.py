"""Offline synthetic checks: v43 does not guess semantics or distribute archives."""
import copy,math
import pytest
from studio import shot_curator_v43 as v
from studio import shot_scout_v42 as old

def fake(source, motions=None):
 role=old.SOURCES[source]
 motions=motions or [.015,.04,.085,.13,.20]
 cs=[]
 for i,m in enumerate(motions):
  cs.append(dict(source_id=source,at_sec=2+i*7,motion=m,cut_risk=.1,
   sharpness_quality=.8,exposure_quality=.8,
   hash64=('1'*(i*9)+'0'*(64-i*9)), duration=2.6))
 return dict(source={'id':source,**role},candidates=cs)

def test_distinct_paces_target_distinct_motion():
 a=dict(motion=.047,cut_risk=.1,sharpness_quality=.8,exposure_quality=.8)
 b=dict(a,motion=.027)
 assert v.score(a,'interview','cinematic') > v.score(b,'interview','cinematic')
 assert v.score(b,'interview','documental') > v.score(a,'interview','documental')

def test_motion_alone_does_not_win():
 clean=dict(motion=.115,cut_risk=.1,sharpness_quality=.8,exposure_quality=.8)
 flash=dict(motion=.2,cut_risk=.95,sharpness_quality=.12,exposure_quality=.12)
 assert v.score(clean,'industrial_action','cinematic') > v.score(flash,'industrial_action','cinematic')

def test_wrong_role_is_blocked():
 with pytest.raises(ValueError,match='genre'):
  v.rank(fake('rodovia_2017'),role='industrial_action',pace='cinematic',count=1)

def test_does_not_mutate_original_plan():
 base=old.build_edit_plan({'france_2011':{'meta':{'id':'france_2011',**old.SOURCES['france_2011']},
  'candidates':[{'source_id':'france_2011','at_sec':3.,'motion':.3,'hash64':'0'*64,'duration':1.8},
                {'source_id':'france_2011','at_sec':15.,'motion':.25,'hash64':'1'*64,'duration':1.8}]},
  'rodovia_2017':{'meta':{'id':'rodovia_2017',**old.SOURCES['rodovia_2017']},
  'candidates':[{'source_id':'rodovia_2017','at_sec':70.,'motion':.02,'hash64':'0'*64,'duration':1.8}]}})
 original=copy.deepcopy(base)
 result=v.revise_v42_plan({'edit_plan':base},fake('france_2011',motions=[.03,.115,.13]),fake('rodovia_2017'))
 assert base==original
 assert result['edit_plan']['version']=='v0.43'
 assert result['edit_plan']['requires_human_semantic_review']
 assert all(s['credit']==t['credit'] for s,t in zip(original['shots'],result['edit_plan']['shots']))

def test_non_matching_story_refused():
 base={'edit_plan':{'shots':[{'start':0,'end':1,'source_id':'rodovia_2017','source_at':0.,'headline':'x','grammar':'news_window','credit':'RODOVIA 2017'},
                              {'start':1,'end':2,'source_id':'rodovia_2017','source_at':0.,'headline':'x','grammar':'news_window','credit':'RODOVIA 2017'},
                              {'start':2,'end':3,'source_id':'rodovia_2017','source_at':0.,'headline':'x','grammar':'news_window','credit':'RODOVIA 2017'}]}}
 with pytest.raises(ValueError,match='unexpected narrative'):
  v.revise_v42_plan(base,fake('france_2011'),fake('rodovia_2017'))

def test_hash_similarity_enforced():
 r=fake('france_2011')
 # all candidates share fingerprints; only first can enter
 for x in r['candidates']:x['hash64']='0'*64
 with pytest.raises(ValueError,match='insufficient distinct'):
  v.rank(r,role='industrial_action',pace='cinematic',count=2,min_gap=0)

def test_source_spoofing_fails():
 r=fake('france_2011');r['candidates'][0]['source_id']='rodovia_2017'
 with pytest.raises(ValueError,match='spoofing'):
  v.rank(r,role='industrial_action',pace='cinematic',count=1)

def test_invalid_measurements_fail():
 for key in ('motion','cut_risk','sharpness_quality','exposure_quality'):
  item=dict(motion=.1,cut_risk=.1,sharpness_quality=.8,exposure_quality=.8)
  item[key]=math.nan
  with pytest.raises(ValueError,match='measurements'):
   v.score(item,'interview','cinematic')

def test_unregistered_source_cannot_be_scanned(tmp_path):
 with pytest.raises(ValueError,match='not registered'):
  v.scan(tmp_path/'fake.mp4','csn_1941')

def test_pace_is_explicit():
 with pytest.raises(ValueError,match='invalid pace'):
  v.score(dict(motion=.1,cut_risk=.2,sharpness_quality=.5,exposure_quality=.5),'interview','speedy')

def test_distinct_selected_reliable():
 r=fake('france_2011')
 # need different fingerprints >5 bits, unlike tiny fake case
 for i,item in enumerate(r['candidates']):item['hash64']='1'*(i*9)+'0'*(64-i*9)
 chosen=v.rank(r,role='industrial_action',pace='cinematic',count=2,min_gap=4)
 assert len(chosen['selected'])==2
 assert all(x['editor_score']>0 for x in chosen['selected'])
 assert chosen['ranking_is_visual_not_semantic'] is True


def test_visual_repetition_warns_when_timecodes_do_not_change_image():
 r=fake('rodovia_2017')
 for item in r['candidates']:item['hash64']='0'*64
 d=v.visual_cluster_report(r)
 assert d['visual_clusters']==1 and d['largest_cluster_fraction']==1
 assert d['repetitive_source_warning'] is True


def test_diverse_source_has_no_fabricated_warning():
 r=fake('france_2011')
 d=v.visual_cluster_report(r)
 assert d['visual_clusters']==len(r['candidates'])
 assert d['repetitive_source_warning'] is False

def test_review_does_not_allow_public_mode(tmp_path):
 from studio.review_v43 import render_review
 import json
 m={'edit_plan':{'version':'v0.43','publication_approved':True,'voice_embedded':False}}
 p=tmp_path/'edl.json';p.write_text(json.dumps(m))
 with pytest.raises(ValueError,match='private'):
  render_review(p,tmp_path/'index.html',video_a='a.mp4',video_b='b.mp4',industrial_contact='a.jpg',interview_contact='b.jpg')

def test_review_page_export_and_no_network(tmp_path):
 from studio.review_v43 import render_review
 import json
 a=fake('france_2011');b=fake('rodovia_2017')
 for i,row in enumerate(a['candidates']):row['hash64']='1'*(i*9)+'0'*(64-i*9)
 # build fake existing timeline that matches V42 editor
 oldplan=old.build_edit_plan({'france_2011':{'meta':{'id':'france_2011',**old.SOURCES['france_2011']},
  'candidates':[{'source_id':'france_2011','at_sec':3.,'motion':.3,'hash64':'0'*64,'duration':1.8},
                {'source_id':'france_2011','at_sec':15.,'motion':.25,'hash64':'1'*64,'duration':1.8}]},
  'rodovia_2017':{'meta':{'id':'rodovia_2017',**old.SOURCES['rodovia_2017']},
  'candidates':[{'source_id':'rodovia_2017','at_sec':70.,'motion':.02,'hash64':'0'*64,'duration':1.8}]}})
 m=v.revise_v42_plan({'edit_plan':oldplan},a,b)
 p=tmp_path/'edl.json';p.write_text(json.dumps(m))
 result=render_review(p,tmp_path/'index.html',video_a='A.mp4',video_b='B.mp4',industrial_contact='ind.jpg',interview_contact='road.jpg')
 h=result.read_text()
 assert 'Exportar nova EDL' in h and 'A.mp4' in h and 'B.mp4' in h
 assert 'publication_approved=false' in h and 'https://' not in h