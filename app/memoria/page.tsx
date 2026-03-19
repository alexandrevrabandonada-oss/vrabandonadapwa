import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { MemoryBridge } from "@/components/memory-bridge";
import { MemoryCard } from "@/components/memory-card";
import { MemoryCollectionCard } from "@/components/memory-collection-card";
import { MemoryTimelineEntryCard } from "@/components/memory-timeline-entry";
import { PageHero } from "@/components/page-hero";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesBySlug } from "@/lib/editorial/taxonomy";
import { memoryCollections, memoryTimeline } from "@/lib/memory/catalog";
import { getMemoryCollectionCount, getMemoryFeaturedItem, getRelatedEditorialForMemory } from "@/lib/memory/navigation";
import { getMemoryItemsByCollection, getPublishedMemoryItems } from "@/lib/memory/queries";

export const metadata: Metadata = {
  title: "Memória",
  description: "Arquivo vivo, linhas do tempo e recortes editoriais de Volta Redonda.",
};

type PageProps = {
  searchParams: Promise<{ collection?: string }>;
};

export default async function MemoriaPage({ searchParams }: PageProps) {
  const { collection } = await searchParams;
  const items = await getPublishedMemoryItems();
  const editorialItems = await getPublishedEditorialItems();
  const featuredMemory = getMemoryFeaturedItem(items);
  const collectionSlug = collection && memoryCollections.some((entry) => entry.slug === collection) ? collection : null;
  const filteredItems = collectionSlug ? await getMemoryItemsByCollection(collectionSlug) : items;
  const relatedEditorial = featuredMemory ? getRelatedEditorialForMemory(featuredMemory, editorialItems) : null;
  const relatedSeries = featuredMemory?.related_series_slug
    ? getEditorialSeriesBySlug(featuredMemory.related_series_slug)
    : null;

  return (
    <Container className="intro-grid memory-page">
      <PageHero
        kicker="memória viva"
        title="Arquivo vivo da cidade operária."
        lead="A memória aqui funciona como ferramenta editorial: comparar versões, preservar relatos e conectar o passado ao que ainda está em disputa no presente."
      >
        <Link href="/pautas" className="button-secondary">
          Ver pautas relacionadas
        </Link>
        <Link href="/envie" className="button">
          Enviar relato de memória
        </Link>
      </PageHero>

      <section className="section memory-feature">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Destaque histórico</p>
            <h2>Memória que continua falando com o presente.</h2>
          </div>
          <p className="section__lead">
            Um recorte central para abrir a página e mostrar que memória no VR Abandonada não é nostalgia isolada. É método para ler a cidade.
          </p>
        </div>

        {featuredMemory ? (
          <div className="grid-2">
            <MemoryCard item={featuredMemory} href={`/memoria/${featuredMemory.slug}`} />
            <article className="support-box">
              <h3>O que este recorte mostra</h3>
              <p>{featuredMemory.body}</p>
              <div className="meta-row">
                <span>{featuredMemory.period_label}</span>
                <span>{featuredMemory.place_label || "Volta Redonda"}</span>
                <span>{featuredMemory.archive_status}</span>
              </div>
            </article>
          </div>
        ) : (
          <div className="support-box">
            <p>Sem itens de memória disponíveis no momento. Quando o banco estiver ativo, o arquivo entra aqui automaticamente.</p>
          </div>
        )}
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Recortes</p>
            <h2>Os agrupamentos que ajudam a navegar o arquivo.</h2>
          </div>
          <p className="section__lead">
            Cada recorte organiza a leitura por disputa, sem congelar a memória em categoria acadêmica.
          </p>
        </div>

        <div className="tag-row memory-filter-row">
          <Link className={`tag-row__item ${!collectionSlug ? "tag-row__item--active" : ""}`} href="/memoria">
            Tudo
          </Link>
          {memoryCollections.map((entry) => (
            <Link
              key={entry.slug}
              className={`tag-row__item ${collectionSlug === entry.slug ? "tag-row__item--active" : ""}`}
              href={`/memoria?collection=${entry.slug}`}
            >
              {entry.title}
            </Link>
          ))}
        </div>

        <div className="grid-3">
          {memoryCollections.map((entry) => (
            <MemoryCollectionCard
              key={entry.slug}
              collection={entry}
              count={getMemoryCollectionCount(entry, items)}
            />
          ))}
        </div>

        {collectionSlug ? (
          <div className="section memory-collection-results">
            <div className="grid-2">
              <div>
                <p className="eyebrow">Filtro ativo</p>
                <h2>{memoryCollections.find((entry) => entry.slug === collectionSlug)?.title}</h2>
              </div>
              <p className="section__lead">
                Estes recortes entram agora como porta de leitura direta dentro do arquivo vivo.
              </p>
            </div>

            <div className="grid-3">
              {filteredItems.map((item) => (
                <MemoryCard key={item.id} item={item} href={`/memoria/${item.slug}`} compact />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Linha do tempo</p>
            <h2>Marcos leves para atravessar a cidade.</h2>
          </div>
          <p className="section__lead">
            Uma timeline curta, editorial e legível. O objetivo não é enciclopédia. É orientação para o leitor entender a continuidade do conflito.
          </p>
        </div>

        <div className="timeline-rail">
          {memoryTimeline.map((entry) => (
            <MemoryTimelineEntryCard key={`${entry.year}-${entry.label}`} entry={entry} />
          ))}
        </div>
      </section>

      {featuredMemory ? <MemoryBridge memory={featuredMemory} relatedEditorial={relatedEditorial} /> : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Linhas de investigação</p>
            <h2>Memória, pauta e série puxadas para a mesma leitura.</h2>
          </div>
          <p className="section__lead">
            Se o arquivo ajuda a entender o presente, ele também ajuda a escolher onde olhar a seguir.
          </p>
        </div>

        <div className="grid-2">
          {relatedEditorial ? (
            <EditorialCard item={relatedEditorial} href={`/pautas/${relatedEditorial.slug}`} compact />
          ) : null}
          {relatedSeries ? (
            <article className="support-box memory-series-box">
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
