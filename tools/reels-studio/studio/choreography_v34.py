"""Motion-first choreography contract for Aço Gráfico v0.34.

This pure planning module is independent of graphics colors and media I/O.
8 actual motion functions; 2 timing variants with identical palettes.
Physical documentary images are never reinterpreted as other events.
"""
from __future__ import annotations
import math
from dataclasses import dataclass

FPS=30
POSE_FPS=15
SOURCE_CUTS=(0,.92,1.90,4.08,6.16,8.46,9.66,11.56,14.50)
GESTURES=("opposing_shutters","depth_accordion","staggered_columns",
          "ink_raster_bounce","diagonal_reveal","counterpoint_pan",
          "moving_beams","documentary_breath")
PALETTE_ID="ACO_GRAFICO_ORIGINAL"

@dataclass(frozen=True)
class Motion:
    gesture:str
    scene_index:int
    time_sec:float
    graphic_pose_index:int
    arrival:float
    recoil:float
    layer_offsets:tuple[float,float,float]
    graphic_registration_px:int
    camera_zoom:float
    documentary_hold:float

def smooth(x:float)->float:
    x=max(0.,min(1.,float(x)))
    return x*x*(3-2*x)

def spring(x:float)->float:
    x=max(0.,min(1.,float(x)))
    return 1-math.exp(-8*x)*math.cos(11*x)

def plan(scene_index:int,elapsed:float,variant:str="kinetic")->Motion:
    if not isinstance(scene_index,int) or not 0<=scene_index<8:
        raise ValueError("scene_index must be 0..7")
    if variant not in ("kinetic","measured"):
        raise ValueError("unsupported timing variant")
    duration=SOURCE_CUTS[scene_index+1]-SOURCE_CUTS[scene_index]
    if not math.isfinite(elapsed) or not 0<=elapsed<=duration:
        raise ValueError("time outside shot")
    entrance,amp,hold= (.46,1.,.68) if variant=="kinetic" else (.70,.60,.87)
    arrival=1-(1-min(1.,elapsed/entrance))**3
    graphic_pose=math.floor(elapsed*POSE_FPS+1e-8)
    graphic_time=graphic_pose/POSE_FPS
    reg=round(4*amp*math.sin(graphic_time*11.4))
    offsets=(round(164*amp*(1-arrival),2),
             round(-131*amp*(1-arrival),2),
             round(95*amp*(1-arrival),2))
    return Motion(
        gesture=GESTURES[scene_index],scene_index=scene_index,
        time_sec=elapsed,graphic_pose_index=graphic_pose,
        arrival=arrival,recoil=spring(min(1.,elapsed/entrance)),
        layer_offsets=offsets,graphic_registration_px=reg,
        camera_zoom=1.012+(.032 if variant=="kinetic" else .017)*smooth(elapsed/duration),
        documentary_hold=max(0.,(elapsed/duration-hold)/(1-hold)),
    )

def validate()->dict:
    if len(GESTURES)!=8 or len(set(GESTURES))!=8:
        raise ValueError("movement must be eight distinct gestures")
    if len(SOURCE_CUTS)!=9 or SOURCE_CUTS[0]!=0 or SOURCE_CUTS[-1]!=14.5:
        raise ValueError("timeline boundary error")
    if any(b<=a for a,b in zip(SOURCE_CUTS,SOURCE_CUTS[1:])):
        raise ValueError("timeline is not increasing")
    pair=plan(0,.2,"kinetic"),plan(0,.2,"measured")
    if pair[0].layer_offsets==pair[1].layer_offsets:
        raise ValueError("palette-only A/B not allowed")
    return {"version":"v0.34","gestures":list(GESTURES),"palette_id":PALETTE_ID,
            "source_picture_fps":FPS,"graphic_pose_fps":POSE_FPS,
            "same_palette_different_motions":True,"publication_approved":False,
            "voice_embedded":False,"artistic_score_certified":False}
