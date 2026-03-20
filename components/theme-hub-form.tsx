"use client";

import { useActionState } from "react";

import { saveThemeHubAction } from "@/app/interno/eixos/actions";
import { themeHubStatuses, type ThemeHub } from "@/lib/hubs/types";
import { getThemeHubStatusLabel } from "@/lib/hubs/navigation";

type ThemeHubFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  hub?: ThemeHub | null;
};

const initialState: ThemeHubFormState = { ok: false, message: "" };

export function ThemeHubForm({ hub }: Props) {
  const [state, formAction, pending] = useActionState(saveThemeHubAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {hub ? <input type="hidden" name="id" value={hub.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={hub?.title ?? ""} placeholder="Poluição e CSN" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={hub?.slug ?? ""} placeholder="poluicao-e-csn" required readOnly={Boolean(hub)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={hub?.excerpt ?? ""} placeholder="Uma linha curta sobre o eixo." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={hub?.description ?? ""}
          placeholder="Explique o eixo e o percurso que ele organiza."
        />
      </label>

      <label className="field">
        <span>Pergunta central</span>
        <textarea
          name="lead_question"
          rows={3}
          defaultValue={hub?.lead_question ?? ""}
          placeholder="Que conflito o eixo ajuda a entender?"
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Imagem de capa</span>
          <input name="cover_image_url" type="url" defaultValue={hub?.cover_image_url ?? ""} placeholder="/editorial/covers/..." />
        </label>

        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={hub?.sort_order ?? 0} />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={hub?.status ?? "draft"} required>
            {themeHubStatuses.map((status) => (
              <option key={status} value={status}>
                {getThemeHubStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Visibilidade</span>
          <select name="public_visibility" defaultValue={hub?.public_visibility ? "true" : "false"}>
            <option value="false">Interno</option>
            <option value="true">Público</option>
          </select>
        </label>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={hub?.featured ?? false} />
          <span>Marcar como destaque</span>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : hub ? "Salvar eixo" : "Criar eixo"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "Mantenha o eixo curto, navegável e editável sem virar taxonomia rígida."}
      </p>
    </form>
  );
}
