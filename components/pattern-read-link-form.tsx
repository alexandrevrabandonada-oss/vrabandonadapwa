"use client";

import { useActionState } from "react";

import { savePatternReadLinkAction } from "@/app/interno/padroes/actions";
import { patternReadLinkRoles } from "@/lib/patterns/types";
import { getPatternReadLinkRoleLabel } from "@/lib/patterns/navigation";
import type { PatternReadLinkOption } from "@/lib/patterns/types";

type PatternReadLinkFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  patternReadId: string;
  patternReadSlug: string;
  options: PatternReadLinkOption[];
  existingLinksCount: number;
};

const initialState: PatternReadLinkFormState = { ok: false, message: "" };

export function PatternReadLinkForm({ patternReadId, patternReadSlug, options, existingLinksCount }: Props) {
  const [state, formAction, pending] = useActionState(savePatternReadLinkAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      <input type="hidden" name="pattern_read_id" value={patternReadId} />
      <input type="hidden" name="pattern_read_slug" value={patternReadSlug} />

      <label className="field">
        <span>Peça relacionada</span>
        <select name="link_ref" defaultValue="" required>
          <option value="" disabled>
            Escolha um item já publicado
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Papel no padrão</span>
          <select name="link_role" defaultValue="context" required>
            {patternReadLinkRoles.map((role) => (
              <option key={role} value={role}>
                {getPatternReadLinkRoleLabel(role)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={existingLinksCount + 1} />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Ano ou marco</span>
          <input name="timeline_year" type="number" min={1900} max={2100} step={1} placeholder="2026" />
        </label>

        <label className="field">
          <span>Rótulo temporal</span>
          <input name="timeline_label" type="text" placeholder="2026 / fim dos anos 1990" />
        </label>
      </div>

      <label className="field">
        <span>Nota da timeline</span>
        <textarea name="timeline_note" rows={3} placeholder="Explique por que esta peça entra neste padrão." />
      </label>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" />
          <span>Destacar este vínculo</span>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Vinculando..." : "Vincular peça"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || `Use os ${existingLinksCount} vínculo(s) já existentes como referência editorial.`}
      </p>
    </form>
  );
}
