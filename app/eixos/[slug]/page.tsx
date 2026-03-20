import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveCollectionCard } from "@/components/archive-collection-card";
import { Container } from "@/components/container";
import { DossierCard } from "@/components/dossier-card";
import { DossierUpdateCard } from "@/components/dossier-update-card";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { MemoryCard } from "@/components/memory-card";
import { ThemeHubLeadPiece } from "@/components/theme-hub-primary-piece";
import { ThemeHubTimeline } from "@/components/theme-hub-timeline";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesBySlug, getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { getThemeHubStatusLabel } from "@/lib/hubs/navigation";
import { buildThemeHubTimeline, groupThemeHubLinksByType, resolveThemeHubLinks } from "@/lib/hubs/resolve";
import { getPublishedThemeHubBySlug, getPublishedThemeHubLinks, getPublishedThemeHubs } from "@/lib/hubs/queries";

export async function generateStaticParams() {
  const hubs = await getPublishedThemeHubs();
  return hubs.map((hub) => ({ slug: hub.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hub = await getPublishedThemeHubBySlug(slug);

  if (!hub) {
    return {
      title: "Eixos",
      description: "Grandes frentes temáticas do VR Abandonada.",
    };
  }

  return {
    title: `${hub.title} | Eixos`,
    description: hub.excerpt || hub.description || "Eixo temático do VR Abandonada.",
    openGraph: {
      title: `${hub.title} | Eixos`,
      description: hub.excerpt || hub.description || "Eixo temático do VR Abandonada.",
      type: "article",
      images: [hub.cover_image_url || getHomeOpenGraphImagePath()],
    },
    twitter: {
      card: "summary_large_image",
      title: `${hub.title} | Eixos`,
      description: hub.excerpt || hub.description || "Eixo temático do VR Abandonada.",
      images: [hub.cover_image_url || getHomeOpenGraphImagePath()],
    },
  };
}

export default async function ThemeHubDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const hub = await getPublishedThemeHubBySlug(slug);

  if (!hub) {
    notFound();
  }

  const links = await getPublishedThemeHubLinks(hub.id);
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const dossiers = await getPublishedDossiers();
  const seriesCards = getEditorialSeriesCards(editorialItems);
  const resolvedLinks = resolveThemeHubLinks(links, {
    editorialItems,
    memoryItems,
    archiveAssets,
    archiveCollections,
    dossiers,
    seriesCards,
  });
  const grouped = groupThemeHubLinksByType(resolvedLinks);
  const timelineEntries = buildThemeHubTimeline(resolvedLinks);
  const editorialBySlug = new Map(editorialItems.map((item) => [item.slug, item]));
  const memoryBySlug = new Map(memoryItems.map((item) => [item.slug, item]));
  const archiveById = new Map(archiveAssets.map((item) => [item.id, item]));
  const collectionBySlug = new Map(archiveCollections.map((item) => [item.slug, item]));
  const dossierBySlug = new Map(dossiers.map((item) => [item.slug, item]));
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;
  const dossierLinks = resolvedLinks.filter((link) => link.link_type === "dossier");
  const relatedDossierIds = dossierLinks
    .map((link) => dossierBySlug.get(link.link_key))
    .filter((item): item is (typeof dossiers)[number] => Boolean(item));
  const updatesByDossierId = await getPublishedDossierUpdatesByDossierIds(relatedDossierIds.map((item) => item.id));
  const latestMovements = relatedDossierIds
    .map((dossier) => ({ dossier, update: updatesByDossierId.get(dossier.id)?.[0] ?? null }))
    .filter((item) => Boolean(item.update))
    .slice(0, 3);
  const relatedSeries = resolvedLinks
    .filter((link) => link.link_type === "series")
    .map((link) => seriesCards.find((series) => series.slug === link.link_key) ?? getEditorialSeriesBySlug(link.link_key))
    .filter((item): item is NonNullable<ReturnType<typeof getEditorialSeriesBySlug>> => Boolean(item));

  const typeSections = [
    { type: "dossier", title: "Dossiês conectados" },
    { type: "editorial", title: "Pautas conectadas" },
    { type: "memory", title: "Memória relacionada" },
    { type: "archive", title: "Materiais do acervo" },
    { type: "collection", title: "Coleções relacionadas" },
    { type: "series", title: "Séries relacionadas" },
  ] as const;

  return (
    <Container className="intro-grid theme-hub-detail-page">
      <section className="hero hero--split theme-hub-detail-hero">
        <div className="hero__copy">
          <p className="eyebrow">eixo temático</p>
          <h1 className="hero__title">{hub.title}</h1>
          <p className="hero__lead">{hub.excerpt || hub.description}</p>
          <div className="meta-row">
            <span>{getThemeHubStatusLabel(hub.status)}</span>
            {hub.lead_question ? <span>pergunta central</span> : null}
            <span>{resolvedLinks.length} peça(s) conectada(s)</span>
          </div>
          {hub.lead_question ? (
            <article className="support-box dossier-question-box">
              <p className="eyebrow">tese do eixo</p>
              <h2>{hub.lead_question}</h2>
            </article>
          ) : null}
          <div className="stack-actions">
            <Link href="/eixos" className="button-secondary">
              Voltar aos eixos
            </Link>
            <Link href="/dossies" className="button-secondary">
              Abrir dossiês
            </Link>
            <Link href="/envie" className="button">
              Enviar pista
            </Link>
          </div>
        </div>

        <EditorialCover
          title={hub.title}
          primaryTag={getThemeHubStatusLabel(hub.status)}
          seriesTitle={hub.lead_question || hub.excerpt || hub.title}
          coverImageUrl={hub.cover_image_url}
          coverVariant={hub.featured ? "ember" : "concrete"}
        />
      </section>

      <section className="section theme-hub-intro-section">
        <div className="grid-2">
          <article className="support-box">
            <h3>O recorte</h3>
            <p>{hub.description || hub.excerpt || "Recorte editorial do eixo temático."}</p>
          </article>
          <article className="support-box">
            <h3>Por onde começar</h3>
            <p>
              O eixo vira porta de entrada quando organiza documento, memória, pauta e caso em uma mesma trilha de leitura.
            </p>
            <ThemeHubLeadPiece hub={hub} leadLink={leadLink} />
          </article>
        </div>
      </section>

      <section className="section theme-hub-timeline-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">marcos do eixo</p>
            <h2>Sequência pública da frente temática.</h2>
          </div>
          <p className="section__lead">A timeline junta os principais pontos do percurso sem virar cronologia burocrática.</p>
        </div>

        <ThemeHubTimeline entries={timelineEntries} />
      </section>

      {latestMovements.length ? (
        <section className="section theme-hub-movements-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">últimas movimentações</p>
              <h2>O que continua em curso dentro do tema.</h2>
            </div>
            <p className="section__lead">Os dossiês relacionados mostram o tema respirando no presente.</p>
          </div>

          <div className="grid-2">
            {latestMovements.map(({ dossier, update }) =>
              update ? <DossierUpdateCard key={update.id} update={update} href={`/dossies/${dossier.slug}`} actionLabel={`Abrir ${dossier.title}`} /> : null,
            )}
          </div>
        </section>
      ) : null}

      {typeSections.map(({ type, title }) => {
        const items = grouped[type] ?? [];
        if (!items.length) {
          return null;
        }

        return (
          <section className="section theme-hub-links-section" key={type}>
            <div className="grid-2">
              <div>
                <p className="eyebrow">{title}</p>
                <h2>{title}</h2>
              </div>
              <p className="section__lead">
                {type === "dossier"
                  ? "Investigação em curso ou concluída que aprofunda a frente temática."
                  : type === "editorial"
                    ? "Pautas que dão primeira leitura ao tema."
                    : type === "memory"
                      ? "Memórias e registros de base que mantêm o tema ancorado na cidade."
                      : type === "archive"
                        ? "Documentos e anexos que oferecem lastro material."
                        : type === "collection"
                          ? "Recortes curados do arquivo vivo."
                          : "Linhas editoriais que seguem a mesma pergunta pública."}
              </p>
            </div>

            <div className="grid-2">
              {items.map((link) => {
                if (link.link_type === "dossier") {
                  const item = dossiers.find((entry) => entry.slug === link.link_key);
                  return item ? <DossierCard key={link.id} dossier={item} href={`/dossies/${item.slug}`} itemCount={0} /> : null;
                }

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
                  return item ? <ArchiveAssetCard key={link.id} asset={item} href={link.href} actionLabel="Abrir documento" compact /> : null;
                }

                if (link.link_type === "collection") {
                  const item = collectionBySlug.get(link.link_key);
                  return item ? <ArchiveCollectionCard key={link.id} collection={item} href={link.href} compact /> : null;
                }

                if (link.link_type === "series") {
                  const item = relatedSeries.find((series) => series.slug === link.link_key) ?? getEditorialSeriesBySlug(link.link_key);
                  return item ? (
                    <article className="support-box" key={link.id}>
                      <p className="eyebrow">{link.link_role}</p>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <Link href={`/series/${item.slug}`} className="button-secondary">
                        Ver série
                      </Link>
                    </article>
                  ) : null;
                }

                return null;
              })}
            </div>
          </section>
        );
      })}

      <section className="section theme-hub-bridge-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhe este eixo</p>
            <h2>O tema continua em pauta, em memória e em arquivo.</h2>
          </div>
          <p className="section__lead">
            O eixo não substitui os formatos do projeto. Ele os atravessa e ajuda o público a voltar para as peças certas quando o tema exige continuidade.
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>Enviar pista</h3>
            <p>Relato, documento ou foto podem entrar pelo canal de envio.</p>
            <Link href="/envie" className="button-secondary">
              Abrir canal
            </Link>
          </article>
          <article className="card">
            <h3>Abrir dossiês</h3>
            <p>Os casos organizam a investigação em percurso público.</p>
            <Link href="/dossies" className="button-secondary">
              Ver dossiês
            </Link>
          </article>
          <article className="card">
            <h3>Entrar no acervo</h3>
            <p>Os documentos sustentam a leitura e a memória do tema.</p>
            <Link href="/acervo" className="button-secondary">
              Ver acervo
            </Link>
          </article>
        </div>
      </section>
    </Container>
  );
}
