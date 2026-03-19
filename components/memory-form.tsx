"use client";

import Image from "next/image";
import { useActionState } from "react";

import { saveMemoryItemAction } from "@/app/interno/memoria/actions";
import type { MemoryCollection, MemoryEditorialStatus, MemoryItem, MemoryType } from "@/lib/memory/types";

type MemoryFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  item?: MemoryItem | null;
  collections: MemoryCollection[];
};

const initialState: MemoryFormState = { ok: false, message: "" };
const memoryTypes: MemoryType[] = ["story", "photo", "document", "landmark", "event"];
const memoryStatuses: MemoryEditorialStatus[] = ["draft", "ready", "published", "archived"];

export function MemoryForm({ item, collections }: Props) {
  const [state, formAction, pending] = useActionState(saveMemoryItemAction, initialState);

  return (
    <form className="intake-form" action={formAction} encType="multipart/form-data">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={item?.title ?? ""} required />
        </label>

        <label className="field">
          <span>Slug</span>
          <input name="slug" type="text" defaultValue={item?.slug ?? ""} required />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Tipo de memória</span>
          <select name="memory_type" defaultValue={item?.memory_type ?? "landmark"} required>
            {memoryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Status editorial</span>
          <select name="editorial_status" defaultValue={item?.editorial_status ?? "draft"} required>
            {memoryStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Resumo</span>
        <textarea name="excerpt" rows={3} defaultValue={item?.excerpt ?? ""} required />
      </label>

      <label className="field">
        <span>Corpo</span>
        <textarea name="body" rows={8} defaultValue={item?.body ?? ""} required />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Período</span>
          <input name="period_label" type="text" defaultValue={item?.period_label ?? ""} placeholder="Anos 1990-2000" required />
        </label>

        <label className="field">
          <span>Lugar</span>
          <input name="place_label" type="text" defaultValue={item?.place_label ?? ""} placeholder="Vila Santa Cecília" />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Ano inicial</span>
          <input name="year_start" type="number" defaultValue={item?.year_start ?? ""} />
        </label>

        <label className="field">
          <span>Ano final</span>
          <input name="year_end" type="number" defaultValue={item?.year_end ?? ""} />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Slug da coleção</span>
          <input list="memory-collections" name="collection_slug" type="text" defaultValue={item?.collection_slug ?? item?.memory_collection ?? ""} required />
        </label>

        <label className="field">
          <span>Título da coleção</span>
          <input name="collection_title" type="text" defaultValue={item?.collection_title ?? ""} required />
        </label>
      </div>

      <label className="field">
        <span>Descrição da coleção</span>
        <textarea
          name="collection_description"
          rows={2}
          defaultValue=""
          placeholder="Uma frase curta para explicar o recorte editorial."
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Pauta relacionada</span>
          <input name="related_editorial_slug" type="text" defaultValue={item?.related_editorial_slug ?? ""} placeholder="ar-poeira-e-pressao" />
        </label>

        <label className="field">
          <span>Série relacionada</span>
          <input name="related_series_slug" type="text" defaultValue={item?.related_series_slug ?? ""} placeholder="poluicao-e-csn" />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Rank na timeline</span>
          <input name="timeline_rank" type="number" min={1} step={1} defaultValue={item?.timeline_rank ?? ""} placeholder="1, 2, 3..." />
        </label>

        <label className="field">
          <span>Imagem de capa</span>
          <input name="cover_image_url" type="url" defaultValue={item?.cover_image_url ?? ""} placeholder="https://..." />
        </label>
      </div>

      <label className="field">
        <span>Enviar nova capa</span>
        <input name="cover_image_file" type="file" accept="image/*" />
      </label>

      <div className="support-box">
        <label className="check">
          <input name="cover_image_clear" type="checkbox" />
          <span>Remover capa atual</span>
        </label>
        {item?.cover_image_url ? (
          <div className="cover-preview">
            <Image
              src={item.cover_image_url}
              alt={`Prévia da capa de ${item.title}`}
              className="cover-preview__image"
              width={960}
              height={540}
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
            <p className="form-status">Capa atual carregada. Se enviar outra imagem ou remover, a anterior sai de cena.</p>
          </div>
        ) : (
          <p className="form-status">Sem capa real. O fallback editorial usa o recorte visual escolhido.</p>
        )}
      </div>

      <label className="field">
        <span>Fonte / contexto</span>
        <textarea name="source_note" rows={3} defaultValue={item?.source_note ?? ""} placeholder="Fonte editorial, relato, documento público, referência visual..." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordem do recorte</span>
          <input name="collection_order" type="number" min={0} step={1} defaultValue={item?.timeline_rank ?? 0} />
        </label>

        <label className="field">
          <span>Conteúdo do arquivo</span>
          <input
            type="text"
            value={item?.published ? "Publicado" : item?.editorial_status === "ready" ? "Pronto" : item?.editorial_status === "archived" ? "Arquivado" : "Rascunho"}
            readOnly
          />
        </label>
      </div>

      <div className="support-box">
        <label className="check">
          <input name="featured" type="checkbox" defaultChecked={item?.featured ?? false} />
          <span>Destaque na memória</span>
        </label>
        <p className="form-status">Marcar como destaque também reforça a linha do tempo e o bloco de abertura.</p>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : item ? "Salvar memória" : "Criar memória"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "Salve sem expor dados operacionais na camada pública."}
      </p>

      <datalist id="memory-collections">
        {collections.map((collection) => (
          <option key={collection.slug} value={collection.slug} label={collection.title} />
        ))}
      </datalist>
    </form>
  );
}
