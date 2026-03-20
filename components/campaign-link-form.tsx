"use client";

import { useActionState } from "react";

import { saveCampaignLinkAction } from "@/app/interno/campanhas/actions";
import { getCampaignLinkRoleLabel } from "@/lib/campaigns/navigation";
import { campaignLinkRoles, campaignLinkTypes, type PublicCampaignLink } from "@/lib/campaigns/types";

type CampaignLinkFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  campaignId: string;
  campaignSlug: string;
  link?: PublicCampaignLink | null;
  compact?: boolean;
};

const initialState: CampaignLinkFormState = { ok: false, message: "" };

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

export function CampaignLinkForm({ campaignId, campaignSlug, link, compact = false }: Props) {
  const [state, formAction, pending] = useActionState(saveCampaignLinkAction, initialState);

  return (
    <form className={`intake-form campaign-link-form ${compact ? "campaign-link-form--compact" : ""}`.trim()} action={formAction}>
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="campaign_slug" value={campaignSlug} />
      {link ? <input type="hidden" name="id" value={link.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Tipo de vínculo</span>
          <select name="link_type" defaultValue={link?.link_type ?? "page"}>
            {campaignLinkTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type] ?? type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Papel editorial</span>
          <select name="link_role" defaultValue={link?.link_role ?? "context"}>
            {campaignLinkRoles.map((role) => (
              <option key={role} value={role}>
                {getCampaignLinkRoleLabel(role)}
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
        {state.message || "O vínculo ajuda a costurar a campanha ao restante do projeto."}
      </p>
    </form>
  );
}
