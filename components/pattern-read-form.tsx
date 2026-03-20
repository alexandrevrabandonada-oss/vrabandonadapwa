"use client";

import { useActionState } from "react";

import { savePatternReadAction } from "@/app/interno/padroes/actions";
import { patternReadStatuses, patternReadTypes } from "@/lib/patterns/types";
import { getPatternReadStatusLabel, getPatternReadTypeLabel } from "@/lib/patterns/navigation";
import type { PatternRead } from "@/lib/patterns/types";

type PatternReadFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  patternRead?: PatternRead | null;
};

const initialState: PatternReadFormState = { ok: false, message: "" };

export function PatternReadForm({ patternRead }: Props) {
  const [state, formAction, pending] = useActionState(savePatternReadAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {patternRead ? <input type="hidden" name="id" value={patternRead.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={patternRead?.title ?? ""} placeholder="A poeira que volta" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={patternRead?.slug ?? ""} placeholder="a-poeira-que-volta" />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <textarea name="excerpt" rows={3} defaultValue={patternRead?.excerpt ?? ""} placeholder="Uma leitura curta sobre a recorrência estrutural." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={5} defaultValue={patternRead?.description ?? ""} placeholder="Explique o padrão como leitura estrutural da cidade." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Hipótese / pergunta central</span>
          <textarea name="lead_question" rows={3} defaultValue={patternRead?.lead_question ?? ""} placeholder="O que se repete aqui?" />
        </label>

        <div className="grid-2">
          <label className="field">
            <span>Tipo de padrão</span>
            <select name="pattern_type" defaultValue={patternRead?.pattern_type ?? "thematic_pattern"}>
              {patternReadTypes.map((type) => (
                <option key={type} value={type}>
                  {getPatternReadTypeLabel(type)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={patternRead?.status ?? "draft"}>
              {patternReadStatuses.map((status) => (
                <option key={status} value={status}>
                  {getPatternReadStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Ordem</span>
            <input name="sort_order" type="number" min={0} step={1} defaultValue={patternRead?.sort_order ?? 0} />
          </label>

          <label className="field">
            <span>Capa</span>
            <input name="cover_image_url" type="text" defaultValue={patternRead?.cover_image_url ?? ""} placeholder="/editorial/covers/arquivo-inicial.svg" />
          </label>
        </div>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={patternRead?.featured ?? false} />
          <span>Destacar este padrão</span>
        </label>
        <label className="check">
          <input name="public_visibility" type="checkbox" defaultChecked={patternRead?.public_visibility ?? true} />
          <span>Publicar no site</span>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : patternRead ? "Atualizar padrão" : "Criar padrão"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "Use este bloco para registrar o padrão como hipótese pública, não como relatório frio."}
      </p>
    </form>
  );
}
