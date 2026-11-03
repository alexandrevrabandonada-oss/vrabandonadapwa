"""v0.31: acquire multiple provenance-checked documentary stills for internal edit.

No copyright clearance inferred from a file checksum; credits/rights audit for
release remains separate. Do not provide a username/password or private asset.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen

API='https://commons.wikimedia.org/w/api.php'
UA='VRAbandonada-Documentary-VisualEngine/0.30 (attribution retained; internal research)'
CATALOG={
  'csn_construction_1941':{
    'title':'File:Construção da Companhia Siderúrgica Nacional (CSN).tif',
    'year':1941,'credit':'Arquivo Nacional / Agência Nacional',
    'role':'csn_construction_workers','location':'Volta Redonda, RJ',
    'expected_sha1':'91d061df6f5fb7962d17c86948e656c335f1b0ca',
    'note':'Construção da CSN em 30/04/1941; imagem TIFF original preservada'},
  'csn_interior_1969':{
    'title':'File:Correio da Manhã AN 356.jpg',
    'year':1969,'credit':'Arquivo Nacional / Fundo Correio da Manhã',
    'role':'csn_plant_interior','location':'Volta Redonda, RJ',
    'expected_sha1':'1e16caba06722d121eaf3b88b39d89be910bb2a0',
    'note':'Bobinas de aço no interior da CSN em 21/02/1969'},

  'archive_1965':{
   'title':'File:Correio da Manhã AN 353.jpg', 'year':1965,
   'credit':'Domínio público / Acervo Arquivo Nacional; Fundo Correio da Manhã',
   'role':'historical_office_building','location':'Volta Redonda, RJ',
   'note':'Edifício do Escritório Central da CSN, não é interior da usina'},
  'csn_2014_02':{
   'title':'File:CSN02.jpg','year':2014,'credit':'HenriqueBarraMansa / CC BY-SA 3.0',
   'role':'csn_plant_panorama','location':'Volta Redonda, RJ',
   'note':'Panorama da CSN captado em 6 de maio de 2014, 10:23'},
  'csn_2014_01':{
   'title':'File:CSN01.jpg','year':2014,'credit':'HenriqueBarraMansa / CC BY-SA 3.0',
   'role':'csn_plant_panorama','location':'Volta Redonda, RJ',
   'note':'Panorama da CSN captado em 6 de maio de 2014, 10:30'}
}

def fetch(key:str,root:Path)->dict:
    if key not in CATALOG:raise ValueError('unapproved catalog lookup')
    item=CATALOG[key]
    query=urlencode({'action':'query','format':'json','prop':'imageinfo',
                     'iiprop':'url|sha1|size|mime','titles':item['title']})
    with urlopen(Request(API+'?'+query,headers={'User-Agent':UA}),timeout=45) as f:
        data=json.load(f)
    page=next(iter(data['query']['pages'].values()))
    info=page['imageinfo'][0]
    if info.get('mime') not in ('image/jpeg','image/tiff') or not info.get('sha1'):
        raise ValueError('media type or source SHA unavailable')
    if item.get('expected_sha1') and info['sha1'].lower()!=item['expected_sha1']:
        raise ValueError('verified archive SHA-1 differs from catalog')
    url=info['url']
    if not url.startswith('https://upload.wikimedia.org/'):
        raise ValueError('image must come directly from Wikimedia CDN')
    root.mkdir(parents=True,exist_ok=True)
    filename=root/(key+'.jpg');raw=root/(key+('.tif' if info['mime']=='image/tiff' else '.jpg'))
    partial=root/(key+'.partial')
    # Commons occasionally rate-limits shared CI egress. Honor 429 with
    # spaced retries; never silently substitute a thumbnail or another image.
    from urllib.error import HTTPError
    import time
    try:
        for attempt in range(4):
            size=0;digest=hashlib.sha1()
            try:
                with urlopen(Request(url,headers={'User-Agent':UA}),timeout=90) as r, partial.open('wb') as out:
                    for chunk in iter(lambda:r.read(1<<20),b''):
                        digest.update(chunk);size+=len(chunk);out.write(chunk)
                break
            except HTTPError as error:
                if error.code not in (429,503) or attempt==3:raise
                time.sleep((20,45,75)[attempt])
        if size!=info['size'] or digest.hexdigest()!=info['sha1'].lower():
            raise ValueError('original source bytes do not match Wikimedia API')
        partial.replace(raw)
        if info['mime']=='image/tiff':
            from PIL import Image
            with Image.open(raw) as im:im.convert('RGB').save(filename,quality=96,subsampling=0)
    finally:
        partial.unlink(missing_ok=True)
    record={'id':key,'path':str(filename),'sha1':info['sha1'].lower(),
            'size_bytes':size,'source_url':url,'commons_page':
            'https://commons.wikimedia.org/wiki/'+quote(item['title'].replace(' ','_')),
            'title':item['title'],'source_year':item['year'],
            'source_credit':item['credit'],'role':item['role'],
            'location':item['location'],'note':item['note'],
            'publication_approved':False,'rights_review':'SEPARATE_RELEASE_GATE',
            'original_file':str(raw),'original_mime':info['mime'],
            'render_sha256':hashlib.sha256(filename.read_bytes()).hexdigest()}
    filename.with_suffix('.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf8')
    return record


def verify(path:Path,required_key:str)->dict:
    path=Path(path)
    if path.name!=required_key+'.jpg':raise ValueError('wrong catalog source file')
    record=json.loads(path.with_suffix('.json').read_text(encoding='utf8'))
    item=CATALOG[required_key]
    if record.get('id')!=required_key or record.get('source_year')!=item['year'] or record.get('role')!=item['role']:
        raise ValueError('source provenance mismatch')
    if record.get('publication_approved') is not False:
        raise ValueError('research media cannot self-approve publication')
    original=path.with_suffix('.tif') if item['title'].endswith('.tif') else path
    if not original.is_file():raise ValueError('original archive source absent')
    hashval=hashlib.sha1(original.read_bytes()).hexdigest()
    if hashlib.sha256(path.read_bytes()).hexdigest()!=record.get('render_sha256'):
        raise ValueError('render derivative bytes changed')
    if hashval!=record.get('sha1') or original.stat().st_size!=record.get('size_bytes'):
        raise ValueError('source bytes differ from manifest')
    return record

if __name__=='__main__':
    import argparse
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args()
    print(json.dumps([fetch(k,args.out) for k in ('csn_construction_1941','csn_interior_1969','csn_2014_02','csn_2014_01')],ensure_ascii=False,indent=2))
