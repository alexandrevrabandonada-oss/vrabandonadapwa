"use client";

import { useActionState } from "react";

import { saveImpactAction } from "@/app/interno/impacto/actions";
import { getImpactStatusLabel, getImpactTypeLabel } from "@/lib/impact/navigation";
import { impactStatuses, impactTypes, type PublicImpact } from "@/lib/impact/types";

type ImpactFormState = {
  ok: boolean;
  message: string;
};

type ImpactFormInitialValues = {
  title?: string;
  slug?: string;
  excerpt?: string;
  description?: string;
  lead_question?: string;
  impact_type?: string;
  status?: string;
  date_label?: string;
  happened_at?: string;
  territory_label?: string;
  cover_image_url?: string;
  sort_order?: number | null;
  public_visibility?: boolean;
  featured?: boolean;
};

type Props = {
  impact?: PublicImpact | null;
  initialValues?: ImpactFormInitialValues;
};

const initialState: ImpactFormState = { ok: false, message: "" };

export function ImpactForm({ impact, initialValues }: Props) {
  const [state, formAction, pending] = useActionState(saveImpactAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {impact ? <input type="hidden" name="id" value={impact.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={impact?.title ?? initialValues?.title ?? ""} placeholder="O que já mudou" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={impact?.slug ?? initialValues?.slug ?? ""} placeholder="o-que-ja-mudou" required readOnly={Boolean(impact)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={impact?.excerpt ?? initialValues?.excerpt ?? ""} placeholder="Efeito público observado ou em disputa." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={5} defaultValue={impact?.description ?? initialValues?.description ?? ""} placeholder="Explique o que aconteceu, por que importa e o que ainda está em aberto." />
      </label>

      <label className="field">
        <span>Pergunta central</span>
        <input name="lead_question" type="text" defaultValue={impact?.lead_question ?? initialValues?.lead_question ?? ""} placeholder="O que mudou por causa desta linha?" />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Tipo de impacto</span>
          <select name="impact_type" defaultValue={impact?.impact_type ?? initialValues?.impact_type ?? "public_pressure"}>
            {impactTypes.map((type) => (
              <option key={type} value={type}>
                {getImpactTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={impact?.status ?? initialValues?.status ?? "observed"}>
            {impactStatuses.map((status) => (
              <option key={status} value={status}>
                {getImpactStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Rótulo de data</span>
          <input name="date_label" type="text" defaultValue={impact?.date_label ?? initialValues?.date_label ?? ""} placeholder="março de 2026" />
        </label>

        <label className="field">
          <span>Data do acontecimento</span>
          <input name="happened_at" type="datetime-local" defaultValue={impact?.happened_at ? new Date(impact.happened_at).toISOString().slice(0, 16) : initialValues?.happened_at ?? ""} />
        </label>
      </div>

      <label className="field">
        <span>Território</span>
        <input name="territory_label" type="text" defaultValue={impact?.territory_label ?? initialValues?.territory_label ?? ""} placeholder="Cidade e entorno industrial" />
      </label>

      <label className="field">
        <span>Imagem de capa</span>
        <input name="cover_image_url" type="url" defaultValue={impact?.cover_image_url ?? initialValues?.cover_image_url ?? ""} placeholder="/editorial/covers/..." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={impact?.sort_order ?? initialValues?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={impact?.public_visibility ? "true" : initialValues?.public_visibility ? "true" : "false"}>
            <option value="true">Pública</option>
            <option value="false">Interna</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Destaque</span>
        <div className="support-box">
          <label className="check">
            <input name="featured" type="checkbox" defaultChecked={impact?.featured ?? initialValues?.featured ?? false} />
            <span>Marcar como destaque</span>
          </label>
        </div>
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : impact ? "Salvar impacto" : "Criar impacto"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "O impacto registra consequência pública sem prometer causalidade total."}
      </p>
    </form>
  );
}
