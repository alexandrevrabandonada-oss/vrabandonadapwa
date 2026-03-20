"use client";

import { useActionState } from "react";

import { saveEntryRouteAction } from "@/app/interno/rotas/actions";
import { entryRouteStatuses, type EntryRoute } from "@/lib/entry-routes/types";
import { getEntryRouteStatusLabel } from "@/lib/entry-routes/navigation";

type EntryRouteFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  route?: EntryRoute | null;
};

const initialState: EntryRouteFormState = { ok: false, message: "" };

export function EntryRouteForm({ route }: Props) {
  const [state, formAction, pending] = useActionState(saveEntryRouteAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {route ? <input type="hidden" name="id" value={route.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={route?.title ?? ""} placeholder="Entenda o projeto em 5 minutos" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={route?.slug ?? ""} placeholder="entenda-o-projeto-em-5-minutos" required readOnly={Boolean(route)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={route?.excerpt ?? ""} placeholder="Um caminho curto para visitantes novos." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={5} defaultValue={route?.description ?? ""} placeholder="Explique a rota e a sequência de leitura." />
      </label>

      <label className="field">
        <span>Para quem é</span>
        <input name="audience_label" type="text" defaultValue={route?.audience_label ?? ""} placeholder="Primeira visita" />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={route?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={route?.status ?? "draft"} required>
            {entryRouteStatuses.map((status) => (
              <option key={status} value={status}>
                {getEntryRouteStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Visibilidade</span>
          <select name="public_visibility" defaultValue={route?.public_visibility ? "true" : "false"}>
            <option value="false">Interna</option>
            <option value="true">Pública</option>
          </select>
        </label>

        <div className="support-box">
          <label className="check">
            <input name="featured" type="checkbox" defaultChecked={route?.featured ?? false} />
            <span>Marcar como destaque</span>
          </label>
        </div>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : route ? "Salvar rota" : "Criar rota"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "A rota deve orientar o visitante sem virar tutorial frio."}
      </p>
    </form>
  );
}
