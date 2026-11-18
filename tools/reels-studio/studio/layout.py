"""Safe typography geometry: measure actual glyph widths, never silently clip."""
from __future__ import annotations
from PIL import ImageFont

def layout_lines(text:str,font:ImageFont.FreeTypeFont,max_width:int,max_lines:int=3)->list[str]:
    words=text.split();out=[];line=''
    for word in words:
        cand=(line+' '+word).strip()
        if font.getlength(cand)>max_width and line:out.append(line);line=word
        else:line=cand
        if font.getlength(line)>max_width:raise ValueError('single word exceeds frame width; choose smaller font')
    if line:out.append(line)
    if len(out)>max_lines:raise ValueError('text requires too many lines for safe mobile layout')
    return out

def fit_font_and_lines(text:str,font_path:str,initial_size:int,min_size:int,width:int,max_lines:int):
    for size in range(initial_size,min_size-1,-2):
        font=ImageFont.truetype(font_path,size)
        try:return font,layout_lines(text,font,width,max_lines)
        except ValueError:continue
    raise ValueError('no readable font fits safe screen width')
