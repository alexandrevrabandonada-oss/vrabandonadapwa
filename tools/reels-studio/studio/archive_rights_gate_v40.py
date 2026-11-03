"""Archive film rights intake: hard block on unreviewed 1953 frame use.
No license can be inferred from public catalog or public stream access.
"""
from __future__ import annotations

CINEMATECA_RECORD={
 "title":"O Minério e o Carvão","year":1953,"catalog":"013614",
 "director":"Humberto Mauro","duration_min":12,
 "source":"https://www.bcc.org.br/filmes/443375",
 "licensed":False,"original_bytes_approved":False,
}

def can_use_film_frames(record:dict, *, provided_media=None):
    """V40 accepts metadata-only citations; never ingests the cinematheca film.
    A new reviewed importer is required after documenting permission in writing.
    """
    if record.get("catalog")!="013614" or record.get("year")!=1953:
        raise ValueError("Film catalog provenance mismatch")
    if record.get("licensed") or record.get("original_bytes_approved"):
        raise PermissionError("Unverified self-declared permissions cannot bypass editorial review")
    if provided_media is not None:
        raise PermissionError("Film frames blocked until separately documented and editor-reviewed licensing")
    return False

def review_manifest(assets:list[dict]):
    for item in assets:
        if item.get("kind")=="film_1953":
            can_use_film_frames(item,provided_media=item.get("path"))
        elif item.get("kind")=="photo_context":
            if item.get("year") not in (1941,1969,2014) or not item.get("sha1"):
                raise ValueError("Context photo year and pinned SHA-1 required")
            if item.get("claimed_as_1953_frame"):
                raise ValueError("Context photography cannot be falsely presented as film stills")
        else:
            raise ValueError("Unknown asset kind")
    return True
