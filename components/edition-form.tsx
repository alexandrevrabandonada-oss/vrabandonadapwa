"use client";

import { useActionState } from "react";

import { saveEditionAction } from "@/app/interno/edicoes/actions";
import { getEditionStatusLabel, getEditionTypeLabel } from "@/lib/editions/navigation";
import { editorialEditionStatuses, editorialEditionTypes, type EditorialEdition } from "@/lib/editions/types";

type EditionFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  edition?: EditorialEdition | null;
};

const initialState: EditionFormState = { ok: false, message: "" };

export function EditionForm({ edition }: Props) {
  const [state, formAction, pending] = useActionState(saveEditionAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {edition ? <input type="hidden" name="id" value={edition.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={edition?.title ?? ""} placeholder="Edição do momento" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={edition?.slug ?? ""} placeholder="edicao-do-momento" required readOnly={Boolean(edition)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={edition?.excerpt ?? ""} placeholder="Síntese curta do caderno." />
      </label>

      <label className="field">
        <span>Descrição / tese</span>
        <textarea name="description" rows={5} defaultValue={edition?.description ?? ""} placeholder="Explique por que esta edição existe e o que ela condensa." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Tipo de edição</span>
          <select name="edition_type" defaultValue={edition?.edition_type ?? "city_pulse"}>
            {editorialEditionTypes.map((type) => (
              <option key={type} value={type}>
                {getEditionTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Período</span>
          <input name="period_label" type="text" defaultValue={edition?.period_label ?? ""} placeholder="Semana de 20 a 27 de março de 2026" />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Data de publicação</span>
          <input name="published_at" type="datetime-local" defaultValue={edition?.published_at ? new Date(edition.published_at).toISOString().slice(0, 16) : ""} />
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={edition?.status ?? "draft"}>
            {editorialEditionStatuses.map((status) => (
              <option key={status} value={status}>
                {getEditionStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Imagem de capa</span>
        <input name="cover_image_url" type="url" defaultValue={edition?.cover_image_url ?? ""} placeholder="/editorial/covers/..." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={edition?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={edition?.public_visibility ? "true" : "false"}>
            <option value="true">Pública</option>
            <option value="false">Interna</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Destaque</span>
        <div className="support-box">
          <label className="check">
            <input name="featured" type="checkbox" defaultChecked={edition?.featured ?? false} />
            <span>Marcar como destaque</span>
          </label>
        </div>
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : edition ? "Salvar edição" : "Criar edição"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "A edição condensa o melhor do ecossistema para circulação pública."}
      </p>
    </form>
  );
}
