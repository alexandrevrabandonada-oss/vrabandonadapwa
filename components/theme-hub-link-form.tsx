"use client";

import { useActionState } from "react";

import { saveThemeHubLinkAction } from "@/app/interno/eixos/actions";
import type { ThemeHub, ThemeHubLink } from "@/lib/hubs/types";
import { themeHubLinkRoles } from "@/lib/hubs/types";
import { getThemeHubLinkRoleLabel } from "@/lib/hubs/navigation";
import type { ThemeHubLinkOption } from "@/lib/hubs/resolve";

type ThemeHubLinkFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  hub: ThemeHub;
  options: ThemeHubLinkOption[];
  existingLinks: ThemeHubLink[];
};

const initialState: ThemeHubLinkFormState = { ok: false, message: "" };

export function ThemeHubLinkForm({ hub, options, existingLinks }: Props) {
  const [state, formAction, pending] = useActionState(saveThemeHubLinkAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      <input type="hidden" name="theme_hub_id" value={hub.id} />

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
          <span>Papel no eixo</span>
          <select name="link_role" defaultValue="context" required>
            {themeHubLinkRoles.map((role) => (
              <option key={role} value={role}>
                {getThemeHubLinkRoleLabel(role)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={0} />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Ano</span>
          <input name="timeline_year" type="number" min={1900} max={2100} step={1} placeholder="2026" />
        </label>

        <label className="field">
          <span>Rótulo temporal</span>
          <input name="timeline_label" type="text" placeholder="2026" />
        </label>
      </div>

      <label className="field">
        <span>Nota</span>
        <textarea name="timeline_note" rows={3} placeholder="Explique por que esta peça entra no eixo." />
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
        {state.message || `Use ${existingLinks.length} vínculo(s) já existentes como referência editorial.`}
      </p>
    </form>
  );
}
