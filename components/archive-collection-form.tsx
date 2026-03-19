"use client";

import { useActionState } from "react";

import { saveArchiveCollectionAction } from "@/app/interno/acervo/colecoes/actions";
import type { ArchiveCollection } from "@/lib/archive/types";

type ArchiveCollectionFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  collection?: ArchiveCollection | null;
};

const initialState: ArchiveCollectionFormState = { ok: false, message: "" };

export function ArchiveCollectionForm({ collection }: Props) {
  const [state, formAction, pending] = useActionState(saveArchiveCollectionAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {collection ? <input type="hidden" name="id" value={collection.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={collection?.title ?? ""} placeholder="Cidade operária" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input
            name="slug"
            type="text"
            defaultValue={collection?.slug ?? ""}
            placeholder="cidade-operaria"
            required
            readOnly={Boolean(collection)}
          />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={collection?.excerpt ?? ""} placeholder="Recorte editorial da coleção" />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={collection?.description ?? ""}
          placeholder="Explique o contexto da coleção e o percurso que ela propõe."
        />
      </label>

      <label className="field">
        <span>Imagem de capa</span>
        <input name="cover_image_url" type="url" defaultValue={collection?.cover_image_url ?? ""} placeholder="/archive/assets/..." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={collection?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={collection?.public_visibility ? "true" : "false"}>
            <option value="true">Pública</option>
            <option value="false">Interna</option>
          </select>
        </label>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={collection?.featured ?? false} />
          <span>Marcar como destaque</span>
        </label>
        <p className="form-status">Os assets entram na coleção pelo campo Coleção do cadastro de cada anexo.</p>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : collection ? "Salvar coleção" : "Criar coleção"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "Coleções ajudam o acervo a virar dossiê visual sem perder a simplicidade."}
      </p>
    </form>
  );
}
