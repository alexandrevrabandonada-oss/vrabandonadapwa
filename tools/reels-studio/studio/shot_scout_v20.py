"""Aço Gráfico V20: rank authentic local video segments for HUMAN editorial review.

No claim of real-world action authenticity or publishing rights from optical flow.
Input must have byte-integrity manifest produced by the licensed-source acquisition path.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw
from studio.actionqa import motion_between


def authenticate(path: Path, manifest: Path) -> dict:
    if not path.is_file() or not manifest.is_file():
        raise ValueError("missing source file or manifest")
    record = json.loads(manifest.read_text(encoding="utf8"))
    for field in ("id", "sha1", "size_bytes", "source_url", "author", "license_review"):
        if not record.get(field):
            raise ValueError(f"unverified origin: missing {field}")
    if record.get("publication_approved") is not False:
        raise ValueError("only internal pre-publication sources permitted")
    digest = hashlib.sha1()
    with path.open("rb") as file:
        while chunk := file.read(1024 * 1024):
            digest.update(chunk)
    if digest.hexdigest() != record["sha1"].lower() or path.stat().st_size != int(record["size_bytes"]):
        raise ValueError("source integrity mismatch")
    return record


def frame_at(cap: cv2.VideoCapture, t: float, max_width: int = 480) -> np.ndarray:
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, frame = cap.read()
    if not ok:
        raise ValueError(f"could not decode video at {t:.2f} seconds")
    h, w = frame.shape[:2]
    scale = min(1., max_width / w)
    return cv2.resize(frame, (round(w * scale), round(h * scale)), interpolation=cv2.INTER_AREA)


def cut_distance(first: np.ndarray, second: np.ndarray) -> float:
    # Cut-like visual discontinuity is NOT proof of camera edit or content.
    a = cv2.cvtColor(first, cv2.COLOR_BGR2HSV)
    b = cv2.cvtColor(second, cv2.COLOR_BGR2HSV)
    h1 = cv2.calcHist([a], [0, 1], None, [24, 12], [0, 180, 0, 256])
    h2 = cv2.calcHist([b], [0, 1], None, [24, 12], [0, 180, 0, 256])
    cv2.normalize(h1, h1)
    cv2.normalize(h2, h2)
    return float(cv2.compareHist(h1, h2, cv2.HISTCMP_BHATTACHARYYA))


def measure_window(cap: cv2.VideoCapture, start: float, length: float) -> dict:
    records = []
    cuts = 0
    for frac in (.16, .42, .68):
        t = start + length * frac
        delta = min(.25, length * .10)
        first, second = frame_at(cap, t), frame_at(cap, t + delta)
        discontinuity = cut_distance(first, second)
        if discontinuity > .52:
            cuts += 1
            continue
        record = motion_between(first, second)
        gray = cv2.cvtColor(first, cv2.COLOR_BGR2GRAY)
        records.append((record, float(gray.mean()), float(cv2.Laplacian(gray, cv2.CV_64F).var())))
    p95 = float(np.median([r["local_motion_p95_px"] for r, _, _ in records])) if records else 0.
    share = float(np.median([r["local_motion_share"] for r, _, _ in records])) if records else 0.
    camera = float(np.median([r["camera_motion_px"] for r, _, _ in records])) if records else 0.
    brightness = float(np.median([b for _, b, _ in records])) if records else 0.
    focus = float(np.median([f for _, _, f in records])) if records else 0.
    return {"local_motion_p95": round(p95, 3), "local_motion_share": round(share, 3),
            "camera_motion_px": round(camera, 3), "median_brightness": round(brightness, 2),
            "sharpness": round(focus, 2), "cut_like_pairs": cuts, "valid_pairs": len(records)}


def rank_metrics(metrics: dict) -> dict:
    local = metrics["local_motion_p95"]
    share = metrics["local_motion_share"]
    # No global camera pan can by itself qualify as subject action.
    action_candidate = local >= 1.3 and share >= .05 and metrics["valid_pairs"] >= 2
    motion_score = 45 * min(1., local / 5.) + 25 * min(1., share / .25)
    readability = 10 * min(1., metrics["sharpness"] / 120.)
    exposure = 10 if 35 <= metrics["median_brightness"] <= 225 else 0
    stability = max(0, 10 - 6 * metrics["cut_like_pairs"])
    score = round(motion_score + readability + exposure + stability, 2)
    reasons = []
    if not action_candidate:
        reasons.append("MOVIMENTO_LOCAL_INSUFICIENTE")
    if metrics["cut_like_pairs"]:
        reasons.append("POSSIVEL_CORTE_NO_TRECHO")
    if not 35 <= metrics["median_brightness"] <= 225:
        reasons.append("EXPOSICAO_REVISAR")
    return {"priority_score_heuristic": score, "action_candidate": action_candidate,
            "review_flags": reasons, "status": "HUMAN_REVIEW_REQUIRED"}


def scout(path: Path, manifest: Path, window: float = 2.8, stride: float = 2.8,
          top: int = 6, max_seconds: float | None = None) -> dict:
    if not (1. <= window <= 8.) or not (1. <= stride <= 12.) or not (1 <= top <= 24):
        raise ValueError("unsafe scan parameters")
    source = authenticate(path, manifest)
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise ValueError("source video cannot be decoded")
    try:
        fps = float(cap.get(cv2.CAP_PROP_FPS))
        frames = float(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if fps <= 0 or frames <= 0:
            raise ValueError("unreadable video timebase")
        duration = frames / fps
        limit = min(duration, max_seconds) if max_seconds is not None else duration
        if limit <= window:
            raise ValueError("input video too short")
        windows = []
        start = 0.
        while start + window + .02 <= limit:
            metrics = measure_window(cap, start, window)
            windows.append({"start_sec": round(start, 3), "end_sec": round(start + window, 3),
                            "metrics": metrics, **rank_metrics(metrics)})
            start += stride
    finally:
        cap.release()
    candidates = sorted((c for c in windows if c["action_candidate"]),
                        key=lambda x: (-x["priority_score_heuristic"], x["start_sec"]))
    chosen = []
    for c in candidates:
        if all(c["start_sec"] >= prior["end_sec"] or c["end_sec"] <= prior["start_sec"]
               for prior in chosen):
            chosen.append(c)
        if len(chosen) >= top:
            break
    return {
        "tool_version": "v0.20", "source_id": source["id"], "source_sha1": source["sha1"],
        "source_url": source["source_url"], "author_declaration": source["author"],
        "license_review": source["license_review"], "duration_sec": round(duration, 3),
        "windows_scanned": len(windows), "action_candidate_count": len(candidates),
        "selected_for_review": chosen, "all_windows": windows,
        "rights_cleared": False, "publication_approved": False,
        "aesthetic_quality_certified": False, "footage_authenticity_certified": False,
        "note": "Optical-flow heuristic only; human must verify factual context, action, source and rights."
    }


def contact_sheet(video: Path, selected: list[dict], dest: Path) -> None:
    width = 840
    frame_w, frame_h = 390, 225
    row_h = 295
    canvas = Image.new("RGB", (width, max(150, len(selected) * row_h + 90)), (10, 13, 33))
    d = ImageDraw.Draw(canvas)
    d.text((18, 12), "ACO GRAFICO V20 | TOMADAS PARA REVISAO HUMANA", fill=(255, 222, 92))
    d.text((18, 38), "CANDIDATOS, NAO CERTIFICACAO DE ACAO, DIREITOS OU PUBLICACAO", fill=(250, 240, 205))
    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        raise ValueError("video unreadable")
    try:
        for index, item in enumerate(selected):
            y = 77 + index * row_h
            for col, frac in enumerate((.23, .72)):
                t = item["start_sec"] + (item["end_sec"] - item["start_sec"]) * frac
                frame = frame_at(cap, t, 540)
                h, w = frame.shape[:2]
                scale = min(frame_w / w, frame_h / h)
                rgb = cv2.cvtColor(cv2.resize(frame, (int(w*scale), int(h*scale))), cv2.COLOR_BGR2RGB)
                image = Image.fromarray(rgb)
                x = 18 + col * 416 + (frame_w-image.width)//2
                canvas.paste(image, (x, y))
            d.text((18, y + 238), f"#{index+1}  {item['start_sec']:.2f}-{item['end_sec']:.2f}s"
                   f"  score {item['priority_score_heuristic']:.1f}   REVISAO OBRIGATORIA", fill=(255, 222, 92))
            d.text((18, y + 257), " | ".join(item["review_flags"]) or "Sem alertas automaticos", fill=(244, 237, 220))
    finally:
        cap.release()
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, quality=90)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--window", type=float, default=2.8)
    parser.add_argument("--stride", type=float, default=2.8)
    parser.add_argument("--top", type=int, default=6)
    parser.add_argument("--max-seconds", type=float, default=None)
    args = parser.parse_args()
    report = scout(args.video, args.manifest, args.window, args.stride, args.top, args.max_seconds)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "V20_TRIAGEM.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf8")
    contact_sheet(args.video, report["selected_for_review"], args.out / "V20_CONTATO.jpg")
    print(json.dumps({k: v for k, v in report.items() if k != "all_windows"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
