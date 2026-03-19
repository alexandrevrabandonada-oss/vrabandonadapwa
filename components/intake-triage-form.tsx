"use client";

import { useActionState } from "react";

import { updateIntakeAction } from "@/app/interno/intake/actions";
import { intakeStatusLabels, intakeStatuses, type IntakeSubmission } from "@/lib/intake/types";

type Props = {
  submission: IntakeSubmission;
};

const initialState = { ok: false, message: "" };

export function IntakeTriageForm({ submission }: Props) {
  const [state, formAction, pending] = useActionState(
    updateIntakeAction,
    initialState,
  );

  return (
    <form className="intake-form" action={formAction}>
      <input type="hidden" name="id" value={submission.id} />

      <div className="grid-2">
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={submission.status} required>
            {intakeStatuses.map((status) => (
              <option key={status} value={status}>
                {intakeStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Resumo seguro</span>
          <input
            name="safe_public_summary"
            type="text"
            defaultValue={submission.safe_public_summary ?? ""}
            placeholder="Versão limpa para eventual uso público"
            maxLength={240}
          />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Notas internas</span>
          <textarea
            name="internal_notes"
            rows={5}
            defaultValue={submission.internal_notes ?? ""}
            placeholder="Triagem, riscos, contatos, próximos passos"
          />
        </label>

        <div className="support-box">
          <h3>Flags editoriais</h3>
          <label className="check">
            <input name="is_sensitive" type="checkbox" defaultChecked={submission.is_sensitive} />
            <span>Conteúdo sensível</span>
          </label>
          <label className="check">
            <input name="contact_allowed" type="checkbox" defaultChecked={submission.contact_allowed} />
            <span>Pode contatar a fonte</span>
          </label>
          <p style={{ marginTop: "0.75rem" }}>
            Atualize status, notas e cuidado editorial antes de qualquer publicação.
          </p>
        </div>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar triagem"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "As mudanças ficam registradas na fila interna."}
      </p>
    </form>
  );
}
