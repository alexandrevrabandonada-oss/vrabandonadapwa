"use client";

import { useActionState } from "react";

import { saveTimelineHighlightAction } from "@/app/interno/cronologia/marcos/actions";
import { timelineHighlightStatuses, timelineHighlightTypes } from "@/lib/timeline/highlights";
import { getTimelineHighlightStatusLabel, getTimelineHighlightTypeLabel } from "@/lib/timeline/highlights";
import type { TimelineHighlight } from "@/lib/timeline/highlights";

type TimelineHighlightFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  highlight?: TimelineHighlight | null;
};

const initialState: TimelineHighlightFormState = { ok: false, message: "" };

export function TimelineHighlightForm({ highlight }: Props) {
  const [state, formAction, pending] = useActionState(saveTimelineHighlightAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {highlight ? <input type="hidden" name="id" value={highlight.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={highlight?.title ?? ""} placeholder="Origem da cidade operária" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={highlight?.slug ?? ""} placeholder="origem-da-cidade-operaria" />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <textarea name="excerpt" rows={3} defaultValue={highlight?.excerpt ?? ""} placeholder="Uma síntese curta do marco." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={5} defaultValue={highlight?.description ?? ""} placeholder="Explique por que este marco é central para a leitura temporal." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Hipótese / pergunta central</span>
          <textarea name="lead_question" rows={3} defaultValue={highlight?.lead_question ?? ""} placeholder="O que este marco revela?" />
        </label>

        <div className="grid-2">
          <label className="field">
            <span>Tipo de marco</span>
            <select name="highlight_type" defaultValue={highlight?.highlight_type ?? "investigation_marker"}>
              {timelineHighlightTypes.map((type) => (
                <option key={type} value={type}>
                  {getTimelineHighlightTypeLabel(type)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={highlight?.status ?? "draft"}>
              {timelineHighlightStatuses.map((status) => (
                <option key={status} value={status}>
                  {getTimelineHighlightStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Rótulo de data</span>
            <input name="date_label" type="text" defaultValue={highlight?.date_label ?? ""} placeholder="1941 / 1990–2004 / 2018–2026" />
          </label>

          <label className="field">
            <span>Período</span>
            <input name="period_label" type="text" defaultValue={highlight?.period_label ?? ""} placeholder="Origem industrial" />
          </label>

          <label className="field">
            <span>Ano inicial</span>
            <input name="year_start" type="number" min={1900} step={1} defaultValue={highlight?.year_start ?? undefined} placeholder="1941" />
          </label>

          <label className="field">
            <span>Ano final</span>
            <input name="year_end" type="number" min={1900} step={1} defaultValue={highlight?.year_end ?? undefined} placeholder="1948" />
          </label>

          <label className="field">
            <span>Ordem</span>
            <input name="sort_order" type="number" min={0} step={1} defaultValue={highlight?.sort_order ?? 0} />
          </label>

          <label className="field">
            <span>Capa</span>
            <input name="cover_image_url" type="text" defaultValue={highlight?.cover_image_url ?? ""} placeholder="/editorial/covers/arquivo-inicial.svg" />
          </label>
        </div>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={highlight?.featured ?? false} />
          <span>Destacar este marco</span>
        </label>
        <label className="check">
          <input name="public_visibility" type="checkbox" defaultChecked={highlight?.public_visibility ?? true} />
          <span>Publicar no site</span>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : highlight ? "Atualizar marco" : "Criar marco"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "Use este bloco para condensar uma virada temporal pública, não um banco histórico frio."}
      </p>
    </form>
  );
}
