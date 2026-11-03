"""Private local laboratory intake. No download, scraping, DRM or publishing API.

This technical asset-ingest tool never determines copyright status.
Never stage input media in the Git repository or public CI artifacts.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import tempfile

MEDIA_SUFFIXES = frozenset({'.mp4','.mov','.mkv','.webm','.avi','.mp3','.wav','.flac',
                           '.jpg','.jpeg','.png','.tif','.tiff','.webp'})
VALID_PURPOSES = ('internal_research', 'public_release')


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for part in iter(lambda: f.read(1024 * 1024), b''):
            h.update(part)
    return h.hexdigest()


def intake(source: Path, vault: Path, *, origin: str, capture_year=None,
           license_status='unknown', label='', context='technical_test') -> dict:
    src = Path(source).expanduser().resolve(strict=True)
    if not src.is_file() or src.suffix.lower() not in MEDIA_SUFFIXES:
        raise ValueError('Expected a supported local media file')
    if src.stat().st_size <= 0:
        raise ValueError('Empty file')
    if not origin.strip() or not label.strip():
        raise ValueError('Source origin and truthful label are required')
    if license_status not in ('unknown','pending','cleared','restricted'):
        raise ValueError('Invalid publication rights status')
    if capture_year is not None and (
        not isinstance(capture_year,int) or not 1800 <= capture_year <= 2100
    ):
        raise ValueError('Invalid capture year')
    root = Path(vault).expanduser().resolve()
    if src.is_relative_to(root):
        raise ValueError('Source should be outside the vault for deterministic intake')
    root.mkdir(parents=True, exist_ok=True)
    digest = sha256(src)
    name = re.sub(r'[^a-zA-Z0-9_-]+', '-', src.stem).strip('-')[:44] or 'asset'
    destination = root / f'{digest[:16]}_{name}{src.suffix.lower()}'
    if not destination.exists():
        with tempfile.NamedTemporaryFile(prefix='.staging_', dir=root, delete=False) as temp:
            temporary = Path(temp.name)
        try:
            shutil.copyfile(src, temporary)
            if sha256(temporary) != digest:
                raise ValueError('Checksum mismatch during intake')
            os.replace(temporary, destination)
        finally:
            temporary.unlink(missing_ok=True)
    if sha256(destination) != digest:
        raise ValueError('Private vault checksum collision or overwritten file')
    receipt = {
        'id': digest, 'original_file': src.name, 'private_path': str(destination),
        'sha256': digest, 'bytes': src.stat().st_size,
        'origin': origin, 'capture_year': capture_year,
        'display_label': label, 'editorial_context': context,
        'license_status': license_status, 'mode': 'internal_research',
        'publication_approved': False, 'upload_to_public_repo': False,
        'source_integrity_verified': True,
        'note': 'Origin recorded, not independently authenticated. No rights inferred.',
    }
    receipt_path = root / f'{digest[:16]}_{name}.receipt.json'
    receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding='utf8')
    return receipt


def gate(receipts: list[dict], purpose: str, *, rights_reviewed=False,
         editorial_approved=False, fact_checked=False) -> dict:
    if purpose not in VALID_PURPOSES:
        raise ValueError('Purpose must be internal_research or public_release')
    if not receipts or any(
        not a.get('source_integrity_verified') or not a.get('origin') for a in receipts
    ):
        raise ValueError('Missing source integrity or origin')
    if purpose == 'internal_research':
        return {'allowed': True, 'purpose': purpose, 'publication_approved': False,
                'assets': len(receipts)}
    if not (rights_reviewed and editorial_approved and fact_checked):
        raise PermissionError('Public use needs external rights review, editorial approval and fact checks')
    if any(a.get('license_status') != 'cleared' for a in receipts):
        raise PermissionError('An asset is not cleared for public reuse')
    return {'allowed': True, 'purpose': purpose, 'publication_approved': True,
            'assets': len(receipts)}


def main():
    ap = argparse.ArgumentParser(description='Private offline media intake; no publication')
    ap.add_argument('--source', required=True, type=Path)
    ap.add_argument('--vault', required=True, type=Path)
    ap.add_argument('--origin', required=True)
    ap.add_argument('--label', required=True)
    ap.add_argument('--year', type=int)
    ap.add_argument('--rights', default='pending',
                    choices=('unknown','pending','cleared','restricted'))
    args = ap.parse_args()
    receipt = intake(args.source,args.vault,origin=args.origin,capture_year=args.year,
                     license_status=args.rights,label=args.label)
    print(json.dumps(receipt, indent=2, ensure_ascii=False))

if __name__ == '__main__': main()
