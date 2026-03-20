import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { SharePanel } from "@/components/share-panel";
import { PatternReadLinkCard } from "@/components/pattern-read-link-card";
import { PatternReadPrimaryPiece } from "@/components/pattern-read-primary-piece";
import { PatternReadTimeline } from "@/components/pattern-read-timeline";
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
import { getPublishedActorHubs } from "@/lib/actors/queries";
import { getPublishedPatternReadBySlug, getPublishedPatternReadLinks } from "@/lib/patterns/queries";
import { buildPatternReadTimeline, groupPatternReadLinksByType, resolvePatternReadLinks } from "@/lib/patterns/resolve";
import { getPatternReadStatusLabel, getPatternReadStatusTone, getPatternReadTypeLabel } from "@/lib/patterns/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const patternRead = await getPublishedPatternReadBySlug(slug);

  if (!patternRead) {
    return {
      title: "Padrões",
      description: "Leituras estruturais do VR Abandonada: recorrências entre atores, territórios, impactos e casos.",
    };
  }

  return {
    title: `${patternRead.title} | Padrões`,
    description: patternRead.excerpt || patternRead.description || "Leitura estrutural do VR Abandonada.",
    openGraph: {
      title: `${patternRead.title} | VR Abandonada`,
      description: patternRead.excerpt || patternRead.description || "Leitura estrutural do VR Abandonada.",
      type: "website",
      images: [getHomeOpenGraphImagePath()],
    },
    twitter: {
      card: "summary_large_image",
      title: `${patternRead.title} | VR Abandonada`,
      description: patternRead.excerpt || patternRead.description || "Leitura estrutural do VR Abandonada.",
      images: [getHomeOpenGraphImagePath()],
    },
  };
}

export default async function PatternReadPage({ params }: PageProps) {
  const { slug } = await params;
  const patternRead = await getPublishedPatternReadBySlug(slug);

  if (!patternRead) {
    notFound();
  }

  const links = await getPublishedPatternReadLinks(patternRead.id);
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

  const resolvedLinks = resolvePatternReadLinks(links, {
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
  const latestMovement = resolvedLinks[0]?.timeline_note || resolvedLinks[0]?.excerpt || null;
  const linksByType = groupPatternReadLinksByType(resolvedLinks);
  const timeline = buildPatternReadTimeline(resolvedLinks);

  const typeSections = [
    { type: "actor", title: "Atores recorrentes" },
    { type: "territory", title: "Territórios recorrentes" },
    { type: "impact", title: "Impactos" },
    { type: "campaign", title: "Campanhas" },
    { type: "dossier", title: "Dossiês" },
    { type: "editorial", title: "Pautas" },
    { type: "memory", title: "Memória" },
    { type: "archive", title: "Acervo" },
    { type: "collection", title: "Coleções" },
    { type: "hub", title: "Eixos" },
    { type: "page", title: "Páginas" },
    { type: "external", title: "Externos" },
  ] as const;

  return (
    <Container className="intro-grid actors-page">
      <section className="hero hero--split territories-hero">
        <div className="hero__copy">
          <p className="eyebrow">padrão estrutural</p>
          <h1 className="hero__title">{patternRead.title}</h1>
          <p className="hero__lead">{patternRead.lead_question || patternRead.excerpt || patternRead.description}</p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{getPatternReadStatusLabel(patternRead.status)}</span>
            <span className="home-hero__signal">{getPatternReadTypeLabel(patternRead.pattern_type)}</span>
            <span className="home-hero__signal">leitura pública</span>
          </div>
          <div className="hero__actions">
            <Link href="#padrao-vivo" className="button">
              Ver leitura estrutural
            </Link>
            <Link href="#padroes-ativos" className="button-secondary">
              Ver vínculos
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">estado público</p>
          <h2 className={getPatternReadStatusTone(patternRead.status)}>{getPatternReadStatusLabel(patternRead.status)}</h2>
          <p>{patternRead.description}</p>
          {latestMovement ? (
            <article className="support-box">
              <p className="eyebrow">última movimentação</p>
              <p>{latestMovement}</p>
            </article>
          ) : null}
          <div className="stack-actions">
            <Link href="/atores" className="button-secondary">
              Ver atores
            </Link>
            <Link href="/territorios" className="button-secondary">
              Ver territórios
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">compartilhar</p>
            <h2>O padrão também pode circular como leitura estrutural.</h2>
          </div>
          <p className="section__lead">Compartilhe a hipótese sem perder o caminho para as peças que sustentam a recorrência.</p>
        </div>

        <SharePanel
          title={patternRead.title}
          summary={patternRead.lead_question || patternRead.excerpt || patternRead.description || patternRead.title}
          caption={`Leia e compartilhe: ${patternRead.title}. ${patternRead.lead_question || patternRead.excerpt || patternRead.description || ""}`.trim()}
          shareHref={`/compartilhar/padrao/${patternRead.slug}`}
          contentHref={`/padroes/${patternRead.slug}`}
          titleLabel="compartilhe este padrão"
        />
      </section>

      <section className="section" id="padrao-vivo">
        <div className="grid-2">
          <div>
            <p className="eyebrow">hipótese estrutural</p>
            <h2>Não é uma lista de casos. É uma pergunta sobre repetição.</h2>
          </div>
          <p className="section__lead">
            O padrão mostra como um mesmo conflito aparece em atores, territórios, impacto e arquivo. Ele ajuda a ler a cidade como sistema e não como soma de episódios.
          </p>
        </div>

        <div className="grid-2">
          <article className="card">
            <h3>{resolvedLinks.length}</h3>
            <p>Peças relacionadas à mesma recorrência.</p>
          </article>
          <article className="card">
            <h3>{linksByType["actor"]?.length ?? 0}</h3>
            <p>Atores recorrentes ligados ao padrão.</p>
          </article>
          <article className="card">
            <h3>{linksByType["territory"]?.length ?? 0}</h3>
            <p>Territórios onde a repetição aparece.</p>
          </article>
          <article className="card">
            <h3>{linksByType["impact"]?.length ?? 0}</h3>
            <p>Impactos observados a partir da recorrência.</p>
          </article>
        </div>
      </section>

      <section className="section" id="por-onde-comecar">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por onde começar</p>
            <h2>Peça central do padrão.</h2>
          </div>
          <p className="section__lead">A peça de entrada ajuda a começar pela hipótese mais forte e seguir para evidência, contexto e desdobramento.</p>
        </div>

        <PatternReadPrimaryPiece patternRead={patternRead} leadLink={leadLink} />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">linha do padrão</p>
            <h2>Uma sequência pública para acompanhar a recorrência.</h2>
          </div>
          <p className="section__lead">A timeline ajuda a ler como a estrutura reaparece ao longo do tempo e como ela atravessa pauta, memória, acervo e consequência.</p>
        </div>

        <div className="grid-2">
          {timeline.map((entry) => (
            <PatternReadTimeline key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="section" id="padroes-ativos">
        <div className="grid-2">
          <div>
            <p className="eyebrow">peças por tipo</p>
            <h2>Os vínculos que sustentam a leitura.</h2>
          </div>
          <p className="section__lead">Os blocos abaixo ajudam a distinguir ator, território, impacto, campanha, dossiê, memória e arquivo sem perder o fio público.</p>
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
                    <PatternReadLinkCard key={link.id} link={link} compact />
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
            <p className="eyebrow">o que esse padrão revela</p>
            <h2>O que se repete nunca é neutro.</h2>
          </div>
          <p className="section__lead">
            Quando o mesmo ator, território ou consequência volta, o padrão revela uma estrutura pública que insiste e precisa ser lida em conjunto.
          </p>
        </div>

        <div className="grid-2">
          <article className="card">
            <h3>O que revela</h3>
            <p>
              O padrão mostra relações de poder, desgaste, permanência e ausência de resposta que aparecem em diferentes peças do arquivo.
            </p>
          </article>
          <article className="card">
            <h3>O que continua em aberto</h3>
            <p>
              A recorrência não fecha o caso; ela aponta a continuidade da investigação, da denúncia e do acompanhamento público.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">seguir adiante</p>
            <h2>A leitura estrutural continua em atores, territórios e impacto.</h2>
          </div>
          <p className="section__lead">O padrão não encerra nada. Ele convida a abrir as camadas que sustentam a repetição.</p>
        </div>

        <div className="stack-actions">
          <Link href="/atores" className="button-secondary">
            Abrir atores
          </Link>
          <Link href="/territorios" className="button-secondary">
            Abrir territórios
          </Link>
          <Link href="/impacto" className="button-secondary">
            Ver impacto
          </Link>
          <Link href="/dossies" className="button-secondary">
            Ver dossiês
          </Link>
          <Link href="/campanhas" className="button-secondary">
            Ver campanhas
          </Link>
        </div>
      </section>
    </Container>
  );
}





