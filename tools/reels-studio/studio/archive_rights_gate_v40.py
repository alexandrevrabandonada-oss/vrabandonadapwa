"""Archive rights gate: private technical research and public release are separate.

Internal access to footage for experiments is not proof of reuse rights.
No circumvention or automatic public distribution is implemented.
"""
from __future__ import annotations

CINEMATECA_RECORD = {
    'title': 'O Minério e o Carvão', 'year': 1953, 'catalog': '013614',
    'director': 'Humberto Mauro', 'duration_min': 12,
    'source': 'https://www.bcc.org.br/filmes/443375',
    'licensed': False, 'original_bytes_approved': False,
}

ALLOWED_MODES = ('internal_research', 'public_release')


def can_use_film_frames(record: dict, *, provided_media=None,
                        mode: str = 'internal_research',
                        publication_clearance: bool = False,
                        editorial_approval: bool = False):
    """Allow internal preview from accessible bytes, never automatic publishing.

    Asset metadata fields 'licensed' or 'original_bytes_approved' cannot
    self-authorize publication; publication gates are independently reviewed.
    """
    if mode not in ALLOWED_MODES:
        raise ValueError('unknown usage mode')
    if record.get('catalog') != '013614' or record.get('year') != 1953:
        raise ValueError('Film catalog provenance mismatch')
    if provided_media is None:
        return False
    if mode == 'internal_research':
        return True
    if not (publication_clearance and editorial_approval):
        raise PermissionError('Public release blocked pending separately verified rights and editorial approval')
    return True


def review_manifest(assets: list[dict], *, mode: str = 'internal_research',
                    publication_clearance: bool = False,
                    editorial_approval: bool = False):
    if mode not in ALLOWED_MODES:
        raise ValueError('unknown usage mode')
    for item in assets:
        kind = item.get('kind')
        if kind == 'film_1953':
            can_use_film_frames(item, provided_media=item.get('path'), mode=mode,
                                publication_clearance=publication_clearance,
                                editorial_approval=editorial_approval)
            if item.get('claimed_as_csn_accident_1962'):
                raise ValueError('Film of 1953 cannot be portrayed as the 1962 accident')
        elif kind == 'photo_context':
            if item.get('year') not in (1941, 1969, 2014) or not item.get('sha1'):
                raise ValueError('Context photo year and pinned SHA-1 required')
            if item.get('claimed_as_1953_frame'):
                raise ValueError('Context photo cannot be falsely described as film frames')
        else:
            raise ValueError('Unknown asset kind')
    if mode == 'public_release' and not (publication_clearance and editorial_approval):
        raise PermissionError('The entire public release requires explicit clearance and approval')
    return {'accepted': True, 'mode': mode, 'publicly_releasable': mode == 'public_release',
            'assets': len(assets)}
