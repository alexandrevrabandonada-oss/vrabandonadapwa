"use client";

import { useActionState } from "react";

import { saveInvestigationDossierUpdateAction } from "@/app/interno/dossies/[id]/updates/actions";
import { dossierUpdateTypes, dossierUpdateTypeLabels, type InvestigationDossierUpdate } from "@/lib/dossiers/types";

type DossierUpdateFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  dossierId: string;
  update?: InvestigationDossierUpdate | null;
};

const initialState: DossierUpdateFormState = { ok: false, message: "" };

export function DossierUpdateForm({ dossierId, update }: Props) {
  const [state, formAction, pending] = useActionState(saveInvestigationDossierUpdateAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      <input type="hidden" name="dossier_id" value={dossierId} />
      {update ? <input type="hidden" name="id" value={update.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={update?.title ?? ""} placeholder="Nova movimentação, evidência ou chamada" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={update?.slug ?? ""} placeholder="opcional; geramos se ficar vazio" />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Tipo de update</span>
          <select name="update_type" defaultValue={update?.update_type ?? "note"} required>
            {dossierUpdateTypes.map((type) => (
              <option key={type} value={type}>
                {dossierUpdateTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={update?.sort_order ?? 0} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <textarea name="excerpt" rows={3} defaultValue={update?.excerpt ?? ""} placeholder="Uma frase curta sobre o que mudou." />
      </label>

      <label className="field">
        <span>Corpo</span>
        <textarea name="body" rows={8} defaultValue={update?.body ?? ""} placeholder="Explique o andamento, o que foi confirmado ou o que segue em aberto." required />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Publicação</span>
          <select name="published" defaultValue={update?.published ? "true" : "false"}>
            <option value="false">Rascunho interno</option>
            <option value="true">Publicado no dossiê</option>
          </select>
        </label>

        <label className="field">
          <span>Destaque</span>
          <div className="support-box">
            <label className="check">
              <input name="featured" type="checkbox" defaultChecked={update?.featured ?? false} />
              <span>Marcar como update principal</span>
            </label>
          </div>
        </label>
      </div>

      <div className="support-box">
        <p className="eyebrow">Como usar</p>
        <p>
          Atualizações servem para registrar andamento, nova prova, correção ou convocação. Se marcar como publicado, o item entra na leitura pública do dossiê.
        </p>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : update ? "Salvar update" : "Criar update"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "Mantenha o update curto, claro e útil para a investigação pública."}
      </p>
    </form>
  );
}
