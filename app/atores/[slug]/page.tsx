import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { FollowButton } from "@/components/follow-button";
import { ActorHubLinkCard } from "@/components/actor-hub-link-card";
import { ActorHubPrimaryPiece } from "@/components/actor-hub-primary-piece";
import { ActorHubTimeline } from "@/components/actor-hub-timeline";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPublishedActorHubBySlug, getPublishedActorHubLinks, getPublishedActorHubs } from "@/lib/actors/queries";
import { buildActorHubTimeline, groupActorHubLinksByType, resolveActorHubLinks } from "@/lib/actors/resolve";
import { getActorHubActorTypeLabel, getActorHubStatusLabel, getActorHubStatusTone } from "@/lib/actors/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const actorHub = await getPublishedActorHubBySlug(slug);

  if (!actorHub) {
    return {
      title: "Atores",
      description: "Mapa editorial de empresas, órgãos e instituições recorrentes nos conflitos de Volta Redonda.",
    };
  }

  return {
    title: `${actorHub.title} | Atores`,
    description: actorHub.excerpt || actorHub.description || "Mapa editorial de atores recorrentes nos conflitos de Volta Redonda.",
    openGraph: {
      title: `${actorHub.title} | VR Abandonada`,
      description: actorHub.excerpt || actorHub.description || "Mapa editorial de atores recorrentes nos conflitos de Volta Redonda.",
      type: "website",
      images: [getHomeOpenGraphImagePath()],
    },
    twitter: {
      card: "summary_large_image",
      title: `${actorHub.title} | VR Abandonada`,
      description: actorHub.excerpt || actorHub.description || "Mapa editorial de atores recorrentes nos conflitos de Volta Redonda.",
      images: [getHomeOpenGraphImagePath()],
    },
  };
}

export default async function ActorHubPage({ params }: PageProps) {
  const { slug } = await params;
  const actorHub = await getPublishedActorHubBySlug(slug);

  if (!actorHub) {
    notFound();
  }

  const links = await getPublishedActorHubLinks(actorHub.id);
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const dossiers = await getPublishedDossiers();
  const campaigns = await getPublishedCampaigns();
  const impacts = await getPublishedImpacts();
  const themeHubs = await getPublishedThemeHubs();
  const placeHubs = await getPublishedPlaceHubs();
  const actorHubs = await getPublishedActorHubs();

  const resolvedLinks = resolveActorHubLinks(links, {
    editorialItems,
    memoryItems,
    archiveAssets,
    archiveCollections,
    dossiers,
    campaigns,
    impacts,
    themeHubs,
    placeHubs,
    actorHubs,
  });
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;
  const linksByType = groupActorHubLinksByType(resolvedLinks);
  const timeline = buildActorHubTimeline(resolvedLinks);

  const typeSections = [
    { type: "editorial", title: "Pautas" },
    { type: "dossier", title: "Dossiês" },
    { type: "memory", title: "Memória" },
    { type: "archive", title: "Acervo" },
    { type: "campaign", title: "Campanhas" },
    { type: "impact", title: "Impactos" },
    { type: "territory", title: "Territórios" },
    { type: "hub", title: "Eixos" },
    { type: "actor", title: "Outros atores" },
    { type: "collection", title: "Coleções" },
    { type: "page", title: "Páginas" },
    { type: "external", title: "Externos" },
  ] as const;

  return (
    <Container className="intro-grid actors-page">
      <section className="hero hero--split territories-hero">
        <div className="hero__copy">
          <p className="eyebrow">ator recorrente</p>
          <h1 className="hero__title">{actorHub.title}</h1>
          <p className="hero__lead">{actorHub.lead_question || actorHub.excerpt || actorHub.description}</p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{getActorHubStatusLabel(actorHub.status)}</span>
            <span className="home-hero__signal">{getActorHubActorTypeLabel(actorHub.actor_type)}</span>
            <span className="home-hero__signal">{actorHub.territory_label || "território recorrente"}</span>
          </div>
          <div className="hero__actions">
            <Link href="#por-onde-comecar" className="button">
              Por onde começar
            </Link>
            <Link href="#atores-ativos" className="button-secondary">
              Ver vínculos
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">estado público</p>
          <h2 className={getActorHubStatusTone(actorHub.status)}>{getActorHubStatusLabel(actorHub.status)}</h2>
          <p>{actorHub.description}</p>
          <div className="stack-actions">
            <Link href="/territorios" className="button-secondary">
              Ver territórios
            </Link>
            <Link href="/impacto" className="button-secondary">
              Ver impactos
            </Link>
            <FollowButton kind="actor" keyValue={actorHub.slug} title={actorHub.title} summary={actorHub.excerpt || actorHub.description || actorHub.title} href={`/atores/${actorHub.slug}`} compact />
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que está em jogo</p>
            <h2>Responsabilidade, recorrência e endereço público.</h2>
          </div>
          <p className="section__lead">
            O ator não aparece como ficha burocrática. Ele organiza a leitura de quem atravessa o caso e de onde a responsabilidade volta a aparecer.
          </p>
        </div>

        <div className="grid-2">
          <article className="card">
            <h3>{resolvedLinks.length}</h3>
            <p>Peças relacionadas à recorrência do ator.</p>
          </article>
          <article className="card">
            <h3>{linksByType["territory"]?.length ?? 0}</h3>
            <p>Territórios ligados ao mapa de responsabilidade.</p>
          </article>
          <article className="card">
            <h3>{linksByType["campaign"]?.length ?? 0}</h3>
            <p>Chamados públicos conectados ao ator.</p>
          </article>
          <article className="card">
            <h3>{linksByType["impact"]?.length ?? 0}</h3>
            <p>Consequências públicas observadas até aqui.</p>
          </article>
        </div>
      </section>

      <section className="section" id="por-onde-comecar">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por onde começar</p>
            <h2>Peça central do ator.</h2>
          </div>
          <p className="section__lead">A peça de entrada ajuda a começar pelo vínculo mais forte e seguir para contexto, evidência e desdobramento.</p>
        </div>

        <ActorHubPrimaryPiece actorHub={actorHub} leadLink={leadLink} />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">linha do ator</p>
            <h2>Uma sequência pública para acompanhar recorrência e consequência.</h2>
          </div>
          <p className="section__lead">A timeline ajuda a ler quando o ator reaparece e como ele atravessa pauta, memória, acervo, campanha, impacto e território.</p>
        </div>

        <ActorHubTimeline entries={timeline} />
      </section>

      <section className="section" id="atores-ativos">
        <div className="grid-2">
          <div>
            <p className="eyebrow">peças por tipo</p>
            <h2>Os vínculos que dão forma ao caso.</h2>
          </div>
          <p className="section__lead">Os blocos abaixo ajudam a distinguir pauta, memória, acervo, território, campanha e impacto sem perder o fio público.</p>
        </div>

        <div className="grid-2">
          {typeSections.map((section) => {
            const linksForSection = linksByType[section.type];

            if (!linksForSection?.length) {
              return null;
            }

            return (
              <article className="support-box" key={section.type}>
                <p className="eyebrow">{section.title}</p>
                <div className="stack-cards">
                  {linksForSection.map((link) => (
                    <ActorHubLinkCard key={link.id} link={link} compact />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">seguir adiante</p>
            <h2>O ator também aponta para território, participação e consequência.</h2>
          </div>
          <p className="section__lead">A navegação continua em pauta, memória, acervo, campanha, impacto e lugares associados sem perder a pergunta central.</p>
        </div>

        <div className="stack-actions">
          <Link href="/atores" className="button-secondary">
            Voltar ao mapa de atores
          </Link>
          <Link href="/territorios" className="button-secondary">
            Ver territórios
          </Link>
          <Link href="/campanhas" className="button-secondary">
            Ver campanhas
          </Link>
          <Link href="/participe" className="button-secondary">
            Participar
          </Link>
        </div>
      </section>
    </Container>
  );
}







