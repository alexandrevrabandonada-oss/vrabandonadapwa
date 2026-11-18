"""Regression gates for V31's 1941 construction + 1969 factory interior."""
import pytest
from studio import visual_director_v31 as V
from studio import verified_media_v31 as A

def test_eight_real_source_shots():
    assert len(V.SCENES)==8
    assert V.inspect_plan()['distinct_real_still_sources']==4
    assert V.PHOTO_SOURCE_IDS==[
        'csn_construction_1941','csn_interior_1969','csn_2014_02','csn_2014_01']

def test_origin_and_chronology_are_explicit():
    assert '1941' in V.SCENES[0].credit
    assert '1969' in V.SCENES[1].credit
    assert all('2014' in shot.credit for shot in V.SCENES[2:4])
    assert all('FRANÇA' in shot.credit for shot in V.SCENES[4:])

def test_semantic_cuts_are_contiguous():
    assert [round(s.end,2) for s in V.SCENES]==[
        .92,1.90,4.08,6.16,8.46,9.66,11.56,14.50]

def test_four_distinct_footage_windows():
    windows=V.inspect_plan()['film_windows']
    assert len(windows)==4 and min(windows)>=0
    assert len(set(windows))==4

def test_archive_hashes_are_hard_pinned():
    assert A.CATALOG['csn_construction_1941']['expected_sha1']==\
        '91d061df6f5fb7962d17c86948e656c335f1b0ca'
    assert A.CATALOG['csn_interior_1969']['expected_sha1']==\
        '1e16caba06722d121eaf3b88b39d89be910bb2a0'

def test_tiff_original_1941_not_confused_with_derived_jpeg():
    assert A.CATALOG['csn_construction_1941']['title'].endswith('.tif')
    assert A.CATALOG['csn_interior_1969']['title'].endswith('.jpg')

def test_semantic_archive_cut_validation_fails_closed():
    original=V.SCENES[1]
    wrong=V.base.Shot(original.start,original.end,original.role,
        original.frame_mode,original.headline,'CSN INTERIOR, 1941')
    bad=list(V.SCENES);bad[1]=wrong
    with pytest.raises(ValueError,match='historic years'):
        V.inspect_plan(tuple(bad))

def test_foreign_source_cannot_masquerade_as_csn():
    s=V.SCENES[4]
    bad=list(V.SCENES)
    bad[4]=V.base.Shot(s.start,s.end,s.role,s.frame_mode,s.headline,
        'CSN VOLTA REDONDA, 2011',s.film_at,s.focus)
    with pytest.raises(ValueError,match='misidentify'):
        V.inspect_plan(tuple(bad))

def test_four_assets_need_4_different_paths():
    with pytest.raises(ValueError,match='four'):
        V.source_checks([])

def test_publication_is_not_part_of_render_engine():
    assert not hasattr(V,'publish')
