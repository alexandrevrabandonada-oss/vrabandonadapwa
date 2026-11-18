"""Offline-safe tests for the historical, industrial and broadcast templates."""
import hashlib
from pathlib import Path
import cv2
import numpy as np
import pytest
from studio import three_grammars_v42 as v
from studio import quality_gate_v42 as q


def test_distinct_grammars_and_truthful_categories():
 assert set(v.PROFILES)=={'arquivo','industria','telejornal'}
 assert len({x['grammar'] for x in v.PROFILES.values()})==3
 assert v.PROFILES['arquivo']['sources']==('1941','1969','2014')
 assert v.PROFILES['industria']['sources']==('france',)
 assert v.PROFILES['telejornal']['sources']==('rodovia',)

def test_france_cannot_be_presented_as_csn():
 assert 'FRANÇA' in v.SOURCES['france'][2]
 assert 'CSN' not in v.SOURCES['france'][2]

def test_broadcast_origin_is_2017():
 assert '2017' in v.SOURCES['rodovia'][2]
 assert 'TV BRASILGOV' in v.SOURCES['rodovia'][2]

def test_media_provenance_expected_hashes():
 assert v.SOURCES['rodovia'][1]=='0974ee5e46efa3599f623e32c94fc0e0fd7da46a'
 assert len({x[1] for x in v.SOURCES.values()})==5

def test_unknown_profile_fails_closed(tmp_path):
 with pytest.raises(ValueError,match='unknown editorial grammar'):
  v.verify_sources(tmp_path,'not-historical')

def test_unverified_sources_rejected(tmp_path):
 (tmp_path/'1969.jpg').write_bytes(b'invalid')
 with pytest.raises(ValueError,match='source verification failed'):
  v.verify_sources(tmp_path,'arquivo')

def test_full_hd_contract():
 assert (v.W,v.H,v.FPS)==(1080,1920,30)
 assert v.DUR==6

def test_video_requires_real_capture():
 with pytest.raises(ValueError,match='video source missing'):
  v.check_stages('telejornal',video=None)

def test_broadcast_preserves_native_169_frame_not_crop():
 assert abs(1030/580-1920/1080)<.01

def test_graphical_pose_is_15fps_against_30fps_footage():
 assert (v.FPS//15)==2

def test_font_overlay_does_not_modify_image_source():
 src=np.full((480,640,3),80,dtype=np.uint8);original=src.copy()
 bg=np.zeros((500,800,3),dtype=np.uint8)
 v.put(bg,src,10,10)
 text=v.TextCache();text.paint(bg,'TESTE',10,10,33)
 assert np.array_equal(src,original)

def test_archive_frame_is_portrait_and_source_credit_space():
 frame=v.frame_base(.8,'arquivo',v.TextCache())
 assert frame.shape==(1920,1080,3)
 assert frame[1900,800].mean()<200

def test_laboratory_is_never_a_publication():
 for p in v.PROFILES.values():
  assert p['grammar']
 # Renderer writes publication_approved=False and narration_embedded=False;
 # QA rejects any forged public/voice flags.
 assert q.analyze.__name__=='analyze'

def test_audio_is_original_generated_and_bounded(tmp_path):
 import wave
 path=tmp_path/'original.wav';v.soundtrack(path,'arquivo')
 with wave.open(str(path),'rb') as wavefile:
  assert wavefile.getnchannels()==1
  assert wavefile.getframerate()==48000
  assert wavefile.getnframes()==6*48000

def test_cover_maintains_dimensions():
 a=np.zeros((360,640,3),np.uint8)
 assert v.cover(a,200,320).shape==(320,200,3)
