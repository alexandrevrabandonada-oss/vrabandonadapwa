"use client";

import { useActionState } from "react";

import { saveImpactLinkAction } from "@/app/interno/impacto/actions";
import { getImpactLinkRoleLabel } from "@/lib/impact/navigation";
import { impactLinkRoles, impactLinkTypes, type PublicImpactLink } from "@/lib/impact/types";

type ImpactLinkFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  impactId: string;
  impactSlug: string;
  link?: PublicImpactLink | null;
  compact?: boolean;
};

const initialState: ImpactLinkFormState = { ok: false, message: "" };

const typeLabels: Record<string, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  series: "Série",
  hub: "Eixo",
  page: "Página",
  external: "Externo",
};

export function ImpactLinkForm({ impactId, impactSlug, link, compact = false }: Props) {
  const [state, formAction, pending] = useActionState(saveImpactLinkAction, initialState);

  return (
    <form className={`intake-form impact-link-form ${compact ? "impact-link-form--compact" : ""}`.trim()} action={formAction}>
      <input type="hidden" name="impact_id" value={impactId} />
      <input type="hidden" name="impact_slug" value={impactSlug} />
      {link ? <input type="hidden" name="id" value={link.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Tipo de vínculo</span>
          <select name="link_type" defaultValue={link?.link_type ?? "page"}>
            {impactLinkTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type] ?? type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Papel editorial</span>
          <select name="link_role" defaultValue={link?.link_role ?? "context"}>
            {impactLinkRoles.map((role) => (
              <option key={role} value={role}>
                {getImpactLinkRoleLabel(role)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Chave da peça</span>
          <input name="link_key" type="text" defaultValue={link?.link_key ?? ""} placeholder="ar-poeira-e-pressao" required />
        </label>

        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={link?.sort_order ?? 0} />
        </label>
      </div>

      <label className="field">
        <span>Nota</span>
        <textarea name="note" rows={3} defaultValue={link?.note ?? ""} placeholder="Explique por que este vínculo entra no percurso." />
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
        {state.message || "O vínculo ajuda a costurar o impacto ao restante do projeto."}
      </p>
    </form>
  );
}
