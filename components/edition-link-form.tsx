"use client";

import { useActionState } from "react";

import { saveEditionLinkAction } from "@/app/interno/edicoes/actions";
import { getEditionLinkRoleLabel } from "@/lib/editions/navigation";
import { editorialEditionLinkRoles, editorialEditionLinkTypes, type EditorialEditionLink, type EditorialEditionLinkOption } from "@/lib/editions/types";

type EditionLinkFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  editionId: string;
  editionSlug: string;
  options: EditorialEditionLinkOption[];
  link?: EditorialEditionLink | null;
  compact?: boolean;
};

const initialState: EditionLinkFormState = { ok: false, message: "" };

const typeLabels: Record<string, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  campaign: "Campanha",
  impact: "Impacto",
  hub: "Eixo",
  territory: "Território",
  actor: "Ator",
  pattern: "Padrão",
  radar: "Radar",
  page: "Página",
  external: "Externo",
};

export function EditionLinkForm({ editionId, editionSlug, options, link, compact = false }: Props) {
  const [state, formAction, pending] = useActionState(saveEditionLinkAction, initialState);
  const listId = `edition-link-options-${editionId}`;

  return (
    <form className={`intake-form edition-link-form ${compact ? "edition-link-form--compact" : ""}`.trim()} action={formAction}>
      <input type="hidden" name="edition_id" value={editionId} />
      <input type="hidden" name="edition_slug" value={editionSlug} />
      {link ? <input type="hidden" name="id" value={link.id} /> : null}

      {options.length ? (
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option.value} value={option.value} label={option.label} />
          ))}
        </datalist>
      ) : null}

      <div className="grid-2">
        <label className="field">
          <span>Tipo de vínculo</span>
          <select name="link_type" defaultValue={link?.link_type ?? "page"}>
            {editorialEditionLinkTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type] ?? type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Papel editorial</span>
          <select name="link_role" defaultValue={link?.link_role ?? "context"}>
            {editorialEditionLinkRoles.map((role) => (
              <option key={role} value={role}>
                {getEditionLinkRoleLabel(role)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Chave da peça</span>
          <input name="link_key" type="text" list={listId} defaultValue={link?.link_key ?? ""} placeholder="agora" required />
        </label>

        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={link?.sort_order ?? 0} />
        </label>
      </div>

      <label className="field">
        <span>Nota</span>
        <textarea name="note" rows={3} defaultValue={link?.note ?? ""} placeholder="Explique por que esta peça entra na edição." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Destaque</span>
          <div className="support-box">
            <label className="check">
              <input name="featured" type="checkbox" defaultChecked={link?.featured ?? false} />
              <span>Marcar como destaque</span>
            </label>
          </div>
        </label>

        <label className="field">
          <span>Ação</span>
          <div className="support-box">
            <label className="check">
              <input name="intent" type="radio" value="save" defaultChecked />
              <span>Salvar</span>
            </label>
            {link ? (
              <label className="check">
                <input name="intent" type="radio" value="delete" />
                <span>Remover</span>
              </label>
            ) : null}
          </div>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Processando..." : link ? "Salvar vínculo" : "Criar vínculo"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "O vínculo organiza a circulação da edição."}
      </p>
    </form>
  );
}
