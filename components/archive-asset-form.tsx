"use client";

import Image from "next/image";
import { useActionState } from "react";

import { saveArchiveAssetAction } from "@/app/interno/acervo/actions";
import type { ArchiveCollection, ArchiveAsset, ArchiveAssetType } from "@/lib/archive/types";
import type { EditorialItem } from "@/lib/editorial/types";
import type { MemoryItem } from "@/lib/memory/types";

type ArchiveAssetFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  asset?: ArchiveAsset | null;
  memoryItems: MemoryItem[];
  editorialItems: EditorialItem[];
  archiveCollections: ArchiveCollection[];
  allowBatch?: boolean;
  initialMemoryItemId?: string;
  initialEditorialItemId?: string;
  initialCollectionSlug?: string;
};

const initialState: ArchiveAssetFormState = { ok: false, message: "" };
const assetTypes: ArchiveAssetType[] = ["photo", "scan", "newspaper", "document", "pdf", "audio", "other"];

export function ArchiveAssetForm({
  asset,
  memoryItems,
  editorialItems,
  archiveCollections,
  allowBatch = false,
  initialMemoryItemId,
  initialEditorialItemId,
  initialCollectionSlug,
}: Props) {
  const [state, formAction, pending] = useActionState(saveArchiveAssetAction, initialState);

  return (
    <form className="intake-form" action={formAction} encType="multipart/form-data">
      {asset ? <input type="hidden" name="id" value={asset.id} /> : null}

      <div className="grid-2">
        <label className="field">
          <span>Título</span>
          <input name="title" type="text" defaultValue={asset?.title ?? ""} placeholder="Nome do recorte, foto ou documento" />
        </label>

        <label className="field">
          <span>Tipo de asset</span>
          <select name="asset_type" defaultValue={asset?.asset_type ?? "other"} required>
            {assetTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Vínculo com memória</span>
          <select name="memory_item_id" defaultValue={asset?.memory_item_id ?? initialMemoryItemId ?? ""}>
            <option value="">Sem vínculo</option>
            {memoryItems.map((memory) => (
              <option key={memory.id} value={memory.id}>
                {memory.title}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Vínculo editorial</span>
          <select name="editorial_item_id" defaultValue={asset?.editorial_item_id ?? initialEditorialItemId ?? ""}>
            <option value="">Sem vínculo</option>
            {editorialItems.map((editorial) => (
              <option key={editorial.id} value={editorial.id}>
                {editorial.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Coleção</span>
        <select name="collection_slug" defaultValue={asset?.collection_slug ?? initialCollectionSlug ?? ""}>
          <option value="">Sem coleção</option>
          {archiveCollections.map((collection) => (
            <option key={collection.slug} value={collection.slug}>
              {collection.title}
            </option>
          ))}
        </select>
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Fonte / origem</span>
          <input name="source_label" type="text" defaultValue={asset?.source_label ?? ""} placeholder="Arquivo pessoal, jornal local, relato, instituição..." />
        </label>

        <label className="field">
          <span>Data aproximada</span>
          <input name="source_date_label" type="text" defaultValue={asset?.source_date_label ?? ""} placeholder="aprox. 1998" />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Ano aproximado</span>
          <input name="approximate_year" type="number" defaultValue={asset?.approximate_year ?? ""} placeholder="1998" />
        </label>

        <label className="field">
          <span>Lugar</span>
          <input name="place_label" type="text" defaultValue={asset?.place_label ?? ""} placeholder="Vila Santa Cecília" />
        </label>
      </div>

      <label className="field">
        <span>Direitos / observação</span>
        <input name="rights_note" type="text" defaultValue={asset?.rights_note ?? ""} placeholder="Uso editorial controlado" />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea name="description" rows={4} defaultValue={asset?.description ?? ""} placeholder="Conte o que esse anexo registra e por que ele importa." />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ordenação</span>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={asset?.sort_order ?? 0} />
        </label>

        <label className="field">
          <span>Envio de arquivo</span>
          <input name="asset_files" type="file" accept="image/*,application/pdf,audio/*" multiple={allowBatch} />
        </label>
      </div>

      <div className="support-box archive-batch-note">
        <p>
          {allowBatch
            ? "Lote pequeno: envie um ou vários arquivos agora e complete os metadados depois."
            : "Substitua o arquivo se necessário. Se não enviar novo arquivo, o anexo atual continua ativo."}
        </p>
        {asset?.file_url ? (
          <div className="archive-file-preview">
            {asset.asset_type === "photo" || asset.asset_type === "scan" || asset.asset_type === "newspaper" || asset.thumb_url ? (
              <Image
                src={asset.thumb_url || asset.file_url}
                alt={asset.title}
                className="archive-file-preview__image"
                width={960}
                height={720}
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            ) : (
              <div className="archive-file-preview__fallback">
                <span>{asset.asset_type}</span>
                <strong>{asset.title}</strong>
              </div>
            )}
            <p className="form-status">Arquivo atual carregado. A troca remove a mídia anterior do bucket.</p>
          </div>
        ) : null}
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Visibilidade pública</span>
          <select name="public_visibility" defaultValue={asset?.public_visibility ? "true" : "false"}>
            <option value="false">Interno</option>
            <option value="true">Público</option>
          </select>
        </label>

        <label className="field">
          <span>Publicação destacada</span>
          <div className="support-box">
            <label className="check">
              <input name="featured" type="checkbox" defaultChecked={asset?.featured ?? false} />
              <span>Marcar como destaque</span>
            </label>
          </div>
        </label>
      </div>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Salvando..." : asset ? "Salvar anexo" : allowBatch ? "Salvar lote" : "Criar anexo"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "O acervo vive separado da narrativa pública, mas sustentando o arquivo."}
      </p>

      {!asset && allowBatch ? <p className="form-status">Dica: use títulos curtos e salve o lote, depois refine os registros um a um.</p> : null}
    </form>
  );
}
