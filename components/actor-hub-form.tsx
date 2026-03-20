"use client";

import { useActionState } from "react";

import { saveActorHubAction } from "@/app/interno/atores/actions";
import { getActorHubActorTypeLabel, getActorHubStatusLabel } from "@/lib/actors/navigation";
import { actorHubActorTypes, actorHubStatuses, type ActorHub } from "@/lib/actors/types";

type ActorHubFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  actorHub?: ActorHub | null;
};

const initialState: ActorHubFormState = { ok: false, message: "" };

export function ActorHubForm({ actorHub }: Props) {
  const [state, formAction, pending] = useActionState(saveActorHubAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {actorHub ? <input type="hidden" name="id" value={actorHub.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={actorHub?.title ?? ""} placeholder="Companhia Siderúrgica Nacional" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={actorHub?.slug ?? ""} placeholder="companhia-siderurgica-nacional" readOnly={Boolean(actorHub)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={actorHub?.excerpt ?? ""} placeholder="Empresa, órgão ou instituição recorrente nos conflitos." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={actorHub?.description ?? ""}
          placeholder="Explique por que este ator importa para o mapa de poder, conflito e responsabilidade."
        />
      </label>

      <label className="field">
        <span>Pergunta central</span>
        <input name="lead_question" type="text" defaultValue={actorHub?.lead_question ?? ""} placeholder="O que este ator revela sobre a cidade?" />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Tipo de ator</span>
          <select name="actor_type" defaultValue={(actorHub?.actor_type as string) ?? "empresa"} required>
            {actorHubActorTypes.map((type) => (
              <option key={type} value={type}>
                {getActorHubActorTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={(actorHub?.status as string) ?? "draft"}>
            {actorHubStatuses.map((status) => (
              <option key={status} value={status}>
                {getActorHubStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Território</span>
          <input name="territory_label" type="text" defaultValue={actorHub?.territory_label ?? ""} placeholder="Cidade e entorno industrial" />
        </label>

        <label className="field">
          <span>Imagem de capa</span>
          <input name="cover_image_url" type="url" defaultValue={actorHub?.cover_image_url ?? ""} placeholder="/editorial/covers/..." />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={actorHub?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={actorHub?.public_visibility ? "true" : "false"}>
            <option value="true">Pública</option>
            <option value="false">Interna</option>
          </select>
        </label>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={actorHub?.featured ?? false} />
          <span>Marcar como destaque</span>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : actorHub ? "Salvar ator" : "Criar ator"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "O ator organiza responsabilidade, recorrência e território em uma camada pública única."}
      </p>
    </form>
  );
}
