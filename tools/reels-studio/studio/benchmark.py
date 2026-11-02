"""Release acceptance across independent topics, not a single polished demonstration."""
from __future__ import annotations
REQUIRED=('creative_score','technical_pass','rights_clear','editorial_approved','voice_synced','mobile_reviewed','external_reviewer_score')
def evaluate_portfolio(cases:list[dict],minimum_topics:int=3)->dict:
    failures=[];scores=[];topics=set()
    if len(cases)<minimum_topics:failures.append(f'need >= {minimum_topics} independent productions')
    for i,c in enumerate(cases):
        missing=[k for k in REQUIRED if k not in c]
        if missing:
            failures.append(f'case {i}: missing evidence: {", ".join(missing)}');continue
        topics.add(str(c.get('topic','')).strip().casefold())
        try:
            internal=float(c['creative_score']);external=float(c['external_reviewer_score'])
        except (TypeError,ValueError):
            failures.append(f'case {i}: invalid creative score');continue
        if not all(0<=x<=10 for x in (internal,external)):
            failures.append(f'case {i}: scores must be 0 to 10');continue
        scores.append(min(internal,external))
        if min(internal,external)<9.5:failures.append(f'case {i}: creative standard below 9.5')
        for gate in ('technical_pass','rights_clear','editorial_approved','voice_synced','mobile_reviewed'):
            if c[gate] is not True:failures.append(f'case {i}: {gate} not signed off')
    if len(topics)<minimum_topics:failures.append(f'need {minimum_topics} different editorial topics')
    return {'ready':not failures,'cases':len(cases),'topics_evaluated':len(topics),
            'lowest_confirmed_score':min(scores) if scores else None,'failures':failures,
            'note':'No published output without explicit human authorization; scores alone cannot approve release'}
