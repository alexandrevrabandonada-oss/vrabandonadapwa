"""Real-word timing and per-shot editorial layout tests. No voice synthesis."""
import json
from pathlib import Path
import numpy as np
import cv2
import pytest
from studio.voice_timed_v24 import load_words,cues,export_srt,inspect_voice
from studio.cinema_director_v24 import frame_draw,SCENES

WORDS=Path(__file__).resolve().parents[1]/"examples/voice_alexandre_words_v24.json"

def test_actual_narrator_word_times():
    rec,w=load_words(WORDS)
    assert len(w)==32 and w[0]["start"]==0
    assert abs(w[-1]["end"]-14.071)<.001
    assert "arquivo francês" in rec["transcript"]
    assert rec["voice_audio_available_in_renderer"] is False
    assert all(a["end"]<=b["start"]+.02 for a,b in zip(w,w[1:]))

def test_caption_length_and_unchecked_provider_status(tmp_path):
    _,w=load_words(WORDS)
    cs=cues(w)
    assert 8<=len(cs)<=16
    assert sum(len(s["words"]) for s in cs)==32
    assert all(len(s["text"])<=33 for s in cs)
    r=export_srt(WORDS,tmp_path/"alexandre.srt")
    assert r["words"]==32 and not r["human_reviewed"]
    assert "memória" in (tmp_path/"alexandre.srt").read_text(encoding="utf8")

def test_alignment_tamper_fails(tmp_path):
    obj=json.loads(WORDS.read_text())
    obj["words"][1][1]=0.1
    p=tmp_path/"invalid.json";p.write_text(json.dumps(obj))
    with pytest.raises(ValueError,match="overlap"):load_words(p)
    obj=json.loads(WORDS.read_text())
    obj["transcript"]="missing actual speech"
    p.write_text(json.dumps(obj))
    with pytest.raises(ValueError,match="transcript"):load_words(p)

def test_film_begins_after_narrator_identifies_international_context():
    assert len(SCENES)==7 and SCENES[-1][1]==14.5
    assert all(a[1]==b[0] for a,b in zip(SCENES,SCENES[1:]))
    assert all(s[3]=="photo" for s in SCENES[:3])
    assert all(s[3]=="video" for s in SCENES[3:5])
    assert SCENES[3][0]==6.0

def test_genuine_captions_have_dedicated_contrast_safe_area():
    photo=np.full((480,800,3),(140,80,45),np.uint8)
    moving=np.full((540,960,3),(50,190,210),np.uint8)
    _,words=load_words(WORDS)
    c=cues(words)
    before=frame_draw(photo,moving,.7,c)
    after=frame_draw(photo,moving,7.1,c)
    assert before.shape==(960,540,3)
    assert not np.array_equal(before,after)
    assert before[742,50,2]>95
    assert float(before[745:880].mean())<120
    assert before[912,40].max()>0

def test_no_voice_bytes_means_no_embedded_voice(tmp_path):
    with pytest.raises(FileNotFoundError):
        inspect_voice(tmp_path/"not-here.mp3",WORDS)
