"use client";

import { useActionState } from "react";

import { saveCampaignAction } from "@/app/interno/campanhas/actions";
import { getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import { campaignStatuses, campaignTypes, type PublicCampaign } from "@/lib/campaigns/types";

type CampaignFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  campaign?: PublicCampaign | null;
};

const initialState: CampaignFormState = { ok: false, message: "" };

export function CampaignForm({ campaign }: Props) {
  const [state, formAction, pending] = useActionState(saveCampaignAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={campaign?.title ?? ""} placeholder="Respira Volta Redonda" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={campaign?.slug ?? ""} placeholder="respira-volta-redonda" required readOnly={Boolean(campaign)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={campaign?.excerpt ?? ""} placeholder="Chamado público sobre ar, fumaça e impacto industrial." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={5} defaultValue={campaign?.description ?? ""} placeholder="Explique o que está em jogo, o foco do momento e por que isso importa." />
      </label>

      <label className="field">
        <span>Pergunta central</span>
        <input name="lead_question" type="text" defaultValue={campaign?.lead_question ?? ""} placeholder="O que a cidade está respirando agora?" />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Tipo de campanha</span>
          <select name="campaign_type" defaultValue={campaign?.campaign_type ?? "call"}>
            {campaignTypes.map((type) => (
              <option key={type} value={type}>
                {getCampaignTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={campaign?.status ?? "upcoming"}>
            {campaignStatuses.map((status) => (
              <option key={status} value={status}>
                {getCampaignStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Data de início</span>
          <input name="start_date" type="date" defaultValue={campaign?.start_date ?? ""} />
        </label>

        <label className="field">
          <span>Data de término</span>
          <input name="end_date" type="date" defaultValue={campaign?.end_date ?? ""} />
        </label>
      </div>

      <label className="field">
        <span>Imagem de capa</span>
        <input name="cover_image_url" type="url" defaultValue={campaign?.cover_image_url ?? ""} placeholder="/editorial/covers/..." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={campaign?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={campaign?.public_visibility ? "true" : "false"}>
            <option value="true">Pública</option>
            <option value="false">Interna</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Destaque</span>
        <div className="support-box">
          <label className="check">
            <input name="featured" type="checkbox" defaultChecked={campaign?.featured ?? false} />
            <span>Marcar como destaque</span>
          </label>
        </div>
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : campaign ? "Salvar campanha" : "Criar campanha"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "A campanha condensa foco, urgência editorial e mobilização pública."}
      </p>
    </form>
  );
}
