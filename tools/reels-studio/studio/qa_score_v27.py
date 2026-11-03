"""v27: check scorecard math and prevent CI being portrayed as creative certification."""
from __future__ import annotations
import argparse,json
from pathlib import Path


def audit(report:dict)->dict:
    weights=report.get('weights',{})
    if abs(sum(weights.values())-1.)>1e-8:raise ValueError('weights must sum to 1')
    scores=report.get('artistic_scores_out_of_10',{})
    if len(scores)<2:raise ValueError('must compare two variants')
    for name,details in report.get('criteria',{}).items():
        if set(details)!=set(weights) or not all(0<=x<=10 for x in details.values()):
            raise ValueError(f'incomplete editorial criteria: {name}')
        computed=round(sum(details[k]*weights[k] for k in weights),2)
        if scores.get(name)!=computed:raise ValueError(f'changed or fabricated score: {name}')
    if report.get('automatic_artistic_approval') is not False or report.get('publication_approved') is not False:
        raise ValueError('internal scoring cannot approve content automatically')
    if report.get('kind')!='INTERNAL_EDITORIAL_ESTIMATE_NOT_INDEPENDENT':
        raise ValueError('scores require explicit subjective basis')
    return {'ok':True,'variants':len(scores),'top_artistic_score':max(scores.values()),
            'technical_capability':report['factory_capability_out_of_10'],
            'not_independent_assessment':True,'publication_approved':False}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('scorecard',type=Path)
    a=p.parse_args();print(json.dumps(audit(json.loads(a.scorecard.read_text(encoding='utf8'))),indent=2))

