import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { Container } from "@/components/container";
import { EditorialCover } from "@/components/editorial-cover";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesBySlug } from "@/lib/editorial/taxonomy";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import {
  getArchiveAssetDisplayUrl,
  getArchiveAssetNearbyItems,
  getArchiveAssetTypeLabel,
  isArchiveVisualAsset,
} from "@/lib/archive/navigation";
import {
  getPublishedArchiveAssetById,
  getPublishedArchiveAssets,
} from "@/lib/archive/queries";

export async function generateStaticParams() {
  const items = await getPublishedArchiveAssets();
  return items.map((item) => ({ id: item.id }));
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const asset = await getPublishedArchiveAssetById(id);

  if (!asset) {
    return {
      title: "Acervo",
      description: "Arquivo vivo de Volta Redonda.",
    };
  }

  return {
    title: asset.title,
    description: asset.description || asset.source_label || "Objeto do arquivo vivo.",
    openGraph: {
      title: asset.title,
      description: asset.description || asset.source_label || "Objeto do arquivo vivo.",
      type: "article",
      images: [getArchiveAssetDisplayUrl(asset)],
    },
    twitter: {
      card: "summary_large_image",
      title: asset.title,
      description: asset.description || asset.source_label || "Objeto do arquivo vivo.",
      images: [getArchiveAssetDisplayUrl(asset)],
    },
  };
}

export default async function ArchiveAssetDetailPage({ params }: PageProps) {
  const { id } = await params;
  const asset = await getPublishedArchiveAssetById(id);

  if (!asset) {
    notFound();
  }

  const allAssets = await getPublishedArchiveAssets();
  const memoryItems = await getPublishedMemoryItems();
  const editorialItems = await getPublishedEditorialItems();
  const relatedMemory = asset.memory_item_id ? memoryItems.find((memory) => memory.id === asset.memory_item_id) ?? null : null;
  const relatedEditorial = asset.editorial_item_id
    ? editorialItems.find((editorial) => editorial.id === asset.editorial_item_id) ?? null
    : null;
  const relatedSeries = relatedEditorial?.series_slug ? getEditorialSeriesBySlug(relatedEditorial.series_slug) : null;
  const nearbyItems = getArchiveAssetNearbyItems(asset, allAssets);
  const isVisual = isArchiveVisualAsset(asset);
  const fileUrl = asset.file_url;

  return (
    <Container className="intro-grid archive-detail-page">
      <section className="hero hero--split archive-detail-hero">
        <div className="hero__copy">
          <p className="eyebrow">acervo</p>
          <h1 className="hero__title">{asset.title}</h1>
          <p className="hero__lead">
            {getArchiveAssetTypeLabel(asset.asset_type)} · {asset.source_date_label || asset.approximate_year || "data aberta"}
          </p>
          <div className="meta-row">
            <span>{asset.place_label || "Volta Redonda"}</span>
            <span>{asset.source_label || "Fonte aberta"}</span>
            <span>{asset.rights_note || "Uso editorial controlado"}</span>
          </div>
          <div className="tag-row">
            <span className="tag-row__item">{getArchiveAssetTypeLabel(asset.asset_type)}</span>
            {asset.featured ? <span className="tag-row__item">destaque</span> : null}
            {relatedMemory ? <span className="tag-row__item">Memória vinculada</span> : null}
            {relatedEditorial ? <span className="tag-row__item">Pauta vinculada</span> : null}
          </div>
          <div className="stack-actions">
            <Link href="/acervo" className="button-secondary">
              Voltar ao acervo
            </Link>
            {relatedMemory ? <Link href={`/memoria/${relatedMemory.slug}`} className="button">Ver memória</Link> : null}
          </div>
        </div>

        <article className="support-box archive-detail-preview">
          <p className="eyebrow">visualização</p>
          {isVisual ? (
            <Image
              src={getArchiveAssetDisplayUrl(asset)}
              alt={asset.title}
              className="archive-detail-preview__image"
              width={1200}
              height={900}
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
          ) : (
            <div className="archive-detail-preview__fallback">
              <span>{getArchiveAssetTypeLabel(asset.asset_type)}</span>
              <strong>{asset.title}</strong>
              <p>{asset.description || asset.source_label || "Documento sem prévia visual."}</p>
            </div>
          )}
          <div className="stack-actions">
            <a href={fileUrl} className="button-secondary" target="_blank" rel="noreferrer">
              Abrir arquivo
            </a>
          </div>
        </article>
      </section>

      <section className="section archive-detail-body">
        <div className="grid-2">
          <article className="support-box">
            <h3>Descrição</h3>
            <p>{asset.description || "Sem descrição adicional registrada."}</p>
          </article>
          <article className="support-box">
            <h3>Metadados</h3>
            <ul>
              <li>Tipo: {getArchiveAssetTypeLabel(asset.asset_type)}</li>
              <li>Fonte: {asset.source_label || "não informada"}</li>
              <li>Data aproximada: {asset.source_date_label || "não informada"}</li>
              <li>Ano: {asset.approximate_year || "não informado"}</li>
              <li>Lugar: {asset.place_label || "não informado"}</li>
              <li>Visibilidade: {asset.public_visibility ? "pública" : "interna"}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section archive-connections">
        <div className="grid-2">
          <div>
            <p className="eyebrow">conexões</p>
            <h2>Documento, memória e pauta.</h2>
          </div>
          <p className="section__lead">
            O arquivo ganha força quando volta para o contexto que o produziu ou para a narrativa que o leu.
          </p>
        </div>

        <div className="grid-2">
          {relatedMemory ? (
            <article className="support-box">
              <p className="eyebrow">memória relacionada</p>
              <h3>{relatedMemory.title}</h3>
              <p>{relatedMemory.excerpt}</p>
              <Link href={`/memoria/${relatedMemory.slug}`} className="button-secondary">
                Ver memória
              </Link>
            </article>
          ) : null}
          {relatedEditorial ? (
            <article className="support-box">
              <p className="eyebrow">pauta relacionada</p>
              <h3>{relatedEditorial.title}</h3>
              <p>{relatedEditorial.excerpt}</p>
              <Link href={`/pautas/${relatedEditorial.slug}`} className="button-secondary">
                Ver pauta
              </Link>
            </article>
          ) : null}
        </div>

        {relatedSeries ? (
          <article className="support-box">
            <p className="eyebrow">série conectada</p>
            <EditorialCover
              title={relatedSeries.title}
              primaryTag="Série"
              seriesTitle={relatedSeries.title}
              coverImageUrl={relatedSeries.coverImageUrl ?? null}
              coverVariant={relatedSeries.coverVariant}
            />
            <h3>{relatedSeries.title}</h3>
            <p>{relatedSeries.description}</p>
            <Link href={`/series/${relatedSeries.slug}`} className="button-secondary">
              Abrir série
            </Link>
          </article>
        ) : null}
      </section>

      <section className="section archive-nearby">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próximos materiais</p>
            <h2>Mais documentos no mesmo circuito.</h2>
          </div>
          <p className="section__lead">
            Navegação leve entre objetos próximos por tipo, lugar ou vínculo documental.
          </p>
        </div>

        <div className="grid-3">
          {nearbyItems.length ? (
            nearbyItems.map((nearby) => (
              <ArchiveAssetCard
                key={nearby.id}
                asset={nearby}
                href={`/acervo/${nearby.id}`}
                actionLabel="Abrir documento"
                compact
              />
            ))
          ) : (
            <div className="support-box">
              <p>Sem materiais próximos por enquanto.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}

