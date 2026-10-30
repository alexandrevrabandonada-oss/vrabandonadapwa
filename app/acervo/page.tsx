import type { Metadata } from "next";
import Link from "next/link";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveCollectionCard } from "@/components/archive-collection-card";
import { Container } from "@/components/container";
import { EditorialHubIntro } from "@/components/editorial-hub-intro";
import { EditorialAcervoIndex } from "@/components/editorial-navigation";
import { EditorialSourceIndex } from "@/components/editorial-source-index";
import { RevealSourceFromHash } from "@/components/reveal-source-from-hash";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getMaterias } from "@/lib/materias";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getArchiveAssetTypeLabel, getArchiveFilterOptions } from "@/lib/archive/navigation";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { filterPublishedArchiveAssets, getPublicArchiveCatalogState } from "@/lib/archive/queries";

export const metadata: Metadata = {
  title: "Acervo de reportagens, documentos e fontes",
  description: "Reportagens permanentes, documentos publicados e referências verificáveis do VR Abandonada.",
  alternates: { canonical: "/acervo" },
  openGraph: {
    title: "Acervo | VR Abandonada",
    description: "Reportagens, documentos e fontes do jornalismo sobre Volta Redonda.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
};

type PageProps = { searchParams?: Promise<{ type?: string; year?: string; place?: string; memory?: string }> };

function makeFilterHref(params: URLSearchParams, changes: Record<string, string | null>) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value); else next.delete(key);
  }
  const suffix = next.toString();
  return "/acervo" + (suffix ? "?" + suffix : "") + "#documentos";
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const incoming = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  for (const name of ["type", "year", "place", "memory"] as const) {
    if (incoming[name]) params.set(name, incoming[name]);
  }
  const activeYear = incoming.year && /^\d{4}$/.test(incoming.year) ? Number(incoming.year) : null;
  const activeType = incoming.type ?? "";
  const activePlace = incoming.place ?? "";
  const activeMemory = incoming.memory ?? "";
  const hasFilters = Boolean(activeType || activeYear || activePlace || activeMemory);
  const [articles, archiveCatalog, collections, memoryItems, editorialItems] = await Promise.all([
    getMaterias(),
    getPublicArchiveCatalogState(),
    getPublishedArchiveCollections(),
    getPublishedMemoryItems(),
    getPublishedEditorialItems(),
  ]);
  const { assets: allAssets, availability: archiveAvailability } = archiveCatalog;
  const selectedAssets = filterPublishedArchiveAssets(allAssets, {
    assetType: activeType || undefined,
    year: activeYear,
    place: activePlace || undefined,
    memoryItemId: activeMemory || undefined,
  });
  const options = getArchiveFilterOptions(allAssets);
  const hasCitedSources = articles.some((article) => article.sources.some((source) => /^https?:\/\//i.test(source.url)));
  const memoryById = new Map(memoryItems.map((item) => [item.id, item]));
  const editorialById = new Map(editorialItems.map((item) => [item.id, item]));
  const collectionBySlug = new Map(collections.map((item) => [item.slug, item]));
  const collectionCountBySlug = new Map(
    collections.map((item) => [item.slug, allAssets.filter((asset) => asset.collection_slug === item.slug).length]),
  );

  return (
    <Container className="vr6-hub archive-page">
      <EditorialHubIntro
        kicker="ACERVO PÚBLICO · VR ABANDONADA"
        title="Um arquivo para consultar, conferir e voltar."
        description="Reportagens, documentos e fontes conectados à cobertura da cidade. Uma publicação, um endereço permanente."
        navigationLabel="Ir para uma parte do acervo"
        links={[
          { href: "#index-acervo-titulo", label: "Reportagens" },
          ...(hasCitedSources ? [{ href: "#fontes-reportagens", label: "Fontes citadas" }] : []),
          { href: "#documentos", label: "Documentos" },
          { href: "/territorios", label: "Por bairro ↗" },
        ]}
      />

      <EditorialAcervoIndex articles={articles} />
      <RevealSourceFromHash />
      <EditorialSourceIndex articles={articles} />

      {archiveAvailability !== "available" ? (
        <section className="vr6-empty-note" role="status" aria-label="Disponibilidade dos documentos">
          <strong>{archiveAvailability === "unavailable" ? "Catálogo documental temporariamente indisponível." : "Catálogo documental não conectado neste ambiente."}</strong>
          <p>Não foi possível confirmar os documentos publicados. Isso não significa que o acervo esteja vazio. As reportagens verificadas e suas fontes continuam disponíveis acima.</p>
        </section>
      ) : null}

      <section className="vr6-hub__section" id="documentos" aria-labelledby="vr6-documents-title">
        <p className="vr6-eyebrow">DOCUMENTAÇÃO PUBLICADA</p>
        <h2 id="vr6-documents-title">Documentos e anexos</h2>
        <p>Somente materiais disponíveis publicamente e liberados para consulta. As referências externas das matérias estão na seção anterior.</p>

        {allAssets.length > 0 ? (
          <div className="vr6-filter-rails">
            <details open={hasFilters}>
              <summary>Filtrar documentos {hasFilters ? "· filtros ativos" : ""}</summary>
              <div className="vr6-filter-rail">
                <span>Tipo</span>
                <Link aria-current={!activeType ? "page" : undefined} href={makeFilterHref(params, { type: null })}>Todos</Link>
                {options.types.map((type) => (
                  <Link key={type} aria-current={activeType === type ? "page" : undefined} href={makeFilterHref(params, { type })}>{getArchiveAssetTypeLabel(type)}</Link>
                ))}
              </div>
              <div className="vr6-filter-rail">
                <span>Ano</span>
                <Link aria-current={!activeYear ? "page" : undefined} href={makeFilterHref(params, { year: null })}>Todos</Link>
                {options.years.map((year) => (
                  <Link key={year} aria-current={activeYear === year ? "page" : undefined} href={makeFilterHref(params, { year: String(year) })}>{year}</Link>
                ))}
              </div>
              <div className="vr6-filter-rail">
                <span>Lugar</span>
                <Link aria-current={!activePlace ? "page" : undefined} href={makeFilterHref(params, { place: null })}>Todos</Link>
                {options.places.map((place) => (
                  <Link key={place} aria-current={activePlace === place ? "page" : undefined} href={makeFilterHref(params, { place })}>{place}</Link>
                ))}
              </div>
              {options.memoryIds.length > 0 ? (
                <div className="vr6-filter-rail">
                  <span>Memória</span>
                  <Link aria-current={!activeMemory ? "page" : undefined} href={makeFilterHref(params, { memory: null })}>Todas</Link>
                  {options.memoryIds.map((id) => {
                    const memory = memoryById.get(id);
                    return memory ? <Link key={id} aria-current={activeMemory === id ? "page" : undefined} href={makeFilterHref(params, { memory: id })}>{memory.title}</Link> : null;
                  })}
                </div>
              ) : null}
              {hasFilters ? <Link className="vr6-story-link" href="/acervo#documentos">Limpar filtros ↗</Link> : null}
            </details>
          </div>
        ) : null}

        {selectedAssets.length ? (
          <div className="vr6-hub__grid">
            {selectedAssets.map((asset) => (
              <ArchiveAssetCard
                key={asset.id}
                asset={asset}
                href={"/acervo/" + asset.id}
                actionLabel="Consultar documento"
                memoryLabel={asset.memory_item_id ? memoryById.get(asset.memory_item_id)?.title : null}
                editorialLabel={asset.editorial_item_id ? editorialById.get(asset.editorial_item_id)?.title : null}
                collectionLabel={asset.collection_slug ? collectionBySlug.get(asset.collection_slug)?.title : null}
                collectionHref={asset.collection_slug ? "/acervo/colecoes/" + asset.collection_slug : null}
              />
            ))}
          </div>
        ) : archiveAvailability === "available" ? (
          <div className="vr6-empty-note">
            {hasFilters
              ? "Nenhum documento corresponde aos filtros. Limpe os filtros e tente novamente."
              : "Documentos e anexos em organização. Nada de registros fictícios: consulte as reportagens e as fontes públicas acima."}
          </div>
        ) : null}
      </section>

      {collections.length > 0 ? (
        <section className="vr6-hub__section" aria-labelledby="vr6-collections-title">
          <h2 id="vr6-collections-title">Coleções documentais</h2>
          <div className="vr6-hub__grid">
            {collections.map((collection) => (
              <ArchiveCollectionCard
                key={collection.id}
                collection={collection}
                href={"/acervo/colecoes/" + collection.slug}
                assetCount={collectionCountBySlug.get(collection.slug) ?? 0}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}

      <nav className="vr6-hub__end-links" aria-label="Continuar a pesquisa">
        <Link href="/materias">Todas as matérias ↗</Link>
        <Link href="/dossies">Investigações ↗</Link>
        <Link href="/territorios">Bairros ↗</Link>
        <Link href="/metodo">Método editorial ↗</Link>
      </nav>
    </Container>
  );
}
