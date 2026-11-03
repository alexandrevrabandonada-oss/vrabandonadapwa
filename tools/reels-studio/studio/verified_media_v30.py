"""v0.30: acquire multiple provenance-checked documentary stills for internal edit.

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
    if info.get('mime')!='image/jpeg' or not info.get('sha1'):
        raise ValueError('media type or source SHA unavailable')
    url=info['url']
    if not url.startswith('https://upload.wikimedia.org/'):
        raise ValueError('image must come directly from Wikimedia CDN')
    root.mkdir(parents=True,exist_ok=True)
    filename=root/(key+'.jpg');partial=root/(key+'.partial')
    size=0;digest=hashlib.sha1()
    try:
        with urlopen(Request(url,headers={'User-Agent':UA}),timeout=90) as r, partial.open('wb') as out:
            for chunk in iter(lambda:r.read(1<<20),b''):
                digest.update(chunk);size+=len(chunk);out.write(chunk)
        if size!=info['size'] or digest.hexdigest()!=info['sha1'].lower():
            raise ValueError('original source bytes do not match Wikimedia API')
        partial.replace(filename)
    finally:
        partial.unlink(missing_ok=True)
    record={'id':key,'path':str(filename),'sha1':info['sha1'].lower(),
            'size_bytes':size,'source_url':url,'commons_page':
            'https://commons.wikimedia.org/wiki/'+quote(item['title'].replace(' ','_')),
            'title':item['title'],'source_year':item['year'],
            'source_credit':item['credit'],'role':item['role'],
            'location':item['location'],'note':item['note'],
            'publication_approved':False,'rights_review':'SEPARATE_RELEASE_GATE'}
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
    hashval=hashlib.sha1(path.read_bytes()).hexdigest()
    if hashval!=record.get('sha1') or path.stat().st_size!=record.get('size_bytes'):
        raise ValueError('source bytes differ from manifest')
    return record

if __name__=='__main__':
    import argparse
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args()
    print(json.dumps([fetch(k,args.out) for k in CATALOG],ensure_ascii=False,indent=2))
