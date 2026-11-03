"""Offline CI: Aço Gráfico shot variety, honest chronology and rights guard."""
from studio.shot_gate_v15 import inspect

def project():
    sources={'city':{'source_kind':'photograph','capture_date':None,'rights_verified':False},
             'coils':{'source_kind':'photograph','capture_date':None,'rights_verified':False},
             'jornal':{'source_kind':'historical_document','capture_date':'1962-01-29','rights_verified':False}}
    shots=[
      {'id':'s1','grammar':'architectural_travel','duration_sec':3,'source':'city',
       'subject_anchor':[.6,.5],'editorial_role':'context','on_screen_credit':'CONTEXTO: DATA A CONFIRMAR'},
      {'id':'s2','grammar':'coil_occlusion','duration_sec':3,'source':'coils',
       'subject_anchor':[.4,.6],'editorial_role':'context','on_screen_credit':'CONTEXTO'},
      {'id':'s3','grammar':'source_read','duration_sec':3,'source':'jornal',
       'subject_anchor':[.7,.08],'editorial_role':'document_evidence','on_screen_credit':'FONTE: A NOITE 1962'}]
    return shots,sources

def test_three_grammars_without_template_risk():
    shots,sources=project();r=inspect(shots,sources)
    assert not r['errors'] and r['distinct_grammars']==3
    assert not any('TEMPLATE_RISK' in w for w in r['warnings'])
    assert not r['publication_allowed']

def test_primary_source_protection():
    shots,sources=project();shots[-1]['grammar']='architectural_travel'
    assert any('historical primary source' in e for e in inspect(shots,sources)['errors'])

def test_undated_photo_cannot_prove_1962_accident():
    shots,sources=project();shots[0]['editorial_role']='event_evidence'
    assert any('undated photograph' in e for e in inspect(shots,sources)['errors'])

def test_detect_repetitive_grammar_and_focal_out_of_bounds():
    shots,sources=project();shots[1]['grammar']='architectural_travel'
    shots[2]['grammar']='architectural_travel';shots[0]['subject_anchor']=[3,.5]
    r=inspect(shots,sources)
    assert any('TEMPLATE_RISK' in w for w in r['warnings'])
    assert any('focal point' in e for e in r['errors'])

def test_public_rights_fail_closed():
    shots,sources=project();r=inspect(shots,sources,public=True)
    assert sum('rights not verified' in e for e in r['errors'])==3
    assert not r['publication_allowed']
