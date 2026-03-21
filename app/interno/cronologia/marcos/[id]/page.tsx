import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { TimelineEntryCard } from "@/components/timeline-entry-card";
import { TimelineHighlightCard } from "@/components/timeline-highlight-card";
import { TimelineHighlightForm } from "@/components/timeline-highlight-form";
import { TimelineHighlightLinkCard } from "@/components/timeline-highlight-link-card";
import { TimelineHighlightLinkForm } from "@/components/timeline-highlight-link-form";
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
import { getPublishedTimelineEntries, getTimelineRelatedEntries } from "@/lib/timeline/queries";
import { getInternalTimelineHighlightById, getInternalTimelineHighlightLinks } from "@/lib/timeline/highlight-queries";
import { buildTimelineHighlightLinkOptions, buildTimelineHighlightTimeline, groupTimelineHighlightLinksByRole, resolveTimelineHighlightLinks, getTimelineHighlightContentLabels } from "@/lib/timeline/highlight-resolve";
import { getTimelinePeriodKey } from "@/lib/timeline/navigation";
import { getTimelineHighlightHref, getTimelineHighlightStatusLabel, getTimelineHighlightTypeLabel } from "@/lib/timeline/highlights";
import type { TimelineEntry } from "@/lib/timeline/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function firstSentence(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const index = trimmed.search(/[.!?]/);
  return index === -1 ? trimmed : trimmed.slice(0, index + 1);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const highlight = await getInternalTimelineHighlightById(id);

  if (!highlight) {
    return {
      title: "Marco interno",
      description: "Curadoria e operação dos marcos centrais do VR Abandonada.",
    };
  }

  return {
    title: `${highlight.title} | Marcos internos`,
    description: highlight.excerpt || highlight.description || "Curadoria e operação dos marcos centrais do VR Abandonada.",
  };
}

export default async function InternalTimelineHighlightPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const highlight = await getInternalTimelineHighlightById(id);
  if (!highlight) {
    notFound();
  }

  const [links, editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs, placeHubs, actorHubs, patterns, editions, entries] = await Promise.all([
    getInternalTimelineHighlightLinks(highlight.id),
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
    getPublishedTimelineEntries(),
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
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;
  const timeline = buildTimelineHighlightTimeline(resolvedLinks);
  const linksByRole = groupTimelineHighlightLinksByRole(resolvedLinks);
  const linkOptions = buildTimelineHighlightLinkOptions({
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
  const timelineEntry: TimelineEntry = {
    id: `marco:${highlight.slug}`,
    contentType: "marco" as const,
    contentKey: highlight.slug,
    title: highlight.title,
    excerpt: highlight.excerpt,
    contentHref: getTimelineHighlightHref(highlight.slug),
    timelineHref: getTimelineHighlightHref(highlight.slug),
    kindLabel: `Marco · ${getTimelineHighlightTypeLabel(String(highlight.highlight_type))}`,
    labels: getTimelineHighlightContentLabels(highlight),
    territoryLabel: null,
    actorLabel: null,
    yearValue: highlight.year_start,
    yearLabel: highlight.date_label || (highlight.year_start ? String(highlight.year_start) : null),
    dateLabel: highlight.date_label,
    dateBasis: highlight.year_start ? "historical" : "editorial",
    periodKey: getTimelinePeriodKey(highlight.year_start),
    periodLabel: highlight.period_label || "Marco curado",
    featured: highlight.featured,
    sortDate: highlight.updated_at,
    sortOrder: highlight.sort_order,
    saveKind: "marco",
    followKind: "marco",
    sourceNote: highlight.lead_question,
  };
  const relatedEntries = getTimelineRelatedEntries(timelineEntry, entries).filter((entry) => entry.contentType !== "marco").slice(0, 6);
  const titleSentence = firstSentence(highlight.excerpt) || highlight.title;
  const latestMovement = leadLink?.timeline_note || leadLink?.timeline_label || null;
  const highlightGroupCount = resolvedLinks.length;

  return (
    <Container className="intro-grid internal-page theme-hub-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">marco interno</p>
        <h1 className="hero__title">{highlight.title}</h1>
        <p className="hero__lead">{titleSentence}</p>
        <div className="hero__actions">`r`n          <Link href="/interno/cronologia/marcos" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={getTimelineHighlightHref(highlight.slug)} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3>{getTimelineHighlightStatusLabel(String(highlight.status))}</h3>
            <p>Estado público do marco.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">tipo</p>
            <h3>{getTimelineHighlightTypeLabel(String(highlight.highlight_type))}</h3>
            <p>Categoria principal da virada temporal.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{highlightGroupCount}</h3>
            <p>Peças ligadas ao marco.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Editar marco</h2>
          </div>
          <p className="section__lead">Mantenha a virada temporal curta, pública e reaproveitável para cruzar a história da cidade.</p>
        </div>

        <TimelineHighlightForm highlight={highlight} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por onde começar</p>
            <h2>Peça central</h2>
          </div>
          <p className="section__lead">Use a peça central para orientar a leitura pública antes de distribuir os vínculos.</p>
        </div>

        <div className="grid-2">
          <TimelineHighlightCard highlight={highlight} href={getTimelineHighlightHref(highlight.slug)} itemCount={highlightGroupCount} latestMovement={latestMovement} />
          <article className="support-box home-callout home-callout--accent">
            <p className="eyebrow">leitura</p>
            <h2>{getTimelineHighlightTypeLabel(String(highlight.highlight_type))}</h2>
            <p>{highlight.description || highlight.lead_question || highlight.excerpt}</p>
            <div className="stack-actions">
              <Link href={getTimelineHighlightHref(highlight.slug)} className="button-secondary">
                Ver público
              </Link>
              <Link href="/linha-do-tempo" className="button-secondary">
                Ver cronologia ampla
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">timeline</p>
            <h2>Ordem de leitura</h2>
          </div>
          <p className="section__lead">Reordene as peças com data, marco ou nota curta para deixar a hipótese mais clara.</p>
        </div>

        <div className="grid-2">
          {timeline.map((entry) => (
            <article className="card" key={entry.id}>
              <div className="meta-row">
                <span>{entry.roleLabel}</span>
                <span>{entry.typeLabel}</span>
                {entry.yearLabel ? <span>{entry.yearLabel}</span> : null}
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.excerpt || entry.timeline_note || "Sem resumo."}</p>
              <div className="stack-actions">
                <Link href={entry.href} className="button-secondary">
                  Abrir
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">vínculos</p>
            <h2>Peças relacionadas</h2>
          </div>
          <p className="section__lead">Vincule pauta, memória, acervo, campanha, impacto, território e outros atores sem perder o papel de cada peça.</p>
        </div>

        <TimelineHighlightLinkForm highlightId={highlight.id} highlightSlug={highlight.slug} options={linkOptions} existingLinksCount={resolvedLinks.length} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista de vínculos</p>
            <h2>Peças já associadas</h2>
          </div>
          <p className="section__lead">A leitura por função ajuda a distinguir contexto, evidência, desdobramento e base documental.</p>
        </div>

        <div className="grid-2">
          {Object.entries(linksByRole).map(([role, roleLinks]) =>
            roleLinks?.length ? (
              <article className="support-box" key={role}>
                <p className="eyebrow">{role}</p>
                <div className="stack-cards">
                  {roleLinks.map((link) => (
                    <TimelineHighlightLinkCard key={link.id} link={link} compact removable highlightId={highlight.id} />
                  ))}
                </div>
              </article>
            ) : null,
          )}
        </div>
      </section>

      {relatedEntries.length ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <div>
              <p className="eyebrow">marcos próximos</p>
              <h2>Marcos relacionados para continuar a leitura.</h2>
            </div>
            <p className="section__lead">A hipótese ganha força quando devolve o leitor a outro tempo, outro território ou outro responsável.</p>
          </div>

          <div className="grid-2 timeline-grid">
            {relatedEntries.map((entry) => (
              <TimelineEntryCard key={entry.id} entry={entry} compact />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}


