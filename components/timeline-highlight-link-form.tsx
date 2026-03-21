"use client";

import { useActionState } from "react";

import { saveTimelineHighlightLinkAction } from "@/app/interno/cronologia/marcos/actions";
import { timelineHighlightLinkRoles } from "@/lib/timeline/highlights";
import { getTimelineHighlightLinkRoleLabel } from "@/lib/timeline/highlights";
import type { TimelineHighlightLinkOption } from "@/lib/timeline/highlights";

type TimelineHighlightLinkFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  highlightId: string;
  highlightSlug: string;
  options: TimelineHighlightLinkOption[];
  existingLinksCount: number;
};

const initialState: TimelineHighlightLinkFormState = { ok: false, message: "" };

export function TimelineHighlightLinkForm({ highlightId, highlightSlug, options, existingLinksCount }: Props) {
  const [state, formAction, pending] = useActionState(saveTimelineHighlightLinkAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      <input type="hidden" name="timeline_highlight_id" value={highlightId} />
      <input type="hidden" name="timeline_highlight_slug" value={highlightSlug} />

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
          <span>Papel no marco</span>
          <select name="link_role" defaultValue="context" required>
            {timelineHighlightLinkRoles.map((role) => (
              <option key={role} value={role}>
                {getTimelineHighlightLinkRoleLabel(role)}
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
        <textarea name="timeline_note" rows={3} placeholder="Explique por que esta peça entra neste marco." />
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
