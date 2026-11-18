"""V19 Volta Redonda: provenance, historical chronology and safe image design."""
import hashlib,json
from pathlib import Path
import cv2,numpy as np,pytest
from studio.volta_redonda_v19 import SOURCES,cover,decorate,verify_local

def test_city_media_has_distinct_dates():
    a,b=SOURCES['csn_2014'],SOURCES['rodovia_2017']
    assert a['year']==2014 and b['year']==2017
    assert 'PENDING' in b['license_review']
    assert '1962' in a['fact']
    assert 'TV BrasilGov'==b['author']

def test_source_hash_must_match_own_manifest(tmp_path):
    p=tmp_path/'csn_2014.jpg'
    p.write_bytes(b'not a real photograph')
    manifest={'id':'csn_2014','sha1':hashlib.sha1(p.read_bytes()).hexdigest(),
        'size_bytes':p.stat().st_size,'license_review':'creator-uploaded',
        'publication_approved':False}
    (tmp_path/'csn_2014.json').write_text(json.dumps(manifest))
    assert verify_local('csn_2014',p)['sha1']==manifest['sha1']
    p.write_bytes(b'tampered')
    with pytest.raises(ValueError,match='hash'):
        verify_local('csn_2014',p)

def test_unreviewed_video_does_not_gain_rights_by_hash(tmp_path):
    p=tmp_path/'rodovia_2017.webm'
    p.write_bytes(b'fixture')
    data={'id':'rodovia_2017','sha1':hashlib.sha1(p.read_bytes()).hexdigest(),
        'size_bytes':len(p.read_bytes()),'license_review':'PENDING_MANUAL_REVIEW',
        'publication_approved':False}
    (tmp_path/'rodovia_2017.json').write_text(json.dumps(data))
    assert verify_local('rodovia_2017',p)['publication_approved'] is False
    data['license_review']='creator-uploaded'
    (tmp_path/'rodovia_2017.json').write_text(json.dumps(data))
    with pytest.raises(ValueError,match='license'):
        verify_local('rodovia_2017',p)

def test_visual_templates_fit_vertical_no_lost_subject():
    src=np.full((320,600,3),(70,100,140),np.uint8)
    cv2.rectangle(src,(180,70),(400,260),(240,100,180),-1)
    a=cover(src,270,480,.5,.5,1.08)
    assert a.shape==(480,270,3)
    b=decorate(a,270,480,2.5,'CSN • VOLTA REDONDA',
       'FOTO HENRIQUEBARRAMANSA / CC BY-SA 3.0','A CIDADE DO AÇO',2014)
    assert b.shape==(480,270,3)
    assert not np.array_equal(a,b)

def test_rights_are_not_auto_approved():
    assert SOURCES['csn_2014']['license']=='CC BY-SA 3.0'
    assert SOURCES['rodovia_2017']['license']=='CC BY 3.0'
