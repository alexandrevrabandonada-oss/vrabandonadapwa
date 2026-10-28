import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getMaterias } from "@/lib/materias";
import { getArchiveAssetTypeLabel, getArchiveFilterOptions } from "@/lib/archive/navigation";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedArchiveAssets, getPublishedArchiveFilteredAssets } from "@/lib/archive/queries";

export const metadata: Metadata = {
  title: "Documentos e fontes",
  description: "Documentos públicos e referências citadas nas reportagens do VR Abandonada.",
  alternates: { canonical: "/acervo" },
  openGraph: {
    title: "Documentos e fontes | VR Abandonada",
    description: "Consulte os materiais disponíveis e as fontes públicas das reportagens.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
};

type PageProps = {
  searchParams?: Promise<{ type?: string; year?: string; place?: string; memory?: string }>;
};

function buildFilterHref(params: URLSearchParams, changes: Record<string, string | null>) {
  const next = new URLSearchParams(params);
  for (const [name, value] of Object.entries(changes)) {
    if (value) next.set(name, value);
    else next.delete(name);
  }
  const query = next.toString();
  return query ? "/acervo?" + query : "/acervo";
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const current = new URLSearchParams();
  if (params.type) current.set("type", params.type);
  if (params.year) current.set("year", params.year);
  if (params.place) current.set("place", params.place);
  if (params.memory) current.set("memory", params.memory);

  const activeYear = params.year && /^\d{4}$/.test(params.year) ? Number(params.year) : null;
  const activeType = params.type ?? "";
  const activePlace = params.place ?? "";
  const activeMemory = params.memory ?? "";
  const filtered = Boolean(activeType || activeYear || activePlace || activeMemory);

  const [assets, collections, materias, memoryItems] = await Promise.all([
    getPublishedArchiveAssets(),
    getPublishedArchiveCollections(),
    getMaterias(),
    getPublishedMemoryItems(),
  ]);
  const selected = await getPublishedArchiveFilteredAssets({
    assetType: activeType || undefined,
    year: activeYear,
    place: activePlace || undefined,
    memoryItemId: activeMemory || undefined,
  });
  const options = getArchiveFilterOptions(assets);
  const memoryById = new Map(memoryItems.map((item) => [item.id, item]));
  const sourceMap = new Map<string, { label: string; url: string; articleTitle: string; articleHref: string; consultedAt?: string }>();

  // A fonte externa já citada numa matéria aprovada não é confundida com um arquivo hospedado.
  for (const article of materias) {
    for (const source of article.sources) {
      if (!/^https?:\/\//i.test(source.url) || sourceMap.has(source.url)) continue;
      sourceMap.set(source.url, {
        label: source.label,
        url: source.url,
        articleTitle: article.title,
        articleHref: "/materias/" + article.slug,
        consultedAt: source.consultedAt,
      });
    }
  }
  const citedSources = [...sourceMap.values()].slice(0, 20);

  return (
    <Container className="vr4-index vr4-archive">
      <header className="vr4-index__header">
        <p className="vr2-eyebrow">EVIDÊNCIAS E MEMÓRIA PÚBLICA</p>
        <h1>Documentos e fontes</h1>
        <p>Consulte materiais do acervo e referências públicas usadas nas reportagens. Cada fonte deve poder ser encontrada de novo.</p>
        <form action="/buscar" method="get" role="search" className="vr4-quick-search">
          <label htmlFor="vr4-archive-search">Pesquisar em todo o portal</label>
          <div>
            <input id="vr4-archive-search" type="search" name="q" maxLength={100} placeholder="Contrato, CSN, Rua 33..." />
            <button type="submit">Pesquisar</button>
          </div>
        </form>
      </header>

      <section className="vr4-index__section" aria-labelledby="vr4-assets-title">
        <div className="vr4-index__section-heading">
          <h2 id="vr4-assets-title">Materiais do acervo</h2>
          <span>{selected.length} {selected.length === 1 ? "material" : "materiais"}</span>
        </div>
        {assets.length > 0 ? (
          <details className="vr4-filters" open={filtered}>
            <summary>Filtrar materiais {filtered ? "(filtros ativos)" : ""}</summary>
            <div className="vr4-filter-row">
              <span>Tipo</span>
              <Link aria-current={!activeType ? "true" : undefined} href={buildFilterHref(current, { type: null })}>Todos</Link>
              {options.types.map((type) => (
                <Link key={type} aria-current={activeType === type ? "true" : undefined} href={buildFilterHref(current, { type })}>
                  {getArchiveAssetTypeLabel(type)}
                </Link>
              ))}
            </div>
            <div className="vr4-filter-row">
              <span>Período</span>
              <Link aria-current={!activeYear ? "true" : undefined} href={buildFilterHref(current, { year: null })}>Todos</Link>
              {options.years.slice(0, 12).map((year) => (
                <Link key={year} aria-current={activeYear === year ? "true" : undefined} href={buildFilterHref(current, { year: String(year) })}>{year}</Link>
              ))}
            </div>
            <div className="vr4-filter-row">
              <span>Lugar</span>
              <Link aria-current={!activePlace ? "true" : undefined} href={buildFilterHref(current, { place: null })}>Todos</Link>
              {options.places.slice(0, 12).map((place) => (
                <Link key={place} aria-current={activePlace === place ? "true" : undefined} href={buildFilterHref(current, { place })}>{place}</Link>
              ))}
            </div>
            <div className="vr4-filter-row">
              <span>Memória</span>
              <Link aria-current={!activeMemory ? "true" : undefined} href={buildFilterHref(current, { memory: null })}>Todas</Link>
              {options.memoryIds.slice(0, 12).map((memoryId) => {
                const item = memoryById.get(memoryId);
                return item ? (
                  <Link key={memoryId} aria-current={activeMemory === memoryId ? "true" : undefined} href={buildFilterHref(current, { memory: memoryId })}>{item.title}</Link>
                ) : null;
              })}
            </div>
            {filtered ? <Link className="vr4-filters__reset" href="/acervo">Limpar filtros ↗</Link> : null}
          </details>
        ) : null}

        {selected.length > 0 ? (
          <div className="vr4-item-list">
            {selected.map((asset) => (
              <article key={asset.id} className="vr4-item">
                <div className="vr4-item__meta">
                  <span>{getArchiveAssetTypeLabel(asset.asset_type)}</span>
                  {asset.source_date_label ? <span>{asset.source_date_label}</span> : null}
                  {asset.place_label ? <span>{asset.place_label}</span> : null}
                </div>
                <h3><Link href={"/acervo/" + asset.id}>{asset.title}</Link></h3>
                {asset.description || asset.source_label ? <p>{asset.description || asset.source_label}</p> : null}
                <div className="vr4-item__bottom">
                  <span>{asset.source_label ? "Origem: " + asset.source_label : "Material documental"}</span>
                  <Link href={"/acervo/" + asset.id}>Abrir material ↗</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="vr4-empty">
            <strong>{filtered ? "Nenhum material corresponde aos filtros." : "Ainda não há materiais hospedados nesta coleção."}</strong>
            <p>{filtered ? "Experimente retirar um filtro." : "As fontes públicas das matérias já publicadas podem ser consultadas logo abaixo."}</p>
            {filtered ? <Link href="/acervo">Limpar filtros ↗</Link> : null}
          </div>
        )}
      </section>

      {citedSources.length > 0 ? (
        <section className="vr4-index__section" aria-labelledby="vr4-sources-title">
          <div className="vr4-index__section-heading">
            <h2 id="vr4-sources-title">Fontes citadas nas reportagens</h2>
            <span>{sourceMap.size} {sourceMap.size === 1 ? "referência" : "referências"}</span>
          </div>
          <p className="vr4-index__section-note">São links externos citados em matérias aprovadas, não arquivos guardados pelo VR Abandonada. A disponibilidade depende dos sites de origem.</p>
          <div className="vr4-item-list">
            {citedSources.map((source) => (
              <article key={source.url} className="vr4-item vr4-item--source">
                <div className="vr4-item__meta"><span>Fonte externa</span>{source.consultedAt ? <span>Consulta: {source.consultedAt}</span> : null}</div>
                <h3><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></h3>
                <p>Citada em: <Link href={source.articleHref}>{source.articleTitle}</Link></p>
              </article>
            ))}
          </div>
          {sourceMap.size > citedSources.length ? <p className="vr4-index__section-note">Exibindo as 20 referências mais recentes do arquivo editorial.</p> : null}
        </section>
      ) : null}

      {collections.length > 0 ? (
        <section className="vr4-index__section" aria-labelledby="vr4-collections-title">
          <div className="vr4-index__section-heading"><h2 id="vr4-collections-title">Coleções</h2><span>{collections.length}</span></div>
          <div className="vr4-item-list">
            {collections.map((collection) => (
              <article key={collection.id} className="vr4-item">
                <div className="vr4-item__meta"><span>Coleção documental</span></div>
                <h3><Link href={"/acervo/colecoes/" + collection.slug}>{collection.title}</Link></h3>
                {collection.excerpt || collection.description ? <p>{collection.excerpt || collection.description}</p> : null}
                <div className="vr4-item__bottom"><span>Acervo público</span><Link href={"/acervo/colecoes/" + collection.slug}>Abrir coleção ↗</Link></div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="vr4-index__related" aria-label="Outras formas de consultar o arquivo">
        <Link href="/memoria">Memória da cidade ↗</Link>
        <Link href="/materias">Reportagens ↗</Link>
        <Link href="/metodo">Como verificamos fontes ↗</Link>
      </nav>
    </Container>
  );
}
