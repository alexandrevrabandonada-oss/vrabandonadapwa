import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveCollectionCard } from "@/components/archive-collection-card";
import { Container } from "@/components/container";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { MemoryCard } from "@/components/memory-card";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedArchiveCollectionBySlug, getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedArchiveAssetsByCollectionSlug } from "@/lib/archive/queries";
import { getArchiveAssetTypeLabel } from "@/lib/archive/navigation";

export async function generateStaticParams() {
  const collections = await getPublishedArchiveCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getPublishedArchiveCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Acervo",
      description: "Arquivo vivo de Volta Redonda.",
    };
  }

  return {
    title: `${collection.title} | Acervo`,
    description: collection.excerpt || collection.description || "Recorte editorial do arquivo vivo.",
    openGraph: {
      title: `${collection.title} | Acervo`,
      description: collection.excerpt || collection.description || "Recorte editorial do arquivo vivo.",
      type: "article",
      images: [collection.cover_image_url || getHomeOpenGraphImagePath()],
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | Acervo`,
      description: collection.excerpt || collection.description || "Recorte editorial do arquivo vivo.",
      images: [collection.cover_image_url || getHomeOpenGraphImagePath()],
    },
  };
}

export default async function ArchiveCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getPublishedArchiveCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const collectionAssets = await getPublishedArchiveAssetsByCollectionSlug(collection.slug);
  const memoryItems = await getPublishedMemoryItems();
  const editorialItems = await getPublishedEditorialItems();
  const memoryById = new Map(memoryItems.map((memory) => [memory.id, memory]));
  const editorialById = new Map(editorialItems.map((editorial) => [editorial.id, editorial]));
  const relatedMemory = memoryItems.filter((item) => item.collection_slug === collection.slug || item.memory_collection === collection.slug);
  const relatedEditorial = editorialItems.filter((item) => item.series_slug === collection.slug || (item.series_title ?? "").toLowerCase() === collection.title.toLowerCase());
  const relatedFeatured = collectionAssets.filter((asset) => asset.featured).slice(0, 2);
  const linkedCount = collectionAssets.length;
  const typeCount = Array.from(new Set(collectionAssets.map((asset) => asset.asset_type))).length;

  return (
    <Container className="intro-grid archive-detail-page archive-collection-page">
      <section className="hero hero--split archive-detail-hero">
        <div className="hero__copy">
          <p className="eyebrow">coleção do acervo</p>
          <h1 className="hero__title">{collection.title}</h1>
          <p className="hero__lead">{collection.excerpt || collection.description || "Recorte editorial do arquivo vivo."}</p>
          <div className="meta-row">
            <span>{linkedCount} materiais</span>
            <span>{typeCount} tipos</span>
            <span>{collection.featured ? "destaque" : "coleção"}</span>
          </div>
          <div className="stack-actions">
            <Link href="/acervo" className="button-secondary">
              Voltar ao acervo
            </Link>
            <Link href="#materiais" className="button">
              Ver materiais
            </Link>
          </div>
        </div>

        <EditorialCover
          title={collection.title}
          primaryTag="Coleção"
          seriesTitle={collection.title}
          coverImageUrl={collection.cover_image_url}
          coverVariant={collection.featured ? "ember" : "concrete"}
        />
      </section>

      <section className="section archive-collection-intro">
        <div className="grid-2">
          <article className="support-box">
            <h3>O recorte</h3>
            <p>{collection.description || collection.excerpt || "Recorte editorial do arquivo vivo."}</p>
          </article>
          <article className="support-box">
            <h3>Entrar por esta linha</h3>
            <p>
              Esta coleção funciona como um dossiê leve. Cada asset entra como pista, prova ou lastro para entender o território.
            </p>
            <div className="stack-actions">
              <Link href="/memoria" className="button-secondary">
                Explorar memória
              </Link>
              <Link href="/pautas" className="button-secondary">
                Explorar pautas
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section archive-collection-materiais" id="materiais">
        <div className="grid-2">
          <div>
            <p className="eyebrow">materiais da coleção</p>
            <h2>Objetos documentais em torno do mesmo eixo.</h2>
          </div>
          <p className="section__lead">
            A coleção organiza o arquivo por percurso, e não por volume. O que entra aqui precisa conversar com a linha central.
          </p>
        </div>

        <div className="grid-3">
          {collectionAssets.length ? (
            collectionAssets.map((asset) => (
              <ArchiveAssetCard
                key={asset.id}
                asset={asset}
                href={`/acervo/${asset.id}`}
                memoryLabel={asset.memory_item_id ? memoryById.get(asset.memory_item_id)?.title ?? null : null}
                editorialLabel={asset.editorial_item_id ? editorialById.get(asset.editorial_item_id)?.title ?? null : null}
                actionLabel="Abrir documento"
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem materiais ligados</h3>
              <p>Associe assets com o mesmo slug de coleção para alimentar este recorte.</p>
            </div>
          )}
        </div>
      </section>

      {relatedFeatured.length ? (
        <section className="section archive-collection-bridge">
          <div className="grid-2">
            <div>
              <p className="eyebrow">do arquivo para o contexto</p>
              <h2>Materiais que puxam memória e pauta.</h2>
            </div>
            <p className="section__lead">
              Quando a coleção está viva, ela não fica sozinha: os documentos voltam para a narrativa e para a leitura pública.
            </p>
          </div>

          <div className="grid-2">
            {relatedFeatured.map((asset) => (
              <article className="support-box" key={asset.id}>
                <p className="eyebrow">{getArchiveAssetTypeLabel(asset.asset_type)}</p>
                <h3>{asset.title}</h3>
                <p>{asset.description || asset.source_label}</p>
                <Link href={`/acervo/${asset.id}`} className="button-secondary">
                  Abrir documento
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {relatedMemory.length ? (
        <section className="section archive-collection-memory">
          <div className="grid-2">
            <div>
              <p className="eyebrow">memória relacionada</p>
              <h2>Recortes do mesmo eixo.</h2>
            </div>
            <p className="section__lead">A coleção conversa com a memória da cidade para não virar arquivo frio.</p>
          </div>

          <div className="grid-2">
            {relatedMemory.slice(0, 2).map((memory) => (
              <MemoryCard key={memory.id} item={memory} href={`/memoria/${memory.slug}`} compact />
            ))}
          </div>
        </section>
      ) : null}

      {relatedEditorial.length ? (
        <section className="section archive-collection-editorial">
          <div className="grid-2">
            <div>
              <p className="eyebrow">pauta relacionada</p>
              <h2>O arquivo segue para a leitura pública.</h2>
            </div>
            <p className="section__lead">Coleção, pauta e série formam uma trilha única para navegar o projeto.</p>
          </div>

          <div className="grid-2">
            {relatedEditorial.slice(0, 2).map((item) => (
              <EditorialCard key={item.id} item={item} href={`/pautas/${item.slug}`} compact />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section archive-collection-summary">
        <ArchiveCollectionCard collection={collection} href={`/acervo/colecoes/${collection.slug}`} assetCount={linkedCount} />
      </section>
    </Container>
  );
}
