"use client";

import { useActionState } from "react";

import { saveParticipationPathItemAction } from "@/app/interno/participe/actions";
import { participationItemRoles } from "@/lib/participation/types";
import { getParticipationItemRoleLabel } from "@/lib/participation/navigation";
import type { ParticipationPath, ParticipationPathItem } from "@/lib/participation/types";
import type { ParticipationLinkOption } from "@/lib/participation/resolve";

type ParticipationPathItemFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  path: ParticipationPath;
  options: ParticipationLinkOption[];
  item?: ParticipationPathItem | null;
};

const initialState: ParticipationPathItemFormState = { ok: false, message: "" };

export function ParticipationPathItemForm({ path, options, item }: Props) {
  const [state, formAction, pending] = useActionState(saveParticipationPathItemAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      <input type="hidden" name="path_id" value={path.id} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <label className="field">
        <span>Peça relacionada</span>
        <select name="item_ref" defaultValue={item ? `${item.item_type}:${item.item_key}` : ""} required>
          <option value="" disabled>
            Escolha um item publicado
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Papel</span>
          <select name="role" defaultValue={item?.role ?? "context"} required>
            {participationItemRoles.map((role) => (
              <option key={role} value={role}>
                {getParticipationItemRoleLabel(role)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={item?.sort_order ?? 0} />
        </label>
      </div>

      <label className="field">
        <span>Nota curta</span>
        <textarea name="note" rows={3} defaultValue={item?.note ?? ""} placeholder="Explique por que esta peça entra no caminho." />
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : item ? "Atualizar passo" : "Adicionar passo"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || `${options.length} item(ns) disponíveis para esta rota.`}
      </p>
    </form>
  );
}