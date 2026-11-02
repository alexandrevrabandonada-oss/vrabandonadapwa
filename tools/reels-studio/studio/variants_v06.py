"""Generate conservative and expressive AB motion variants without altering editorial source data."""
from __future__ import annotations
import copy,json
from pathlib import Path
def produce(base:dict,language:str)->dict:
    if language not in ('restrained','expressive'):raise ValueError('unknown visual language')
    candidate=copy.deepcopy(base)
    candidate['edition']=str(base.get('edition',''))+'-'+language
    for i,scene in enumerate(candidate['scenes']):
        if i==0:continue
        if language=='restrained':scene['transition_in']={'style':'hard_cut','duration':0}
        elif scene.get('type')=='document':scene['transition_in']={'style':'print_registration','duration':.18}
        else:scene['transition_in']={'style':'slag_reveal' if i%2 else 'press_gate','duration':.27}
    assert candidate['assets']==base['assets'] and candidate.get('narration')==base.get('narration')
    keys=('asset','overlay','source_label','claim','evidence_id')
    assert [[s.get(k) for k in keys] for s in candidate['scenes']]==[[s.get(k) for k in keys] for s in base['scenes']]
    return candidate
def export_variants(src:Path,destination:Path):
    project=json.loads(src.read_text());destination.mkdir(parents=True,exist_ok=True)
    paths=[]
    for language in ('restrained','expressive'):
        path=destination/f'{project["project_id"]}_{language}.json'
        path.write_text(json.dumps(produce(project,language),ensure_ascii=False,indent=2))
        paths.append(str(path))
    return paths
