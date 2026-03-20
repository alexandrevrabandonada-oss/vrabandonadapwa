"use client";

import { useActionState } from "react";

import { addInvestigationDossierLinkAction } from "@/app/interno/dossies/actions";
import { getDossierLinkRoleLabel } from "@/lib/dossiers/navigation";
import { dossierLinkRoles, type DossierResolvedLink, type InvestigationDossier } from "@/lib/dossiers/types";

type DossierLinkFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  dossier: InvestigationDossier;
  options: { value: string; label: string }[];
  existingLinks: DossierResolvedLink[];
};

const initialState: DossierLinkFormState = { ok: false, message: "" };

export function DossierLinkForm({ dossier, options, existingLinks }: Props) {
  const [state, formAction, pending] = useActionState(addInvestigationDossierLinkAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      <input type="hidden" name="dossier_id" value={dossier.id} />

      <label className="field">
        <span>Peça relacionada</span>
        <select name="link_ref" defaultValue="" required>
          <option value="" disabled>
            Selecione uma peça
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
          <span>Papel editorial</span>
          <select name="link_role" defaultValue="context">
            {dossierLinkRoles.map((role) => (
              <option key={role} value={role}>
                {getDossierLinkRoleLabel(role)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ano ou marco</span>
          <input name="timeline_year" type="number" min={1900} max={2100} step={1} placeholder="2026" />
        </label>
      </div>

      <label className="field">
        <span>Rótulo temporal</span>
        <input name="timeline_label" type="text" placeholder="anos 1990 / 2026 / fim dos anos 1990" />
      </label>

      <label className="field">
        <span>Nota da timeline</span>
        <textarea name="timeline_note" rows={3} placeholder="Frase curta para orientar a leitura do caso." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={existingLinks.length + 1} />
        </label>

        <label className="field">
          <span>Destaque interno</span>
          <div className="support-box">
            <label className="check">
              <input name="featured" type="checkbox" defaultChecked={false} />
              <span>Destacar esta peça</span>
            </label>
          </div>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Vinculando..." : "Adicionar vínculo"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "O vínculo entra no percurso do dossiê sem expor camadas internas."}
      </p>
    </form>
  );
}
