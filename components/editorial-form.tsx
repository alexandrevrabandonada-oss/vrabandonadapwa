/* eslint-disable @next/next/no-img-element */
"use client";

import { useActionState } from "react";

import { saveEditorialItemAction } from "@/app/interno/editorial/actions";
import {
  editorialCoverVariants,
  editorialReviewStatuses,
  editorialStatuses,
  type EditorialItem,
} from "@/lib/editorial/types";

type Props = {
  item: EditorialItem;
};

const initialState = { ok: false, message: "" };

export function EditorialForm({ item }: Props) {
  const [state, formAction, pending] = useActionState(saveEditorialItemAction, initialState);

  return (
    <form className="intake-form" action={formAction} encType="multipart/form-data">
      <input type="hidden" name="id" value={item.id} />

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={item.title} required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={item.slug} required />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Categoria</span>
          <input name="category" type="text" defaultValue={item.category} required />
        </label>

        <label className="field">
          <span>Tag principal</span>
          <input name="primary_tag" type="text" defaultValue={item.primary_tag ?? ""} placeholder="transporte, memória, poluição..." />
        </label>
      </div>

      <label className="field">
        <span>Tags secundárias</span>
        <textarea
          name="secondary_tags"
          rows={2}
          defaultValue={item.secondary_tags.join(", ")}
          placeholder="Separe por vírgulas ou quebras de linha"
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Série slug</span>
          <input name="series_slug" type="text" defaultValue={item.series_slug ?? ""} placeholder="cidade-e-abandono" />
        </label>

        <label className="field">
          <span>Título da série</span>
          <input name="series_title" type="text" defaultValue={item.series_title ?? ""} placeholder="Cidade e abandono" />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Tempo de leitura</span>
          <input name="reading_time" type="number" min={1} step={1} defaultValue={item.reading_time || 5} required />
        </label>

        <label className="field">
          <span>Ordem de destaque</span>
          <input name="featured_order" type="number" min={1} step={1} defaultValue={item.featured_order ?? ""} placeholder="1, 2, 3..." />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Cor da capa</span>
          <select name="cover_variant" defaultValue={item.cover_variant || "concrete"}>
            {editorialCoverVariants.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Status editorial</span>
          <select name="editorial_status" defaultValue={item.editorial_status} required>
            {editorialStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Status de revisão</span>
          <select name="review_status" defaultValue={item.review_status} required>
            {editorialReviewStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Bairro / território</span>
          <input name="neighborhood" type="text" defaultValue={item.neighborhood ?? ""} />
        </label>
      </div>

      <label className="field">
        <span>Resumo</span>
        <textarea name="excerpt" rows={3} defaultValue={item.excerpt} required />
      </label>

      <label className="field">
        <span>Corpo</span>
        <textarea name="body" rows={10} defaultValue={item.body} required />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Capa atual / URL da capa</span>
          <input
            name="cover_image_url"
            type="url"
            defaultValue={item.cover_image_url ?? ""}
            placeholder="https://..."
          />
        </label>

        <label className="field">
          <span>Enviar nova capa</span>
          <input name="cover_image_file" type="file" accept="image/*" />
        </label>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="cover_image_clear" type="checkbox" />
          <span>Remover capa atual</span>
        </label>
        {item.cover_image_url ? (
          <div className="cover-preview">
            <img src={item.cover_image_url} alt={`Prévia da capa de ${item.title}`} className="cover-preview__image" />
            <p className="form-status">Capa atual carregada. Se enviar outra imagem ou escolher remover, a anterior sai de cena.</p>
          </div>
        ) : (
          <p className="form-status">Sem capa real. O fallback editorial usa a variante visual escolhida.</p>
        )}
      </div>

      <label className="field">
        <span>Motivo de publicação</span>
        <textarea
          name="publication_reason"
          rows={3}
          defaultValue={item.publication_reason ?? ""}
          placeholder="Explique por que este item deve ir ao ar agora."
        />
      </label>

      <label className="field">
        <span>Nota de checagem</span>
        <textarea
          name="fact_check_note"
          rows={3}
          defaultValue={item.fact_check_note ?? ""}
          placeholder="Registre a checagem editorial mínima feita antes da publicação."
        />
      </label>

      <label className="field">
        <span>Nota de visibilidade da fonte</span>
        <textarea
          name="source_visibility_note"
          rows={3}
          defaultValue={item.source_visibility_note ?? ""}
          placeholder="Explique, em linguagem interna, a procedência e o nível de sanitização."
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Arquivo / observação</span>
          <input
            name="archived_reason"
            type="text"
            defaultValue={item.archived_reason ?? ""}
            placeholder="Use quando o item for arquivado."
          />
        </label>

        <label className="field">
          <span>Atualização visual</span>
          <input
            type="text"
            value={item.cover_image_path ? "Armazenada no Supabase" : "Fallback visual"}
            readOnly
          />
        </label>
      </div>

      <div className="support-box">
        <p className="eyebrow">Checklist de publicação</p>
        <label className="check">
          <input name="check_personal_data_removed" type="checkbox" />
          <span>Remover dados pessoais ou sensíveis</span>
        </label>
        <label className="check">
          <input name="check_sanitized" type="checkbox" />
          <span>Confirmar que o texto está sanitizado</span>
        </label>
        <label className="check">
          <input name="check_no_private_contact" type="checkbox" />
          <span>Confirmar que não há contato privado exposto</span>
        </label>
        <label className="check">
          <input name="check_editorial_fit" type="checkbox" />
          <span>Confirmar que a publicação faz sentido editorial</span>
        </label>
        <label className="check">
          <input name="sensitivity_check_passed" type="checkbox" defaultChecked={item.sensitivity_check_passed} />
          <span>Checagem de sensibilidade aprovada</span>
        </label>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={item.featured} />
          <span>Destaque na home de pautas</span>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar editorial"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "Salve rascunho, pronto ou publicado sem expor dados internos."}
      </p>
    </form>
  );
}



