import type { Metadata } from "next";
import Link from "next/link";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveCollectionCard } from "@/components/archive-collection-card";
import { Container } from "@/components/container";
import { EditorialCover } from "@/components/editorial-cover";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getArchiveAssetTypeLabel, getArchiveFilterOptions } from "@/lib/archive/navigation";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import {
  getPublishedArchiveAssets,
  getPublishedArchiveFilteredAssets,
} from "@/lib/archive/queries";

export const metadata: Metadata = {
  title: "Acervo",
  description: "Arquivo vivo de fontes, anexos e materiais-base do VR Abandonada.",
  openGraph: {
    title: "Acervo | VR Abandonada",
    description: "Arquivo vivo de fontes, anexos e materiais-base do VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acervo | VR Abandonada",
    description: "Arquivo vivo de fontes, anexos e materiais-base do VR Abandonada.",
    images: [getHomeOpenGraphImagePath()],
  },
};

type PageProps = {
  searchParams?: Promise<{ type?: string; year?: string; place?: string; memory?: string }>;
};

function toSearchParams(input: Record<string, string | undefined>) {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value) {
      next.set(key, value);
    }
  }

  return next;
}

function buildHref(current: URLSearchParams, updates: Record<string, string | null | undefined>) {
  const next = new URLSearchParams(current);

  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
  }

  const query = next.toString();
  return query ? `/acervo?${query}` : "/acervo";
}

function normalizeNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentParams = toSearchParams(resolvedSearchParams);
  const activeType = resolvedSearchParams.type ?? "";
  const activeYear = normalizeNumber(resolvedSearchParams.year);
  const activePlace = resolvedSearchParams.place ?? "";
  const activeMemory = resolvedSearchParams.memory ?? "";

  const allAssets = await getPublishedArchiveAssets();
  const collections = await getPublishedArchiveCollections();
  const memoryItems = await getPublishedMemoryItems();
  const editorialItems = await getPublishedEditorialItems();
  const selectedAssets = await getPublishedArchiveFilteredAssets({
    assetType: activeType || undefined,
    year: activeYear,
    place: activePlace || undefined,
    memoryItemId: activeMemory || undefined,
  });

  const featuredAssets = allAssets.filter((asset) => asset.featured).slice(0, 3);
  const featuredCollections = collections.filter((collection) => collection.featured).slice(0, 4);
  const options = getArchiveFilterOptions(allAssets);
  const memoryById = new Map(memoryItems.map((memory) => [memory.id, memory]));
  const editorialById = new Map(editorialItems.map((editorial) => [editorial.id, editorial]));
  const highlightedAsset = selectedAssets[0] ?? allAssets[0] ?? null;
  const collectionCountBySlug = new Map(
    collections.map((collection) => [collection.slug, allAssets.filter((asset) => asset.collection_slug === collection.slug).length]),
  );
  const typeCards = options.types.map((type) => ({
    type,
    title: getArchiveAssetTypeLabel(type),
    count: allAssets.filter((asset) => asset.asset_type === type).length,
  }));

  return (
    <Container className="intro-grid archive-page">
      <section className="hero hero--split archive-hero">
        <div className="hero__copy">
          <p className="eyebrow">acervo</p>
          <h1 className="hero__title">Arquivo vivo em consulta.</h1>
          <p className="hero__lead">
            Fontes, anexos e materiais-base que sustentam as memórias e as pautas do VR Abandonada.
          </p>
          <div className="hero__actions">
            <Link href="/memoria" className="button">
              Ver memória
            </Link>
            <Link href="/pautas" className="button-secondary">
              Ver pautas
            </Link>
          </div>
        </div>

        {highlightedAsset ? (
          <article className="support-box archive-highlight">
            <p className="eyebrow">destaque do acervo</p>
            <EditorialCover
              title={highlightedAsset.title}
              primaryTag={getArchiveAssetTypeLabel(highlightedAsset.asset_type)}
              seriesTitle={highlightedAsset.collection_slug || highlightedAsset.place_label || highlightedAsset.source_label || "VR Abandonada"}
              coverImageUrl={highlightedAsset.thumb_url || highlightedAsset.file_url}
              coverVariant={highlightedAsset.featured ? "ember" : "concrete"}
            />
            <p>{highlightedAsset.description || highlightedAsset.source_label || "Objeto de arquivo vivo."}</p>
            <div className="stack-actions">
              <Link href={`/acervo/${highlightedAsset.id}`} className="button-secondary">
                Abrir documento
              </Link>
              {highlightedAsset.memory_item_id ? (
                <Link href={`/memoria/${memoryById.get(highlightedAsset.memory_item_id)?.slug ?? ""}`} className="button-secondary">
                  Ir para a memória
                </Link>
              ) : null}
            </div>
          </article>
        ) : null}
      </section>

      <section className="section archive-collections">
        <div className="grid-2">
          <div>
            <p className="eyebrow">coleções curadas</p>
            <h2>O arquivo entra por recortes, não por uma lista seca.</h2>
          </div>
          <p className="section__lead">
            Cada coleção funciona como um dossiê leve: agrupa documentos, organiza contexto e ajuda o leitor a entrar por linha de investigação.
          </p>
        </div>

        <div className="grid-4">
          {featuredCollections.map((collection) => (
            <ArchiveCollectionCard
              key={collection.id}
              collection={collection}
              href={`/acervo/colecoes/${collection.slug}`}
              assetCount={collectionCountBySlug.get(collection.slug) ?? 0}
            />
          ))}
        </div>
      </section>

      <section className="section archive-intro">
        <div className="grid-2">
          <div>
            <p className="eyebrow">O que entra aqui</p>
            <h2>Fotografias, recortes, scans e documentos.</h2>
          </div>
          <p className="section__lead">
            O acervo não é catálogo morto. Ele é a base documental que deixa a memória pública mais concreta e verificável.
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>{allAssets.length} materiais</h3>
            <p>Objetos de acervo disponíveis na camada pública.</p>
          </article>
          <article className="card">
            <h3>{featuredAssets.length} em destaque</h3>
            <p>Materiais que abrem a consulta ou sustentam uma leitura principal.</p>
          </article>
          <article className="card">
            <h3>{memoryItems.filter((item) => allAssets.some((asset) => asset.memory_item_id === item.id)).length} memórias conectadas</h3>
            <p>O arquivo anda junto com a narrativa e com a pauta.</p>
          </article>
        </div>
      </section>

      <section className="section archive-types">
        <div className="grid-2">
          <div>
            <p className="eyebrow">coleções leves</p>
            <h2>Consulta por tipo de material.</h2>
          </div>
          <p className="section__lead">
            Cada tipo funciona como uma coleção editorial simples. Sem taxonomia pesada, mas com navegação clara.
          </p>
        </div>

        <div className="grid-4">
          {typeCards.map((item) => (
            <Link
              key={item.type}
              href={buildHref(currentParams, { type: item.type })}
              className={`card archive-type-card ${activeType === item.type ? "archive-type-card--active" : ""}`}
            >
              <span className="pill">{item.count}</span>
              <h3>{item.title}</h3>
              <p>{item.title.toLowerCase()} do arquivo vivo.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section archive-filters">
        <div className="grid-2">
          <div>
            <p className="eyebrow">filtros simples</p>
            <h2>Período, lugar e vínculo com memória.</h2>
          </div>
          <p className="section__lead">
            Filtrar não é procurar em banco gigante. É reduzir o ruído e puxar o documento certo para a frente.
          </p>
        </div>

        <div className="archive-filter-rail">
          <span className="archive-filter-rail__label">Tipo</span>
          <Link href="/acervo" className={`tag-row__item ${!activeType ? "tag-row__item--active" : ""}`}>
            Todos
          </Link>
          {options.types.map((type) => (
            <Link
              key={type}
              href={buildHref(currentParams, { type })}
              className={`tag-row__item ${activeType === type ? "tag-row__item--active" : ""}`}
            >
              {getArchiveAssetTypeLabel(type)}
            </Link>
          ))}
        </div>

        <div className="archive-filter-rail">
          <span className="archive-filter-rail__label">Período</span>
          <Link href={buildHref(currentParams, { year: null })} className={`tag-row__item ${!activeYear ? "tag-row__item--active" : ""}`}>
            Todos
          </Link>
          {options.years.slice(0, 8).map((year) => (
            <Link
              key={year}
              href={buildHref(currentParams, { year: String(year) })}
              className={`tag-row__item ${activeYear === year ? "tag-row__item--active" : ""}`}
            >
              {year}
            </Link>
          ))}
        </div>

        <div className="archive-filter-rail">
          <span className="archive-filter-rail__label">Lugar</span>
          <Link href={buildHref(currentParams, { place: null })} className={`tag-row__item ${!activePlace ? "tag-row__item--active" : ""}`}>
            Todos
          </Link>
          {options.places.slice(0, 8).map((place) => (
            <Link
              key={place}
              href={buildHref(currentParams, { place })}
              className={`tag-row__item ${activePlace === place ? "tag-row__item--active" : ""}`}
            >
              {place}
            </Link>
          ))}
        </div>

        <div className="archive-filter-rail">
          <span className="archive-filter-rail__label">Memória conectada</span>
          <Link href={buildHref(currentParams, { memory: null })} className={`tag-row__item ${!activeMemory ? "tag-row__item--active" : ""}`}>
            Todas
          </Link>
          {options.memoryIds.slice(0, 6).map((memoryId) => {
            const memory = memoryById.get(memoryId);
            if (!memory) {
              return null;
            }

            return (
              <Link
                key={memoryId}
                href={buildHref(currentParams, { memory: memoryId })}
                className={`tag-row__item ${activeMemory === memoryId ? "tag-row__item--active" : ""}`}
              >
                {memory.title}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section archive-results">
        <div className="grid-2">
          <div>
            <p className="eyebrow">consulta</p>
            <h2>Materiais encontrados</h2>
          </div>
          <p className="section__lead">
            {selectedAssets.length} material(is) correspondentes ao recorte atual.
          </p>
        </div>

        <div className="grid-3">
          {selectedAssets.length ? (
            selectedAssets.map((asset) => (
              <ArchiveAssetCard
                key={asset.id}
                asset={asset}
                href={`/acervo/${asset.id}`}
                memoryLabel={asset.memory_item_id ? memoryById.get(asset.memory_item_id)?.title ?? null : null}
                editorialLabel={asset.editorial_item_id ? editorialById.get(asset.editorial_item_id)?.title ?? null : null}
                collectionLabel={asset.collection_slug ? collections.find((collection) => collection.slug === asset.collection_slug)?.title ?? null : null}
                collectionHref={asset.collection_slug ? `/acervo/colecoes/${asset.collection_slug}` : null}
                actionLabel="Abrir documento"
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem resultado</h3>
              <p>Tente limpar os filtros ou escolher outro tipo de material.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section archive-bridge">
        <div className="grid-2">
          <div>
            <p className="eyebrow">do arquivo para a pauta</p>
            <h2>O documento conversa com memória e pauta.</h2>
          </div>
          <p className="section__lead">
            O arquivo não fica isolado: ele ajuda a ler o que aconteceu, o que continua acontecendo e o que precisa virar investigação.
          </p>
        </div>

        <div className="grid-2">
          {featuredAssets.slice(0, 2).map((asset) => (
            <article className="support-box" key={asset.id}>
              <p className="eyebrow">{getArchiveAssetTypeLabel(asset.asset_type)}</p>
              <h3>{asset.title}</h3>
              <p>{asset.description || asset.source_label}</p>
              <div className="stack-actions">
                <Link href={`/acervo/${asset.id}`} className="button-secondary">
                  Abrir documento
                </Link>
                {asset.memory_item_id ? (
                  <Link href={`/memoria/${memoryById.get(asset.memory_item_id)?.slug ?? ""}`} className="button-secondary">
                    Ver memória
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </Container>
  );
}
