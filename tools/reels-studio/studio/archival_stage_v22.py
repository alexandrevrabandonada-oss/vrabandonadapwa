"""Aço Gráfico v0.22: motion graphics *around*, never inside, archive frames.

Source footage is framed without destructive crop or pixel repainting. Source
authenticity, licensing, screening and publication remain external hard gates.
"""
from __future__ import annotations

import math
import cv2
import numpy as np

INK=(21,17,48)
PAPER=(226,238,248)
COPPER=(30,125,226)
MAGENTA=(130,40,235)
ELECTRIC=(232,221,72)


def contain_bounds(source_shape, w=540, h=960):
    sh, sw=source_shape[:2]
    if min(sh,sw)<8 or w<400 or h<700:
        raise ValueError("invalid archival frame or mobile master")
    avail_w=w-44
    avail_h=440
    scale=min(avail_w/sw,avail_h/sh)
    fw,fh=max(1,round(sw*scale)),max(1,round(sh*scale))
    x=(w-fw)//2
    y=310+(440-fh)//2
    return x,y,fw,fh


def _words(frame, text, x,y,scale, color,thickness=2):
    cv2.putText(frame,text,(x,y),cv2.FONT_HERSHEY_DUPLEX,scale,color,thickness,cv2.LINE_AA)


def archive_frame(source:np.ndarray,t:float,*,title="A CIDADE DO ACO",
                  source_code="013614",year="1953",disclosure="ESTUDO TECNICO - NAO PUBLICADO",
                  width=540,height=960,annotate_simulation=False):
    if source is None or source.ndim!=3 or source.shape[2]!=3:
        raise ValueError("BGR source frame required")
    if not math.isfinite(t) or t<0 or not source_code or not disclosure:
        raise ValueError("source label and physical frame time required")
    if (width,height)!=(540,960):
        raise ValueError("v22 strict internal test profile")
    stage=np.empty((height,width,3),dtype=np.uint8)
    stage[:]=INK
    # Diagonal paper-registration strokes and constrained print halftone.
    offset=round(t*23)%76
    for y in range(-width, height+width, 76):
        yy=y+offset
        cv2.line(stage,(0,yy),(width,yy+width//2),(45,40,71),2,cv2.LINE_AA)
    cv2.fillConvexPoly(stage,np.array([(0,0),(width,0),(width-80,190),(0,240)],np.int32),(39,23,77))
    cv2.fillConvexPoly(stage,np.array([(width,85),(width,235),(width-95,175)],np.int32),MAGENTA)
    _words(stage,"ACERVO / CIDADE DO ACO",22,70,.72,PAPER,2)
    _words(stage,"REGISTRO HISTORICO",22,116,.72,ELECTRIC,2)
    cv2.line(stage,(22,135),(width-24,135),ELECTRIC,3,cv2.LINE_AA)
    _words(stage,title[:30],22,205,.82,PAPER,2)
    _words(stage,f"ANO DO FILME: {year}",24,253,.6,COPPER,2)
    x,y,fw,fh=contain_bounds(source.shape,width,height)
    cv2.rectangle(stage,(x-5,y-5),(x+fw+5,y+fh+5),COPPER,-1)
    exact=cv2.resize(source,(fw,fh),interpolation=cv2.INTER_AREA if fw<source.shape[1] else cv2.INTER_LINEAR)
    stage[y:y+fh,x:x+fw]=exact
    cv2.line(stage,(x-5,y-5),(x+fw+5,y-5),ELECTRIC,6,cv2.LINE_AA)
    cv2.line(stage,(18,806),(width-18,806),MAGENTA,4,cv2.LINE_AA)
    _words(stage,f"FONTE / FILME {source_code}",21,842,.66,ELECTRIC,2)
    _words(stage,disclosure[:47],21,879,.45,PAPER,1)
    _words(stage,"ORIGINAL INTEGRO NO QUADRO / SEM CROP",21,915,.46,PAPER,1)
    if annotate_simulation:
        # The disclosure is out of picture; the source pixels are unchanged.
        _words(stage,"SIMULACAO DE LABORATORIO",21,947,.45,MAGENTA,2)
    return stage, {"source_rect_xywh":[x,y,fw,fh],
                   "original_frame_uncropped":True,
                   "source_pixels_intact_in_display_rectangle":True,
                   "global_canvas_animated":True,
                   "source_rights_verified":False,
                   "publication_approved":False,
                   "aesthetic_quality_certified":False}


def lab_frame(t, width=640,height=480):
    """Synthetic geometry for regression; not footage of Volta Redonda."""
    frame=np.full((height,width,3),(72,55,27),np.uint8)
    cv2.rectangle(frame,(0,320),(width,340),(140,150,165),-1)
    x=round(40+(t*70)%max(1,width-160))
    cv2.circle(frame,(x,170),55,(24,194,243),-1,cv2.LINE_AA)
    cv2.line(frame,(0,375),(width,375),(250,240,210),6,cv2.LINE_AA)
    return frame
