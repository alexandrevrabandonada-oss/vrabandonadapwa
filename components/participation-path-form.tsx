"use client";

import { useActionState } from "react";

import { saveParticipationPathAction } from "@/app/interno/participe/actions";
import { participationStatuses, type ParticipationPath } from "@/lib/participation/types";
import { getParticipationStatusLabel } from "@/lib/participation/navigation";

type ParticipationPathFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  path?: ParticipationPath | null;
};

const initialState: ParticipationPathFormState = { ok: false, message: "" };

export function ParticipationPathForm({ path }: Props) {
  const [state, formAction, pending] = useActionState(saveParticipationPathAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {path ? <input type="hidden" name="id" value={path.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={path?.title ?? ""} placeholder="Tem um relato, documento ou pista?" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={path?.slug ?? ""} placeholder="tem-um-relato-documento-ou-pista" required readOnly={Boolean(path)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={path?.excerpt ?? ""} placeholder="Uma entrada curta e direta para a ação pública." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={5} defaultValue={path?.description ?? ""} placeholder="Explique o que esta rota ajuda a fazer e para quem ela serve." />
      </label>

      <label className="field">
        <span>Público-alvo</span>
        <input name="audience_label" type="text" defaultValue={path?.audience_label ?? ""} placeholder="Quem quer colaborar com memória e acervo" />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={path?.status ?? "draft"} required>
            {participationStatuses.map((status) => (
              <option key={status} value={status}>
                {getParticipationStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={path?.sort_order ?? 0} />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Visibilidade</span>
          <select name="public_visibility" defaultValue={path?.public_visibility ? "true" : "false"}>
            <option value="false">Interna</option>
            <option value="true">Pública</option>
          </select>
        </label>

        <label className="field">
          <span>Imagem de capa</span>
          <input name="cover_image_url" type="url" placeholder="/editorial/covers/..." disabled />
        </label>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={path?.featured ?? false} />
          <span>Marcar como destaque</span>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : path ? "Salvar rota" : "Criar rota"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "A rota deve ser curta, acolhedora e fácil de seguir."}
      </p>
    </form>
  );
}