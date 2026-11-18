"""Portable original file hash manifest; checksums do NOT grant usage rights."""
from __future__ import annotations
import hashlib
from pathlib import Path
from .factory import local_file
def snapshot(project:dict,root:Path)->dict:
    rows=[]
    for key,item in sorted(project.get('assets',{}).items()):
        p=local_file(root,item['file']);present=p.is_file()
        h=hashlib.sha256(p.read_bytes()).hexdigest() if present else None
        rows.append({'id':key,'file':item['file'],'present':present,'sha256':h,
          'source':item.get('source'),'capture_date':item.get('capture_date'),
          'rights_status':item.get('rights_status','unknown'),'editable_original':False})
    return {'project_id':project['project_id'],'assets':rows,
      'public_distribution_allowed':False,
      'note':'Checksum and file presence never establish license or authorship.'}
