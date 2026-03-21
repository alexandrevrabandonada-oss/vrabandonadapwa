import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { ActorHubForm } from "@/components/actor-hub-form";
import { ActorHubLinkForm } from "@/components/actor-hub-link-form";
import { ActorHubLinkCard } from "@/components/actor-hub-link-card";
import { ActorHubPrimaryPiece } from "@/components/actor-hub-primary-piece";
import { ActorHubTimeline } from "@/components/actor-hub-timeline";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPublishedActorHubs, getInternalActorHubById, getInternalActorHubLinks } from "@/lib/actors/queries";
import { buildActorHubLinkOptions, buildActorHubTimeline, groupActorHubLinksByRole, resolveActorHubLinks } from "@/lib/actors/resolve";
import { getActorHubActorTypeLabel, getActorHubLinkRoleLabel, getActorHubStatusLabel, getActorHubStatusTone } from "@/lib/actors/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const actorHub = await getInternalActorHubById(id);

  if (!actorHub) {
    return {
      title: "Ator interno",
      description: "Curadoria e operação dos atores recorrentes do VR Abandonada.",
    };
  }

  return {
    title: `${actorHub.title} | Atores internos`,
    description: actorHub.excerpt || actorHub.description || "Curadoria e operação dos atores recorrentes do VR Abandonada.",
  };
}

export default async function InternalActorPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const actorHub = await getInternalActorHubById(id);
  if (!actorHub) {
    notFound();
  }

  const [links, editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs, placeHubs, actorHubs] = await Promise.all([
    getInternalActorHubLinks(actorHub.id),
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
  const timeline = buildActorHubTimeline(resolvedLinks);
  const linksByRole = groupActorHubLinksByRole(resolvedLinks);
  const linkOptions = buildActorHubLinkOptions({
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
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">ator interno</p>
        <h1 className="hero__title">{actorHub.title}</h1>
        <p className="hero__lead">{actorHub.lead_question || actorHub.excerpt || actorHub.description}</p>
        <div className="hero__actions">`r`n          <Link href="/interno/atores" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/atores/${actorHub.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3 className={getActorHubStatusTone(actorHub.status)}>{getActorHubStatusLabel(actorHub.status)}</h3>
            <p>Estado público do ator.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">tipo</p>
            <h3>{getActorHubActorTypeLabel(actorHub.actor_type)}</h3>
            <p>Categoria principal.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{resolvedLinks.length}</h3>
            <p>Peças ligadas ao ator.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Editar ator</h2>
          </div>
          <p className="section__lead">Mantenha o ator curto, público e reaproveitável para cruzar casos, territórios e consequências.</p>
        </div>

        <ActorHubForm actorHub={actorHub} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por onde começar</p>
            <h2>Peça central</h2>
          </div>
          <p className="section__lead">Use a peça central para orientar a leitura pública do ator antes de distribuir os vínculos.</p>
        </div>

        <ActorHubPrimaryPiece actorHub={actorHub} leadLink={leadLink} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">timeline</p>
            <h2>Ordem de leitura</h2>
          </div>
          <p className="section__lead">Reordene as peças com data, marco ou nota curta para deixar o percurso editorial mais claro.</p>
        </div>

        <ActorHubTimeline entries={timeline} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">vínculos</p>
            <h2>Peças relacionadas</h2>
          </div>
          <p className="section__lead">Vincule pauta, memória, acervo, campanha, impacto, território e outros atores sem perder o papel de cada peça.</p>
        </div>

        <ActorHubLinkForm actorHubId={actorHub.id} actorHubSlug={actorHub.slug} options={linkOptions} existingLinksCount={resolvedLinks.length} />
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
                <p className="eyebrow">{getActorHubLinkRoleLabel(role)}</p>
                <div className="stack-cards">
                  {roleLinks.map((link) => (
                    <ActorHubLinkCard key={link.id} link={link} compact />
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





