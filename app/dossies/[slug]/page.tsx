import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveCollectionCard } from "@/components/archive-collection-card";
import { Container } from "@/components/container";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { MemoryCard } from "@/components/memory-card";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getDossierLinkTypeLabel, getDossierSectionOrder } from "@/lib/dossiers/navigation";
import { getPublishedDossierBySlug, getPublishedDossierLinks, getPublishedDossiers } from "@/lib/dossiers/queries";
import { groupDossierLinksByType, resolveDossierLinks, getDossierLinkPreviewText } from "@/lib/dossiers/resolve";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesBySlug, getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedMemoryItems } from "@/lib/memory/queries";

export async function generateStaticParams() {
  const dossiers = await getPublishedDossiers();
  return dossiers.map((item) => ({ slug: item.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dossier = await getPublishedDossierBySlug(slug);

  if (!dossier) {
    return {
      title: "Dossiês",
      description: "Linhas de investigação viva do VR Abandonada.",
    };
  }

  return {
    title: `${dossier.title} | Dossiês`,
    description: dossier.excerpt || dossier.description || "Linha de investigação viva do VR Abandonada.",
    openGraph: {
      title: `${dossier.title} | Dossiês`,
      description: dossier.excerpt || dossier.description || "Linha de investigação viva do VR Abandonada.",
      type: "article",
      images: [dossier.cover_image_url || getHomeOpenGraphImagePath()],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dossier.title} | Dossiês`,
      description: dossier.excerpt || dossier.description || "Linha de investigação viva do VR Abandonada.",
      images: [dossier.cover_image_url || getHomeOpenGraphImagePath()],
    },
  };
}

export default async function DossierDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dossier = await getPublishedDossierBySlug(slug);

  if (!dossier) {
    notFound();
  }

  const links = await getPublishedDossierLinks(dossier.id);
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const seriesCards = getEditorialSeriesCards(editorialItems);
  const resolvedLinks = resolveDossierLinks(links, {
    editorialItems,
    memoryItems,
    archiveAssets,
    archiveCollections,
    seriesCards,
  });
  const groupedLinks = groupDossierLinksByType(resolvedLinks);
  const orderedTypes = Array.from(new Set(resolvedLinks.map((link) => link.link_type))).sort(
    (a, b) => getDossierSectionOrder(a) - getDossierSectionOrder(b),
  );
  const editorialBySlug = new Map(editorialItems.map((item) => [item.slug, item]));
  const memoryBySlug = new Map(memoryItems.map((item) => [item.slug, item]));
  const archiveById = new Map(archiveAssets.map((item) => [item.id, item]));
  const collectionBySlug = new Map(archiveCollections.map((item) => [item.slug, item]));
  const relatedSeriesLink = resolvedLinks.find((link) => link.link_type === "series");
  const relatedSeries = relatedSeriesLink
    ? seriesCards.find((series) => series.slug === relatedSeriesLink.link_key) ?? getEditorialSeriesBySlug(relatedSeriesLink.link_key)
    : null;

  return (
    <Container className="intro-grid dossier-detail-page">
      <section className="hero hero--split dossier-detail-hero">
        <div className="hero__copy">
          <p className="eyebrow">dossiê vivo</p>
          <h1 className="hero__title">{dossier.title}</h1>
          <p className="hero__lead">{dossier.excerpt || dossier.description}</p>
          <div className="meta-row">
            {dossier.period_label ? <span>{dossier.period_label}</span> : null}
            {dossier.territory_label ? <span>{dossier.territory_label}</span> : null}
            {dossier.lead_question ? <span>hipótese pública</span> : null}
            {dossier.status ? <span>{dossier.status}</span> : null}
          </div>
          <div className="stack-actions">
            <Link href="/dossies" className="button-secondary">
              Voltar aos dossiês
            </Link>
            <Link href="/pautas" className="button-secondary">
              Abrir pautas
            </Link>
            <Link href="/acervo" className="button">
              Entrar no acervo
            </Link>
          </div>
        </div>

        <EditorialCover
          title={dossier.title}
          primaryTag="Dossiê"
          seriesTitle={dossier.title}
          coverImageUrl={dossier.cover_image_url}
          coverVariant={dossier.featured ? "ember" : "concrete"}
        />
      </section>

      <section className="section dossier-detail-overview">
        <div className="grid-2">
          <article className="support-box">
            <p className="eyebrow">pergunta central</p>
            <h2>{dossier.lead_question || "Linha investigativa em andamento."}</h2>
            <p>{dossier.description || dossier.excerpt}</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">recorte</p>
            <h3>Período e território</h3>
            <p>{dossier.period_label || "Período aberto"}</p>
            <p>{dossier.territory_label || "Território aberto"}</p>
            <p>
              O dossiê funciona como unidade de entendimento. Os materiais abaixo aparecem na ordem editorial definida pelo projeto.
            </p>
          </article>
        </div>
      </section>

      <section className="section dossier-path-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">percurso de leitura</p>
            <h2>Do documento ao contexto.</h2>
          </div>
          <p className="section__lead">
            O caminho abaixo organiza o dossiê em camadas de leitura: documento, memória, pauta, coleção e série.
          </p>
        </div>

        <div className="grid-3">
          {orderedTypes.map((type) => {
            const count = groupedLinks[type]?.length ?? 0;
            return (
              <article className="card" key={type}>
                <span className="pill">{getDossierLinkTypeLabel(type)}</span>
                <h3>{count} vínculos</h3>
                <p>{getDossierLinkTypeLabel(type)} entra no percurso como uma camada de prova e contexto.</p>
              </article>
            );
          })}
        </div>
      </section>

      {orderedTypes.length ? (
        <section className="section dossier-links-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">peças do dossiê</p>
              <h2>Leituras conectadas e organizadas por eixo.</h2>
            </div>
            <p className="section__lead">
              Cada peça volta para a página pública certa. Nada de lista solta, nada de acúmulo sem ordem.
            </p>
          </div>

          <div className="dossier-links">
            {orderedTypes.map((type) => (
              <section className="dossier-links__group" key={type}>
                <div className="grid-2">
                  <div>
                    <p className="eyebrow">{getDossierLinkTypeLabel(type)}</p>
                    <h3>{getDossierLinkTypeLabel(type)}</h3>
                  </div>
                  <p className="section__lead">
                    {type === "archive"
                      ? "Fontes e documentos-base que sustentam a leitura pública."
                      : type === "memory"
                        ? "Memórias que colocam a cidade no centro da análise."
                        : type === "editorial"
                          ? "Pautas já publicadas ou em circulação no arquivo vivo."
                          : type === "collection"
                            ? "Coleções curatoriais que agrupam o recorte documental."
                            : "Séries que mantêm o fio da investigação em curso."}
                  </p>
                </div>

                <div className="grid-2">
                  {(groupedLinks[type] ?? []).map((link) => {
                    const preview = getDossierLinkPreviewText(link);

                    if (link.link_type === "editorial") {
                      const item = editorialBySlug.get(link.link_key);
                      return item ? <EditorialCard key={link.id} item={item} href={link.href} compact /> : null;
                    }

                    if (link.link_type === "memory") {
                      const item = memoryBySlug.get(link.link_key);
                      return item ? <MemoryCard key={link.id} item={item} href={link.href} compact /> : null;
                    }

                    if (link.link_type === "archive") {
                      const item = archiveById.get(link.link_key);
                      return item ? (
                        <ArchiveAssetCard key={link.id} asset={item} href={link.href} actionLabel="Abrir documento" compact />
                      ) : null;
                    }

                    if (link.link_type === "collection") {
                      const item = collectionBySlug.get(link.link_key);
                      return item ? (
                        <ArchiveCollectionCard key={link.id} collection={item} href={link.href} compact />
                      ) : null;
                    }

                    if (link.link_type === "series") {
                      return (
                        <article className="support-box" key={link.id}>
                          <h3>{link.title}</h3>
                          <p>{preview}</p>
                          <Link href={link.href} className="button-secondary">
                            Ver série
                          </Link>
                        </article>
                      );
                    }

                    return null;
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section dossier-next-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">continue lendo</p>
            <h2>O dossiê não termina aqui.</h2>
          </div>
          <p className="section__lead">
            O caso ganha sentido quando volta a atravessar pauta, memória e acervo. A navegação abaixo abre outros pontos de entrada.
          </p>
        </div>

        <div className="grid-3">
          {dossier.featured ? (
            <article className="card">
              <h3>Dossiê em destaque</h3>
              <p>{dossier.title}</p>
              <Link href={`/dossies/${dossier.slug}`} className="button-secondary">
                Reabrir dossiê
              </Link>
            </article>
          ) : null}
          <article className="card">
            <h3>Voltar à memória</h3>
            <p>A cidade volta a falar quando o arquivo deixa de ficar isolado.</p>
            <Link href="/memoria" className="button-secondary">
              Abrir memória
            </Link>
          </article>
          <article className="card">
            <h3>Entrar no acervo</h3>
            <p>Documento, recorte e imagem ajudam a manter o caso em pé.</p>
            <Link href="/acervo" className="button-secondary">
              Abrir acervo
            </Link>
          </article>
        </div>
      </section>

      {relatedSeries ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">série conectada</p>
              <h2>{relatedSeries.title}</h2>
            </div>
            <p className="section__lead">
              Quando a investigação precisa de continuidade, a série mantém o eixo em aberto.
            </p>
          </div>

          <article className="support-box">
            <EditorialCover
              title={relatedSeries.title}
              primaryTag="Série"
              seriesTitle={relatedSeries.title}
              coverImageUrl={relatedSeries.coverImageUrl ?? null}
              coverVariant={relatedSeries.coverVariant}
            />
            <p>{relatedSeries.description}</p>
            <Link href={`/series/${relatedSeries.slug}`} className="button-secondary">
              Ver série
            </Link>
          </article>
        </section>
      ) : null}
    </Container>
  );
}

