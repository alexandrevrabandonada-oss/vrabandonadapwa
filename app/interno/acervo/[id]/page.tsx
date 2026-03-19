import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveAssetForm } from "@/components/archive-asset-form";
import { Container } from "@/components/container";
import { getInternalArchiveAssetById, getInternalArchiveAssetsByCollectionSlug } from "@/lib/archive/queries";
import { getInternalArchiveCollections } from "@/lib/archive/collections";
import { getInternalEditorialItems } from "@/lib/editorial/queries";
import { getInternalMemoryItems } from "@/lib/memory/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Editar anexo",
  description: "Curadoria interna de um objeto de acervo.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalArchiveDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const asset = await getInternalArchiveAssetById(id);
  if (!asset) {
    notFound();
  }

  const memoryItems = await getInternalMemoryItems();
  const editorialItems = await getInternalEditorialItems();
  const archiveCollections = await getInternalArchiveCollections();
  const collection = asset.collection_slug ? archiveCollections.find((entry) => entry.slug === asset.collection_slug) ?? null : null;
  const memoryLabel = memoryItems.find((item) => item.id === asset.memory_item_id)?.title ?? null;
  const editorialLabel = editorialItems.find((item) => item.id === asset.editorial_item_id)?.title ?? null;
  const collectionAssets = asset.collection_slug ? await getInternalArchiveAssetsByCollectionSlug(asset.collection_slug) : [];

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">acervo interno</p>
        <h1 className="hero__title">{asset.title}</h1>
        <p className="hero__lead">
          {asset.asset_type} · {asset.public_visibility ? "público" : "interno"} · {asset.featured ? "destaque" : "normal"}
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/acervo" className="button-secondary">
            Voltar ao acervo
          </Link>
          {asset.collection_slug ? (
            <Link href={`/interno/acervo/colecoes/${collection?.id ?? ""}`} className="button-secondary">
              Ver coleção
            </Link>
          ) : null}
          {asset.memory_item_id ? (
            <Link href={`/interno/memoria/${asset.memory_item_id}`} className="button-secondary">
              Ver memória
            </Link>
          ) : null}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <ArchiveAssetCard asset={asset} memoryLabel={memoryLabel} editorialLabel={editorialLabel} collectionLabel={collection?.title ?? null} />
          <article className="support-box">
            <h3>Vínculos</h3>
            <ul>
              <li>Memória: {memoryLabel || "sem vínculo"}</li>
              <li>Pauta: {editorialLabel || "sem vínculo"}</li>
              <li>Coleção: {collection?.title || "sem vínculo"}</li>
              <li>Fonte: {asset.source_label || "não informada"}</li>
              <li>Data: {asset.source_date_label || "não informada"}</li>
              <li>Lugar: {asset.place_label || "não informado"}</li>
              <li>Ano: {asset.approximate_year || "não informado"}</li>
            </ul>
          </article>
        </div>
      </section>

      {collection ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <div>
              <p className="eyebrow">coleção</p>
              <h2>{collection.title}</h2>
            </div>
            <p className="section__lead">A edição do asset conversa com a coleção para não perder o recorte editorial.</p>
          </div>

          <div className="grid-3">
            {collectionAssets.filter((item) => item.id !== asset.id).slice(0, 3).map((item) => (
              <ArchiveAssetCard key={item.id} asset={item} href={`/interno/acervo/${item.id}`} actionLabel="Abrir anexo" compact />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Atualizar objeto de acervo</h2>
          </div>
          <p className="section__lead">O formulário abaixo mantém o material separado da narrativa, mas pronto para sustentar o arquivo vivo.</p>
        </div>

        <ArchiveAssetForm
          asset={asset}
          memoryItems={memoryItems}
          editorialItems={editorialItems}
          archiveCollections={archiveCollections}
          initialMemoryItemId={asset.memory_item_id ?? ""}
          initialEditorialItemId={asset.editorial_item_id ?? ""}
          initialCollectionSlug={asset.collection_slug ?? ""}
        />
      </section>
    </Container>
  );
}

