import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { Container } from "@/components/container";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { MemoryBridge } from "@/components/memory-bridge";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesBySlug } from "@/lib/editorial/taxonomy";
import { getMemoryCollectionCount, getRelatedEditorialForMemory } from "@/lib/memory/navigation";
import { getMemoryOpenGraphImagePath } from "@/lib/memory/share";
import {
  getPublishedArchiveAssetsByMemoryItemId,
  getPublishedArchiveAssets,
} from "@/lib/archive/queries";
import {
  getPublishedMemoryBySlug,
  getPublishedMemoryCollections,
  getPublishedMemoryItems,
} from "@/lib/memory/queries";

export async function generateStaticParams() {
  const items = await getPublishedMemoryItems();
  return items.map((item) => ({ slug: item.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedMemoryBySlug(slug);

  if (!item) {
    return {
      title: "Memória",
      description: "Arquivo vivo de Volta Redonda.",
    };
  }

  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt,
      type: "article",
      images: [item.cover_image_url || getMemoryOpenGraphImagePath(item.slug)],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.excerpt,
      images: [item.cover_image_url || getMemoryOpenGraphImagePath(item.slug)],
    },
  };
}

export default async function MemoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublishedMemoryBySlug(slug);

  if (!item) {
    notFound();
  }

  const items = await getPublishedMemoryItems();
  const collections = await getPublishedMemoryCollections();
  const editorialItems = await getPublishedEditorialItems();
  const publicAssets = await getPublishedArchiveAssetsByMemoryItemId(item.id);
  const fallbackArchiveAssets = publicAssets.length ? publicAssets : await getPublishedArchiveAssets();
  const memoryAssets = fallbackArchiveAssets.filter((asset) => asset.public_visibility && asset.memory_item_id === item.id);
  const relatedEditorial = getRelatedEditorialForMemory(item, editorialItems);
  const relatedSeries = item.related_series_slug ? getEditorialSeriesBySlug(item.related_series_slug) : null;
  const collection = collections.find((entry) => entry.slug === (item.collection_slug || item.memory_collection));
  const collectionCount = collection ? getMemoryCollectionCount(collection, items) : 0;

  return (
    <Container className="intro-grid memory-detail-page">
      <section className="hero hero--split memory-detail-hero">
        <div className="hero__copy">
          <p className="eyebrow">memória viva</p>
          <h1 className="hero__title">{item.title}</h1>
          <p className="hero__lead">{item.excerpt}</p>
          <div className="meta-row">
            <span>{item.period_label}</span>
            <span>{item.place_label || "Volta Redonda"}</span>
            <span>{item.year_start ? String(item.year_start) : "data aberta"}</span>
            <span>{item.archive_status}</span>
          </div>
          <div className="tag-row">
            <span className="tag-row__item">{item.collection_title || item.memory_collection}</span>
            <span className="tag-row__item">{item.memory_type}</span>
            {collection ? <span className="tag-row__item">{collectionCount} recortes</span> : null}
          </div>
          <div className="stack-actions">
            <Link href="/memoria" className="button-secondary">
              Voltar à memória
            </Link>
            {relatedEditorial ? (
              <Link href={`/pautas/${relatedEditorial.slug}`} className="button">
                Ler pauta relacionada
              </Link>
            ) : null}
          </div>
        </div>

        <EditorialCover
          title={item.title}
          primaryTag={item.memory_type}
          seriesTitle={item.collection_title || item.memory_collection}
          coverImageUrl={item.cover_image_url}
          coverVariant={item.highlight_in_memory ? "ember" : "concrete"}
        />
      </section>

      <section className="section memory-detail-article">
        <div className="grid-2">
          <article className="support-box">
            <h3>O recorte</h3>
            <p>{item.body}</p>
          </article>
          <article className="support-box">
            <h3>Fonte e contexto</h3>
            <p>{item.source_note || "Fonte editorial aberta."}</p>
            <p>
              A memória entra aqui como leitura de cidade. O arquivo ajuda a entender o presente, não a congelá-lo.
            </p>
          </article>
        </div>
      </section>

      {memoryAssets.length ? (
        <section className="section memory-archive-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">arquivo e fontes</p>
              <h2>Objetos ligados a esta memória</h2>
            </div>
            <p className="section__lead">
              Documentos, fotos e recortes ajudam a mostrar o lastro material por trás da leitura pública.
            </p>
          </div>

          <div className="grid-2">
            {memoryAssets.map((asset) => (
                <ArchiveAssetCard key={asset.id} asset={asset} compact href={`/acervo/${asset.id}`} actionLabel="Abrir no acervo" />
              ))}
          </div>
        </section>
      ) : null}

      <MemoryBridge memory={item} relatedEditorial={relatedEditorial} />

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Série e contexto</p>
            <h2>O recorte conversa com uma linha maior.</h2>
          </div>
          <p className="section__lead">
            A memória ganha densidade quando volta a puxar série, pauta e território para a mesma leitura.
          </p>
        </div>

        <div className="grid-2">
          {relatedEditorial ? <EditorialCard item={relatedEditorial} href={`/pautas/${relatedEditorial.slug}`} compact /> : null}
          {relatedSeries ? (
            <article className="support-box">
              <p className="eyebrow">Série conectada</p>
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
                Ver série
              </Link>
            </article>
          ) : null}
        </div>
      </section>
    </Container>
  );
}



