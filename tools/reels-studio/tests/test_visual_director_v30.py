import json
import hashlib
import sys
from pathlib import Path
import cv2
import numpy as np
import pytest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from studio import visual_director_v30 as v30
from studio.verified_media_v30 import CATALOG,verify,fetch
from studio.master_director_v29 import W,H,DUR


def fixture_stills(tmp_path):
    yy,xx=np.indices((240,320))
    mats=[
        np.uint8((np.sin(xx*.19+yy*.08)+1)*120),
        np.uint8((np.sin(xx*.031+yy*.24)+1)*120),
        np.uint8((np.sin(xx*.18-yy*.29)+1)*120),
    ]
    out=[]
    for name,gray in zip(v30.PHOTO_SOURCE_IDS,mats):
        im=cv2.cvtColor(gray,cv2.COLOR_GRAY2BGR)
        f=tmp_path/f'{name}.jpg';assert cv2.imwrite(str(f),im)
        item=CATALOG[name]
        f.with_suffix('.json').write_text(json.dumps({
            'id':name,'source_year':item['year'],'role':item['role'],
            'sha1':hashlib.sha1(f.read_bytes()).hexdigest(),'size_bytes':f.stat().st_size,
            'publication_approved':False}),encoding='utf8')
        out.append(f)
    return out


def test_three_true_local_stills_replace_single_still():
    report=v30.inspect_plan()
    assert report['distinct_real_still_sources']==3
    assert report['max_same_still_exposure_sec']==2.18
    assert report['v29_same_photo_exposure_sec']==6.16
    assert report['measurable_exposure_reduction_percent']==64.6
    assert report['source_switches_at_sec']==[1.9,4.08,6.16]


def test_source_year_match_semantic_voice():
    shots=v30.SCENES
    assert len(shots)==7 and abs(shots[-1].end-DUR)<.001
    assert '1965' in shots[0].credit and shots[0].end<1.927
    assert '2014' in shots[1].credit and '2014' in shots[2].credit
    assert shots[2].end==6.16
    assert all('FRANÇA' in x.credit for x in shots[3:6])
    assert len({x.film_at for x in shots if x.film_at is not None})==4


def test_authenticated_sources_and_nonduplicated_footage(tmp_path):
    files=fixture_stills(tmp_path)
    images,records,dist=v30.source_checks(files)
    assert len(images)==3 and len(records)==3
    assert len(dist)==3 and min(dist)>=6
    assert records[0]['source_year']==1965 and records[1]['source_year']==2014


def test_duplicate_images_rejected(tmp_path):
    files=fixture_stills(tmp_path)
    data=files[0].read_bytes()
    files[1].write_bytes(data)
    manifest=json.loads(files[1].with_suffix('.json').read_text())
    manifest['sha1']=hashlib.sha1(data).hexdigest()
    manifest['size_bytes']=len(data)
    files[1].with_suffix('.json').write_text(json.dumps(manifest))
    with pytest.raises(ValueError,match='near-duplicate'):
        v30.source_checks(files)


def test_source_immutability_sha_and_year(tmp_path):
    files=fixture_stills(tmp_path)
    p=files[0]
    assert verify(p,'archive_1965')['source_year']==1965
    data=json.loads(p.with_suffix('.json').read_text())
    data['source_year']=2026;p.with_suffix('.json').write_text(json.dumps(data))
    with pytest.raises(ValueError,match='provenance'):
        verify(p,'archive_1965')


def test_no_self_approved_publication(tmp_path):
    files=fixture_stills(tmp_path);p=files[2]
    data=json.loads(p.with_suffix('.json').read_text());data['publication_approved']=True
    p.with_suffix('.json').write_text(json.dumps(data))
    with pytest.raises(ValueError,match='self-approve'):
        verify(p,'csn_2014_01')


def test_design_non_factual_region_only():
    source=np.full((H,W,3),127,dtype=np.uint8)
    before=source.copy()
    after=v30.guide_after_lettering(source,v30.SCENES[0],'graphic',0,.11)
    assert np.array_equal(before[200:1600],after[200:1600])
    assert not np.array_equal(before[102:150],after[102:150])
    assert not np.array_equal(before[1845:1900],after[1845:1900])


def test_continued_existing_voice_timing_no_new_synthesis():
    words=Path(__file__).resolve().parents[1]/'examples/voice_alexandre_words_v24.json'
    result=v30.base.read_words(words)
    assert len(result)==32 and abs(result[-1]['end']-14.071)<.02
    assert not hasattr(v30,'generate_speech')


def test_fails_closed_if_missing_archive(tmp_path):
    with pytest.raises(ValueError,match='three distinct'):
        v30.source_checks([])
    with pytest.raises(ValueError,match='catalog'):
        fetch('wrong_key',tmp_path)


def test_score_not_automatically_awarded():
    assert v30.inspect_plan()['reels_shots']==7
    assert all(not hasattr(s,'aesthetic_score') for s in v30.SCENES)
