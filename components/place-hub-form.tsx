"use client";

import { useActionState } from "react";

import { savePlaceHubAction } from "@/app/interno/territorios/actions";
import { getPlaceHubPlaceTypeLabel, getPlaceHubStatusLabel } from "@/lib/territories/navigation";
import { placeHubPlaceTypes, placeHubStatuses, type PlaceHub } from "@/lib/territories/types";

type PlaceHubFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  placeHub?: PlaceHub | null;
};

const initialState: PlaceHubFormState = { ok: false, message: "" };

export function PlaceHubForm({ placeHub }: Props) {
  const [state, formAction, pending] = useActionState(savePlaceHubAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {placeHub ? <input type="hidden" name="id" value={placeHub.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={placeHub?.title ?? ""} placeholder="Cidade operária" required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={placeHub?.slug ?? ""} placeholder="cidade-operaria" readOnly={Boolean(placeHub)} />
        </label>
      </div>

      <label className="field">
        <span>Resumo curto</span>
        <input name="excerpt" type="text" defaultValue={placeHub?.excerpt ?? ""} placeholder="Bairro, lugar ou marco urbano." />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={5} defaultValue={placeHub?.description ?? ""} placeholder="Explique por que este lugar organiza memória, conflito e arquivo." />
      </label>

      <label className="field">
        <span>Pergunta central</span>
        <input name="lead_question" type="text" defaultValue={placeHub?.lead_question ?? ""} placeholder="O que este lugar revela sobre a cidade?" />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Tipo de lugar</span>
          <select name="place_type" defaultValue={placeHub?.place_type ?? "bairro"}>
            {placeHubPlaceTypes.map((type) => (
              <option key={type} value={type}>
                {getPlaceHubPlaceTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={placeHub?.status ?? "active"}>
            {placeHubStatuses.map((status) => (
              <option key={status} value={status}>
                {getPlaceHubStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Território</span>
          <input name="territory_label" type="text" defaultValue={placeHub?.territory_label ?? ""} placeholder="Cidade operária" />
        </label>

        <label className="field">
          <span>Lugar-pai</span>
          <input name="parent_place_slug" type="text" defaultValue={placeHub?.parent_place_slug ?? ""} placeholder="cidade-operaria" />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Endereço público</span>
          <input name="address_label" type="text" defaultValue={placeHub?.address_label ?? ""} placeholder="Volta Redonda, RJ" />
        </label>

        <label className="field">
          <span>Imagem de capa</span>
          <input name="cover_image_url" type="url" defaultValue={placeHub?.cover_image_url ?? ""} placeholder="/archive/assets/..." />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Latitude</span>
          <input name="latitude" type="number" step="any" defaultValue={placeHub?.latitude ?? ""} placeholder="-22.521" />
        </label>

        <label className="field">
          <span>Longitude</span>
          <input name="longitude" type="number" step="any" defaultValue={placeHub?.longitude ?? ""} placeholder="-44.103" />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={placeHub?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={placeHub?.public_visibility ? "true" : "false"}>
            <option value="true">Pública</option>
            <option value="false">Interna</option>
          </select>
        </label>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={placeHub?.featured ?? false} />
          <span>Marcar como destaque</span>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : placeHub ? "Salvar lugar" : "Criar lugar"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "O lugar organiza memória, conflito e arquivo em um mesmo território."}
      </p>
    </form>
  );
}
