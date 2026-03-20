import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { EditionForm } from "@/components/edition-form";
import { EditionLinkCard } from "@/components/edition-link-card";
import { EditionLinkForm } from "@/components/edition-link-form";
import { EditionPrimaryPiece } from "@/components/edition-primary-piece";
import { EditorialCover } from "@/components/editorial-cover";
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
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { buildEditionLinkOptions, groupEditionLinksByRole, resolveEditionLinks } from "@/lib/editions/resolve";
import { getInternalEditorialEditionById, getInternalEditorialEditionLinks } from "@/lib/editions/queries";
import { getEditionCoverVariant, getEditionLinkRoleLabel, getEditionStatusLabel, getEditionStatusTone, getEditionTypeLabel } from "@/lib/editions/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const edition = await getInternalEditorialEditionById(id);

  if (!edition) {
    return {
      title: "Edição interna",
      description: "Curadoria e operação das edições do VR Abandonada.",
    };
  }

  return {
    title: `${edition.title} | Edições internas`,
    description: edition.excerpt || edition.description || "Curadoria e operação das edições do VR Abandonada.",
  };
}

export default async function InternalEditionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const edition = await getInternalEditorialEditionById(id);
  if (!edition) {
    notFound();
  }

  const [links, editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs, placeHubs, actorHubs, patternReads] = await Promise.all([
    getInternalEditorialEditionLinks(edition.id),
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
  ]);

  const resolvedLinks = resolveEditionLinks(links, {
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
    patternReads,
  });
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;
  const linksByRole = groupEditionLinksByRole(resolvedLinks);
  const linkOptions = buildEditionLinkOptions({
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
    patternReads,
  });

  return (
    <Container className="intro-grid internal-page theme-hub-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">edição interna</p>
        <h1 className="hero__title">{edition.title}</h1>
        <p className="hero__lead">{edition.excerpt || edition.description}</p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/edicoes" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/edicoes/${edition.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3 className={getEditionStatusTone(edition.status)}>{getEditionStatusLabel(edition.status)}</h3>
            <p>Estado público da edição.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">tipo</p>
            <h3>{getEditionTypeLabel(edition.edition_type)}</h3>
            <p>Categoria principal.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{resolvedLinks.length}</h3>
            <p>Peças ligadas à edição.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Editar caderno</h2>
          </div>
          <p className="section__lead">Mantenha a edição curta, publicável e fácil de compartilhar fora do site.</p>
        </div>

        <EditionForm edition={edition} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por onde começar</p>
            <h2>Peça central</h2>
          </div>
          <p className="section__lead">Use a peça central para orientar a leitura pública antes de distribuir os vínculos.</p>
        </div>

        <EditionPrimaryPiece
          title={edition.title}
          excerpt={edition.excerpt}
          description={edition.description}
          status={edition.status}
          editionType={edition.edition_type}
          periodLabel={edition.period_label}
          publishedAt={edition.published_at}
          href={`/edicoes/${edition.slug}`}
          linkCount={resolvedLinks.length}
          latestLink={links[0] ?? null}
        />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">preview</p>
            <h2>Capas e sinalização pública</h2>
          </div>
          <p className="section__lead">A capa precisa funcionar em mobile, em link compartilhado e na leitura do momento.</p>
        </div>

        <div className="grid-2">
          <article className="card">
            <EditorialCover
              title={edition.title}
              primaryTag={getEditionStatusLabel(edition.status)}
              seriesTitle={edition.period_label || getEditionTypeLabel(edition.edition_type)}
              coverImageUrl={edition.cover_image_url}
              coverVariant={getEditionCoverVariant(edition.edition_type)}
            />
            <div className="meta-row">
              <span className={getEditionStatusTone(edition.status)}>{getEditionStatusLabel(edition.status)}</span>
              <span>{getEditionTypeLabel(edition.edition_type)}</span>
              {edition.period_label ? <span>{edition.period_label}</span> : null}
            </div>
          </article>
          <article className="support-box">
            <p className="eyebrow">nota</p>
            <p>
              A edição condensa radar, campanha, impacto, padrões e dossiês para circular bem fora do site sem perder contexto.
            </p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">vínculos</p>
            <h2>Peças relacionadas</h2>
          </div>
          <p className="section__lead">Vincule pauta, memória, acervo, campanha, impacto, território, ator, padrão e radar sem perder o papel de cada peça.</p>
        </div>

        <EditionLinkForm editionId={edition.id} editionSlug={edition.slug} options={linkOptions} />
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
                <p className="eyebrow">{getEditionLinkRoleLabel(role)}</p>
                <div className="stack-cards">
                  {roleLinks.map((link) => (
                    <EditionLinkCard key={link.id} link={link} compact removable editionId={edition.id} editionSlug={edition.slug} />
                  ))}
                </div>
              </article>
            ) : null,
          )}
        </div>

        {leadLink ? (
          <article className="support-box" style={{ marginTop: "1.5rem" }}>
            <p className="eyebrow">peça central atual</p>
            <EditionLinkCard link={leadLink} compact editionId={edition.id} editionSlug={edition.slug} />
          </article>
        ) : null}
      </section>
    </Container>
  );
}

