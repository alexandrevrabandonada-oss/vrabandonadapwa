"use client";

import { useActionState } from "react";

import { saveInvestigationDossierAction } from "@/app/interno/dossies/actions";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { dossierStatuses, type InvestigationDossier } from "@/lib/dossiers/types";

type DossierFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  dossier?: InvestigationDossier | null;
};

const initialState: DossierFormState = { ok: false, message: "" };

export function DossierForm({ dossier }: Props) {
  const [state, formAction, pending] = useActionState(saveInvestigationDossierAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {dossier ? <input type="hidden" name="id" value={dossier.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={dossier?.title ?? ""} placeholder="Ar, fumaça e rotina industrial" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={dossier?.slug ?? ""} placeholder="ar-fumaca-e-rotina-industrial" required readOnly={Boolean(dossier)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={dossier?.excerpt ?? ""} placeholder="Linha de investigação pública" />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={5} defaultValue={dossier?.description ?? ""} placeholder="Explique o contexto, o percurso e o que este dossiê quer provar." />
      </label>

      <label className="field">
        <span>Pergunta central</span>
        <input name="lead_question" type="text" defaultValue={dossier?.lead_question ?? ""} placeholder="Qual é a hipótese investigativa?" />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Período</span>
          <input name="period_label" type="text" defaultValue={dossier?.period_label ?? ""} placeholder="Anos 1990-2020" />
        </label>

        <label className="field">
          <span>Território</span>
          <input name="territory_label" type="text" defaultValue={dossier?.territory_label ?? ""} placeholder="Aterrado e entorno industrial" />
        </label>
      </div>

      <label className="field">
        <span>Imagem de capa</span>
        <input name="cover_image_url" type="url" defaultValue={dossier?.cover_image_url ?? ""} placeholder="/archive/assets/..." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={dossier?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Status público</span>
          <select name="status" defaultValue={dossier?.status ?? "draft"}>
            {dossierStatuses.map((status) => (
              <option key={status} value={status}>
                {getDossierStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={dossier?.public_visibility ? "true" : "false"}>
            <option value="true">Pública</option>
            <option value="false">Interna</option>
          </select>
        </label>

        <label className="field">
          <span>Publicação em destaque</span>
          <div className="support-box">
            <label className="check">
              <input name="featured" type="checkbox" defaultChecked={dossier?.featured ?? false} />
              <span>Marcar como destaque</span>
            </label>
          </div>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : dossier ? "Salvar dossiê" : "Criar dossiê"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "O dossiê amarra investigação, memória e acervo numa mesma linha de leitura."}
      </p>
    </form>
  );
}
