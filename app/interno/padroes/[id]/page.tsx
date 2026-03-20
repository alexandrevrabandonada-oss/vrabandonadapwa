import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { PatternReadForm } from "@/components/pattern-read-form";
import { PatternReadLinkForm } from "@/components/pattern-read-link-form";
import { PatternReadLinkCard } from "@/components/pattern-read-link-card";
import { PatternReadPrimaryPiece } from "@/components/pattern-read-primary-piece";
import { PatternReadTimeline } from "@/components/pattern-read-timeline";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPublishedActorHubs } from "@/lib/actors/queries";
import { getInternalPatternReadById, getInternalPatternReadLinks } from "@/lib/patterns/queries";
import { buildPatternReadLinkOptions, buildPatternReadTimeline, groupPatternReadLinksByRole, resolvePatternReadLinks } from "@/lib/patterns/resolve";
import { getPatternReadLinkRoleLabel, getPatternReadStatusLabel, getPatternReadStatusTone, getPatternReadTypeLabel } from "@/lib/patterns/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const patternRead = await getInternalPatternReadById(id);

  if (!patternRead) {
    return {
      title: "Padrão interno",
      description: "Curadoria e operação das leituras estruturais do VR Abandonada.",
    };
  }

  return {
    title: `${patternRead.title} | Padrões internos`,
    description: patternRead.excerpt || patternRead.description || "Curadoria e operação das leituras estruturais do VR Abandonada.",
  };
}

export default async function InternalPatternPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const patternRead = await getInternalPatternReadById(id);
  if (!patternRead) {
    notFound();
  }

  const [links, editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs, placeHubs, actorHubs] = await Promise.all([
    getInternalPatternReadLinks(patternRead.id),
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
  ]);

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
  const timeline = buildPatternReadTimeline(resolvedLinks);
  const linksByRole = groupPatternReadLinksByRole(resolvedLinks);
  const linkOptions = buildPatternReadLinkOptions({
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

  return (
    <Container className="intro-grid internal-page theme-hub-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">padrão interno</p>
        <h1 className="hero__title">{patternRead.title}</h1>
        <p className="hero__lead">{patternRead.lead_question || patternRead.excerpt || patternRead.description}</p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/padroes" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/padroes/${patternRead.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3 className={getPatternReadStatusTone(patternRead.status)}>{getPatternReadStatusLabel(patternRead.status)}</h3>
            <p>Estado público do padrão.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">tipo</p>
            <h3>{getPatternReadTypeLabel(patternRead.pattern_type)}</h3>
            <p>Categoria principal.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{resolvedLinks.length}</h3>
            <p>Peças ligadas ao padrão.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Editar padrão</h2>
          </div>
          <p className="section__lead">Mantenha a hipótese curta, pública e reaproveitável para cruzar recorrências no site.</p>
        </div>

        <PatternReadForm patternRead={patternRead} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por onde começar</p>
            <h2>Peça central</h2>
          </div>
          <p className="section__lead">Use a peça central para orientar a leitura pública antes de distribuir os vínculos.</p>
        </div>

        <PatternReadPrimaryPiece patternRead={patternRead} leadLink={leadLink} />
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
            <PatternReadTimeline key={entry.id} entry={entry} compact />
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

        <PatternReadLinkForm patternReadId={patternRead.id} patternReadSlug={patternRead.slug} options={linkOptions} existingLinksCount={resolvedLinks.length} />
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
                <p className="eyebrow">{getPatternReadLinkRoleLabel(role)}</p>
                <div className="stack-cards">
                  {roleLinks.map((link) => (
                    <PatternReadLinkCard key={link.id} link={link} compact removable patternReadId={patternRead.id} />
                  ))}
                </div>
              </article>
            ) : null,
          )}
        </div>
      </section>
    </Container>
  );
}

