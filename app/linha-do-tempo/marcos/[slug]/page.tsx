import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";


import { Container } from "@/components/container";
import { EditorialCover } from "@/components/editorial-cover";
import { FollowButton } from "@/components/follow-button";
import { SaveReadButton } from "@/components/save-read-button";
import { TimelineEntryCard } from "@/components/timeline-entry-card";
import { TimelineHighlightLinkCard } from "@/components/timeline-highlight-link-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedTimelineEntries, getTimelineRelatedEntries } from "@/lib/timeline/queries";
import { getPublishedTimelineHighlightBySlug, getPublishedTimelineHighlightLinks } from "@/lib/timeline/highlight-queries";
import { buildTimelineHighlightTimeline, getTimelineHighlightHeroVariant, resolveTimelineHighlightLinks } from "@/lib/timeline/highlight-resolve";
import { getTimelineHighlightHref, getTimelineHighlightStatusLabel, getTimelineHighlightTypeLabel } from "@/lib/timeline/highlights";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedActorHubs } from "@/lib/actors/queries";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
export const dynamic = "force-dynamic";

type Params = { slug: string };

function firstSentence(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const index = trimmed.search(/[.!?]/);
  return index === -1 ? trimmed : trimmed.slice(0, index + 1);
}

async function getResolvedHighlight(slug: string) {
  return getPublishedTimelineHighlightBySlug(slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const highlight = await getResolvedHighlight(resolved.slug);

  if (!highlight) {
    return {
      title: "Linha do tempo",
      description: "Cronologia transversal do VR Abandonada.",
      openGraph: {
        title: "Linha do tempo | VR Abandonada",
        description: "Cronologia transversal do VR Abandonada.",
        type: "website",
        images: [getHomeOpenGraphImagePath()],
      },
      twitter: {
        card: "summary_large_image",
        title: "Linha do tempo | VR Abandonada",
        description: "Cronologia transversal do VR Abandonada.",
        images: [getHomeOpenGraphImagePath()],
      },
    };
  }

  const title = `${highlight.title} | Marco da linha do tempo`;
  const description = highlight.excerpt || highlight.lead_question || highlight.description || "Marco temporal curado do VR Abandonada.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [highlight.cover_image_url || getHomeOpenGraphImagePath()],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [highlight.cover_image_url || getHomeOpenGraphImagePath()],
    },
  };
}

export default async function TimelineHighlightPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const highlight = await getResolvedHighlight(resolved.slug);

  if (!highlight) {
    notFound();
  }

  const [links, allEntries] = await Promise.all([
    getPublishedTimelineHighlightLinks(highlight.id),
    getPublishedTimelineEntries(),
  ]);

  const [editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs, placeHubs, actorHubs, patterns, editions] = await Promise.all([
    getPublishedEditorialItems(),
    getPublishedMemoryItems(),
    getPublishedArchiveAssets(),
    getPublishedArchiveCollections(),
    getPublishedDossiers(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedThemeHubs(),
    getPublishedPlaceHubs(),
    getPublishedActorHubs(),
    getPublishedPatternReads(),
    getPublishedEditorialEditions(),
  ]);

  const dossierUpdates = await getPublishedDossierUpdatesByDossierIds(dossiers.map((item) => item.id));
  const resolvedLinks = resolveTimelineHighlightLinks(links, {
    editorialItems,
    memoryItems,
    archiveAssets,
    archiveCollections,
    dossiers,
    dossierUpdates: [...dossierUpdates.values()].flat(),
    campaigns,
    impacts,
    themeHubs,
    placeHubs,
    actorHubs,
    patterns,
    editions,
  });
  const relatedEntries = getTimelineRelatedEntries(
    {
      id: `marco:${highlight.slug}`,
      contentType: "marco",
      contentKey: highlight.slug,
      title: highlight.title,
      excerpt: highlight.excerpt,
      contentHref: getTimelineHighlightHref(highlight.slug),
      timelineHref: getTimelineHighlightHref(highlight.slug),
      kindLabel: `Marco · ${getTimelineHighlightTypeLabel(String(highlight.highlight_type))}`,
      labels: [String(highlight.highlight_type), highlight.period_label, highlight.date_label].filter(Boolean) as string[],
      territoryLabel: null,
      actorLabel: null,
      yearValue: highlight.year_start,
      yearLabel: highlight.date_label || (highlight.year_start ? String(highlight.year_start) : null),
      dateLabel: highlight.date_label,
      dateBasis: highlight.year_start ? "historical" : "editorial",
      periodKey: "sem_data",
      periodLabel: highlight.period_label || "Marco curado",
      featured: highlight.featured,
      sortDate: highlight.updated_at,
      sortOrder: highlight.sort_order,
      saveKind: "marco",
      followKind: "marco",
      sourceNote: highlight.lead_question,
    },
    allEntries,
  ).filter((entry) => entry.contentType !== "marco");

  const titleSentence = firstSentence(highlight.excerpt) || highlight.title;
  const timeline = buildTimelineHighlightTimeline(resolvedLinks);
  const leadLink = timeline.find((link) => link.link_role === "lead") ?? timeline[0] ?? null;

  return (
    <Container className="intro-grid timeline-highlight-page">
      <section className="hero hero--split timeline-highlight-hero">
        <div className="hero__copy">
          <p className="eyebrow">marco curado</p>
          <h1 className="hero__title">{highlight.title}</h1>
          <p className="hero__lead">{titleSentence}</p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{getTimelineHighlightStatusLabel(String(highlight.status))}</span>
            <span className="home-hero__signal">{getTimelineHighlightTypeLabel(String(highlight.highlight_type))}</span>
            <span className="home-hero__signal">{highlight.period_label || highlight.date_label || "Marco central"}</span>
          </div>
          <div className="hero__actions">
            <Link href="#peças" className="button">
              Ver peças do marco
            </Link>
            <Link href="/linha-do-tempo" className="button-secondary">
              Voltar à cronologia
            </Link>
            <Link href="/buscar" className="button-secondary">
              Buscar
            </Link>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
            <Link href="/acompanhar" className="button-secondary">
              Acompanhar
            </Link>
            <SaveReadButton kind="marco" keyValue={highlight.slug} title={highlight.title} summary={highlight.excerpt || highlight.title} href={getTimelineHighlightHref(highlight.slug)} compact />
            <FollowButton kind="marco" keyValue={highlight.slug} title={highlight.title} summary={highlight.excerpt || highlight.title} href={getTimelineHighlightHref(highlight.slug)} compact />
          </div>
        </div>

        <EditorialCover
          title={highlight.title}
          primaryTag={getTimelineHighlightStatusLabel(String(highlight.status))}
          seriesTitle={highlight.lead_question || highlight.period_label || highlight.title}
          coverImageUrl={highlight.cover_image_url || "/editorial/covers/arquivo-inicial.svg"}
          coverVariant={getTimelineHighlightHeroVariant(String(highlight.highlight_type))}
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que esse marco representa</p>
            <h2>Uma virada temporal que não cabe numa lista crua.</h2>
          </div>
          <p className="section__lead">
            {highlight.description || highlight.lead_question || highlight.excerpt || "Este marco condensa uma leitura temporal pública do VR Abandonada."}
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>{highlight.date_label || highlight.period_label || "Sem data forte"}</h3>
            <p>{highlight.period_label || "Marco central"}</p>
          </article>
          <article className="card">
            <h3>{getTimelineHighlightTypeLabel(String(highlight.highlight_type))}</h3>
            <p>{highlight.featured ? "Em destaque" : "Leitura editorial"}</p>
          </article>
          <article className="card">
            <h3>{getTimelineHighlightStatusLabel(String(highlight.status))}</h3>
            <p>{highlight.lead_question || "Pergunta pública de leitura."}</p>
          </article>
        </div>
      </section>

      {timeline.length ? (
        <section className="section" id="peças">
          <div className="grid-2">
            <div>
              <p className="eyebrow">peças que sustentam a leitura</p>
              <h2>O marco se apoia em documentos, casos e consequências.</h2>
            </div>
            <p className="section__lead">
              Quando o leitor entra por aqui, encontra a peça central, o contexto e o desdobramento, não apenas o título do marco.
            </p>
          </div>

          <div className="grid-2">
            {timeline.map((link) => (
              <TimelineHighlightLinkCard key={link.id} link={link} compact />
            ))}
          </div>
        </section>
      ) : null}

      {leadLink ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">peça central</p>
              <h2>{leadLink.title}</h2>
            </div>
            <p className="section__lead">A leitura do marco começa pela peça principal que amarra a virada temporal.</p>
          </div>

          <article className="support-box home-callout home-callout--accent">
            <p>{leadLink.excerpt || leadLink.timeline_note || "Sem resumo."}</p>
            <div className="stack-actions">
              <Link href={leadLink.href} className="button">
                Abrir peça central
              </Link>
              <Link href="/linha-do-tempo" className="button-secondary">
                Ver mais marcos
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      {relatedEntries.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">marcos próximos</p>
              <h2>Como esta virada conversa com outras frentes.</h2>
            </div>
            <p className="section__lead">A cronologia só ganha força quando devolve o leitor para o território, o ator, o impacto e o dossiê que seguem em curso.</p>
          </div>

          <div className="grid-2 timeline-grid">
            {relatedEntries.slice(0, 4).map((entry) => (
              <TimelineEntryCard key={entry.id} entry={entry} compact />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próximos caminhos</p>
            <h2>Retorne ao que continua em curso.</h2>
          </div>
          <p className="section__lead">Marcos centrais não encerram a leitura. Eles abrem novas rotas de acompanhamento.</p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>Salvar a leitura</h3>
            <p>Guarde este marco no dispositivo para voltar depois.</p>
            <SaveReadButton kind="marco" keyValue={highlight.slug} title={highlight.title} summary={highlight.excerpt || highlight.title} href={getTimelineHighlightHref(highlight.slug)} compact />
          </article>
          <article className="card">
            <h3>Acompanhar a frente</h3>
            <p>Siga as frentes relacionadas para continuar a leitura do tempo.</p>
            <FollowButton kind="marco" keyValue={highlight.slug} title={highlight.title} summary={highlight.excerpt || highlight.title} href={getTimelineHighlightHref(highlight.slug)} compact />
          </article>
          <article className="card">
            <h3>Voltar ao presente</h3>
            <p>O radar mostra onde a investigação está quente agora.</p>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </article>
        </div>
      </section>
    </Container>
  );
}
