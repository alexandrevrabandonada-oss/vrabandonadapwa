import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { FollowButton } from "@/components/follow-button";
import { FollowedWatchlistClient } from "@/components/followed-watchlist-client";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getRadarPageData } from "@/lib/radar/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPublishedActorHubs } from "@/lib/actors/queries";
import { getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getThemeHubStatusLabel } from "@/lib/hubs/navigation";
import { getPlaceHubPlaceTypeLabel, getPlaceHubStatusLabel } from "@/lib/territories/navigation";
import { getActorHubActorTypeLabel, getActorHubStatusLabel } from "@/lib/actors/navigation";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import { getEditionStatusLabel, getEditionTypeLabel } from "@/lib/editions/navigation";
import { getPatternReadStatusLabel, getPatternReadTypeLabel } from "@/lib/patterns/navigation";
import { getImpactStatusLabel, getImpactTypeLabel } from "@/lib/impact/navigation";
import { getDossierUpdatePreviewText, sortDossierUpdates } from "@/lib/dossiers/updates";

export const metadata: Metadata = {
  title: "Acompanhar",
  description: "Seu painel local de frentes seguidas no VR Abandonada.",
  openGraph: {
    title: "Acompanhar | VR Abandonada",
    description: "Seu painel local de frentes seguidas no VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acompanhar | VR Abandonada",
    description: "Seu painel local de frentes seguidas no VR Abandonada.",
    images: [getHomeOpenGraphImagePath()],
  },
};

type FollowSnapshot = {
  kind: string;
  key: string;
  title: string;
  summary: string;
  href: string;
  label: string;
  statusLabel: string;
  movementLabel: string;
  movementSummary: string | null;
  movementHref: string | null;
  updatedAtLabel: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildSnapshot(args: {
  kind: string;
  key: string;
  title: string;
  summary: string;
  href: string;
  label: string;
  statusLabel: string;
  movementLabel: string;
  movementSummary: string | null;
  movementHref: string | null;
  updatedAt: string | null | undefined;
}): FollowSnapshot {
  return {
    ...args,
    updatedAtLabel: formatDate(args.updatedAt),
  };
}

export default async function AcompanharPage() {
  const [radar, hubs, territories, actors, dossiers, campaigns, editions, patterns, impacts] = await Promise.all([
    getRadarPageData(),
    getPublishedThemeHubs(),
    getPublishedPlaceHubs(),
    getPublishedActorHubs(),
    getPublishedDossiers(),
    getPublishedCampaigns(),
    getPublishedEditorialEditions(),
    getPublishedPatternReads(),
    getPublishedImpacts(),
  ]);

  const dossierIds = dossiers.map((dossier) => dossier.id);
  const updatesByDossierId = await getPublishedDossierUpdatesByDossierIds(dossierIds);

  const snapshots: FollowSnapshot[] = [
    ...hubs.slice(0, 4).map((hub) =>
      buildSnapshot({
        kind: "hub",
        key: hub.slug,
        title: hub.title,
        summary: hub.excerpt || hub.description || "Eixo temático do VR Abandonada.",
        href: `/eixos/${hub.slug}`,
        label: "Eixo",
        statusLabel: getThemeHubStatusLabel(hub.status),
        movementLabel: "Leitura do eixo",
        movementSummary: hub.lead_question || hub.description || hub.excerpt || null,
        movementHref: `/eixos/${hub.slug}`,
        updatedAt: hub.updated_at,
      }),
    ),
    ...territories.slice(0, 4).map((place) =>
      buildSnapshot({
        kind: "territory",
        key: place.slug,
        title: place.title,
        summary: place.excerpt || place.description || "Território público do VR Abandonada.",
        href: `/territorios/${place.slug}`,
        label: "Território",
        statusLabel: `${getPlaceHubStatusLabel(place.status)} • ${getPlaceHubPlaceTypeLabel(place.place_type)}`,
        movementLabel: "Leitura do lugar",
        movementSummary: place.lead_question || place.description || place.excerpt || null,
        movementHref: `/territorios/${place.slug}`,
        updatedAt: place.updated_at,
      }),
    ),
    ...actors.slice(0, 4).map((actor) =>
      buildSnapshot({
        kind: "actor",
        key: actor.slug,
        title: actor.title,
        summary: actor.excerpt || actor.description || "Ator recorrente nos conflitos da cidade.",
        href: `/atores/${actor.slug}`,
        label: "Ator",
        statusLabel: `${getActorHubStatusLabel(actor.status)} • ${getActorHubActorTypeLabel(actor.actor_type)}`,
        movementLabel: "Leitura da responsabilidade",
        movementSummary: actor.lead_question || actor.description || actor.excerpt || null,
        movementHref: `/atores/${actor.slug}`,
        updatedAt: actor.updated_at,
      }),
    ),
    ...dossiers.slice(0, 4).map((dossier) => {
      const latestUpdate = sortDossierUpdates(updatesByDossierId.get(dossier.id) ?? [])[0] ?? null;

      return buildSnapshot({
        kind: "dossier",
        key: dossier.slug,
        title: dossier.title,
        summary: dossier.excerpt || dossier.description || "Dossiê vivo do VR Abandonada.",
        href: `/dossies/${dossier.slug}`,
        label: "Dossiê",
        statusLabel: getDossierStatusLabel(dossier.status),
        movementLabel: latestUpdate ? "Última atualização" : "Linha em curso",
        movementSummary: latestUpdate ? getDossierUpdatePreviewText(latestUpdate) : dossier.lead_question || dossier.description || dossier.excerpt || null,
        movementHref: `/dossies/${dossier.slug}`,
        updatedAt: latestUpdate?.published_at || dossier.updated_at,
      });
    }),
    ...campaigns.slice(0, 4).map((campaign) =>
      buildSnapshot({
        kind: "campaign",
        key: campaign.slug,
        title: campaign.title,
        summary: campaign.excerpt || campaign.description || "Campanha pública do VR Abandonada.",
        href: `/campanhas/${campaign.slug}`,
        label: "Campanha",
        statusLabel: `${getCampaignStatusLabel(campaign.status)} • ${getCampaignTypeLabel(campaign.campaign_type)}`,
        movementLabel: "Estado da campanha",
        movementSummary: campaign.lead_question || campaign.excerpt || campaign.description || null,
        movementHref: `/campanhas/${campaign.slug}`,
        updatedAt: campaign.updated_at || campaign.start_date,
      }),
    ),
    ...editions.slice(0, 3).map((edition) =>
      buildSnapshot({
        kind: "edition",
        key: edition.slug,
        title: edition.title,
        summary: edition.excerpt || edition.description || "Edição pública do VR Abandonada.",
        href: `/edicoes/${edition.slug}`,
        label: "Edição",
        statusLabel: `${getEditionStatusLabel(edition.status)} • ${getEditionTypeLabel(edition.edition_type)}`,
        movementLabel: "Síntese editorial",
        movementSummary: edition.period_label || edition.excerpt || edition.description || null,
        movementHref: `/edicoes/${edition.slug}`,
        updatedAt: edition.published_at || edition.updated_at,
      }),
    ),
    ...patterns.slice(0, 3).map((pattern) =>
      buildSnapshot({
        kind: "pattern",
        key: pattern.slug,
        title: pattern.title,
        summary: pattern.excerpt || pattern.description || "Leitura estrutural do projeto.",
        href: `/padroes/${pattern.slug}`,
        label: "Padrão",
        statusLabel: `${getPatternReadStatusLabel(pattern.status)} • ${getPatternReadTypeLabel(pattern.pattern_type)}`,
        movementLabel: "Leitura estrutural",
        movementSummary: pattern.lead_question || pattern.description || pattern.excerpt || null,
        movementHref: `/padroes/${pattern.slug}`,
        updatedAt: pattern.updated_at,
      }),
    ),
    ...impacts.slice(0, 3).map((impact) =>
      buildSnapshot({
        kind: "impact",
        key: impact.slug,
        title: impact.title,
        summary: impact.excerpt || impact.description || "Consequência pública do projeto.",
        href: `/impacto/${impact.slug}`,
        label: "Impacto",
        statusLabel: `${getImpactStatusLabel(impact.status)} • ${getImpactTypeLabel(impact.impact_type)}`,
        movementLabel: "Consequência pública",
        movementSummary: impact.lead_question || impact.excerpt || impact.description || null,
        movementHref: `/impacto/${impact.slug}`,
        updatedAt: impact.happened_at || impact.updated_at,
      }),
    ),
  ];

  const radarSignals = [radar.spotlight, radar.sections.what_changed[0], radar.sections.impact[0], radar.sections.in_course[0]].filter((item): item is NonNullable<typeof item> => Boolean(item));
  const radarSnapshots = radarSignals.map((item) => ({
    title: item.title,
    summary: item.excerpt || "Pulso editorial do momento.",
    href: item.href,
    label: item.primaryLabel,
    dateLabel: item.dateLabel,
  }));

  return (
    <Container className="intro-grid follow-page">
      <section className="hero hero--split follow-hero">
        <div className="hero__copy">
          <p className="eyebrow">acompanhar</p>
          <h1 className="hero__title">O que você quer ver voltar?</h1>
          <p className="hero__lead">
            O app guarda suas frentes seguidas neste aparelho e traz de volta o que continua em curso. Sem login, sem nuvem e sem feed caótico.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">eixos</span>
            <span className="home-hero__signal">territórios</span>
            <span className="home-hero__signal">dossiês</span>
          </div>
          <div className="hero__actions">
            <Link href="#frentes-seguidas" className="button">
              Ver minhas frentes
            </Link>
            <Link href="/salvos" className="button-secondary">
              Abrir salvos
            </Link>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">como funciona</p>
          <h2>Seguir é diferente de salvar.</h2>
          <p>
            Salvar guarda uma leitura específica. Seguir mantém uma frente viva na sua tela local para que o retorno ao site tenha forma e continuidade.
          </p>
          <div className="stack-actions">
            <Link href="/salvos" className="button-secondary">
              Ir para salvos
            </Link>
            <Link href="/metodo" className="button-secondary">
              Ler o método
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">radar e retorno</p>
            <h2>O que está quente agora.</h2>
          </div>
          <p className="section__lead">
            O radar continua sendo o pulso editorial. Acompanhar organiza o que você escolheu seguir para que a volta ao site venha com direção.
          </p>
        </div>

        <div className="grid-3">
          {radarSnapshots.map((item) => (
            <article className="card" key={item.href}>
              <span className="pill">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <p className="saved-read-card__meta">{item.dateLabel || "pulso atual"}</p>
              <Link href={item.href} className="button-secondary">
                Abrir
              </Link>
            </article>
          ))}
        </div>
      </section>

      <FollowedWatchlistClient snapshots={snapshots} />

      <section className="section follow-suggestions-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">sugestões para começar</p>
            <h2>Escolha algumas frentes para o app trazer de volta.</h2>
          </div>
          <p className="section__lead">
            Acompanhar começa com poucos gestos. Você pode seguir um eixo, um território, um dossiê, uma campanha ou um ator e deixar o celular fazer o resto.
          </p>
        </div>

        <div className="grid-3">
          {[
            ...hubs.slice(0, 1).map((hub) => ({ kind: "hub", key: hub.slug, title: hub.title, summary: hub.excerpt || hub.description || "", href: `/eixos/${hub.slug}`, label: "Eixo" })),
            ...territories.slice(0, 1).map((place) => ({ kind: "territory", key: place.slug, title: place.title, summary: place.excerpt || place.description || "", href: `/territorios/${place.slug}`, label: "Território" })),
            ...dossiers.slice(0, 1).map((dossier) => ({ kind: "dossier", key: dossier.slug, title: dossier.title, summary: dossier.excerpt || dossier.description || "", href: `/dossies/${dossier.slug}`, label: "Dossiê" })),
            ...campaigns.slice(0, 1).map((campaign) => ({ kind: "campaign", key: campaign.slug, title: campaign.title, summary: campaign.excerpt || campaign.description || "", href: `/campanhas/${campaign.slug}`, label: "Campanha" })),
          ].map((item) => (
            <article className="card" key={`${item.kind}:${item.key}`}>
              <span className="pill">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="stack-actions">
                <Link href={item.href} className="button-secondary">
                  Abrir
                </Link>
                <FollowButton kind={item.kind} keyValue={item.key} title={item.title} summary={item.summary} href={item.href} compact />
              </div>
            </article>
          ))}
        </div>
      </section>
    </Container>
  );
}

