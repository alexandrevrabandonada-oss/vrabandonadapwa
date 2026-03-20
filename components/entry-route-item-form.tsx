"use client";

import { useActionState } from "react";

import { saveEntryRouteItemAction } from "@/app/interno/rotas/actions";
import { entryRouteItemRoles } from "@/lib/entry-routes/types";
import { getEntryRouteItemRoleLabel } from "@/lib/entry-routes/navigation";
import type { EntryRoute, EntryRouteItem } from "@/lib/entry-routes/types";
import type { EntryRouteLinkOption } from "@/lib/entry-routes/resolve";

type EntryRouteItemFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  route: EntryRoute;
  options: EntryRouteLinkOption[];
  item?: EntryRouteItem | null;
};

const initialState: EntryRouteItemFormState = { ok: false, message: "" };

export function EntryRouteItemForm({ route, options, item }: Props) {
  const [state, formAction, pending] = useActionState(saveEntryRouteItemAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      <input type="hidden" name="route_id" value={route.id} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <label className="field">
        <span>Peça relacionada</span>
        <select name="item_ref" defaultValue={item ? `${item.item_type}:${item.item_key}` : ""} required>
          <option value="" disabled>
            Escolha uma peça já publicada
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
          <span>Papel editorial</span>
          <select name="role" defaultValue={item?.role ?? "context"} required>
            {entryRouteItemRoles.map((role) => (
              <option key={role} value={role}>
                {getEntryRouteItemRoleLabel(role)}
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
        <textarea name="note" rows={3} defaultValue={item?.note ?? ""} placeholder="Explique o motivo desta peça na rota." />
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : item ? "Atualizar passo" : "Adicionar passo"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || `${options.length} opção(ões) publicável(is) para esta rota.`}
      </p>
    </form>
  );
}
