"use client";

import { useActionState } from "react";

import { saveSharePackAction } from "@/app/interno/compartilhar/actions";
import { getSharePackContentTypeLabel, getSharePackStatusLabel } from "@/lib/share-packs/navigation";
import { sharePackCoverVariants, sharePackStatuses, type SharePack, type SharePackLinkOption } from "@/lib/share-packs/types";

type SharePackFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  pack?: SharePack | null;
  options: SharePackLinkOption[];
};

const initialState: SharePackFormState = { ok: false, message: "" };

export function SharePackForm({ pack, options }: Props) {
  const [state, formAction, pending] = useActionState(saveSharePackAction, initialState);

  return (
    <form className="intake-form" action={formAction}>
      {pack ? <input type="hidden" name="id" value={pack.id} /> : null}

      <label className="field">
        <span>Conteúdo de origem</span>
        <input
          name="content_ref"
          type="text"
          list="share-pack-options"
          defaultValue={pack ? `${pack.content_type}:${pack.content_key}` : ""}
          placeholder="edicao:edicao-do-momento-o-que-esta-quente-agora"
          required
        />
        <datalist id="share-pack-options">
          {options.map((option) => (
            <option key={option.value} value={option.value} label={option.label} />
          ))}
        </datalist>
        <small className="field-help">Use o formato tipo:chave. Exemplo: {getSharePackContentTypeLabel("edicao")}:edicao-do-momento-o-que-esta-quente-agora</small>
      </label>

      <label className="field">
        <span>Título do pack</span>
        <input name="title_override" type="text" defaultValue={pack?.title_override ?? ""} placeholder="Compartilhe esta edição" />
      </label>

      <label className="field">
        <span>Resumo curto</span>
        <input name="short_summary" type="text" defaultValue={pack?.short_summary ?? ""} placeholder="Uma síntese curta para circulação." />
      </label>

      <label className="field">
        <span>Legenda para compartilhamento</span>
        <textarea
          name="share_caption"
          rows={4}
          defaultValue={pack?.share_caption ?? ""}
          placeholder="Legenda editorial com chamado para compartilhar, ler e continuar no site."
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Status do pack</span>
          <select name="share_status" defaultValue={pack?.share_status ?? "draft"}>
            {sharePackStatuses.map((status) => (
              <option key={status} value={status}>
                {getSharePackStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Variante visual</span>
          <select name="cover_variant" defaultValue={pack?.cover_variant ?? "steel"}>
            {sharePackCoverVariants.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={pack?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={pack?.public_visibility ? "true" : "false"}>
            <option value="true">Pública</option>
            <option value="false">Interna</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Destaque</span>
        <div className="support-box">
          <label className="check">
            <input name="featured" type="checkbox" defaultChecked={pack?.featured ?? false} />
            <span>Marcar como destaque</span>
          </label>
        </div>
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : pack ? "Salvar pack" : "Criar pack"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "O pack transforma conteúdo público em peça pronta para circular fora do site."}
      </p>
    </form>
  );
}
