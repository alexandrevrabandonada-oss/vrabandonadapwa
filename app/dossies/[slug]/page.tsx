import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveCollectionCard } from "@/components/archive-collection-card";
import { Container } from "@/components/container";
import { DossierPrimaryPiece } from "@/components/dossier-primary-piece";
import { DossierTimeline } from "@/components/dossier-timeline";
import { DossierUpdateCard } from "@/components/dossier-update-card";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { FollowButton } from "@/components/follow-button";
import { SaveReadButton } from "@/components/save-read-button";
import { SharePanel } from "@/components/share-panel";
import { MemoryCard } from "@/components/memory-card";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getDossierLinkRoleLabel, getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getPublishedDossierBySlug, getPublishedDossierLinks, getPublishedDossierUpdates, getPublishedDossiers } from "@/lib/dossiers/queries";
import { buildDossierTimeline, groupDossierLinksByRole, resolveDossierLinks } from "@/lib/dossiers/resolve";
import { getDossierUpdateNarrativeLabel, groupDossierUpdatesByType } from "@/lib/dossiers/updates";
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
  const updates = await getPublishedDossierUpdates(dossier.id);
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
  const roleGroups = groupDossierLinksByRole(resolvedLinks);
  const timelineEntries = buildDossierTimeline(resolvedLinks);
  const editorialBySlug = new Map(editorialItems.map((item) => [item.slug, item]));
  const memoryBySlug = new Map(memoryItems.map((item) => [item.slug, item]));
  const archiveById = new Map(archiveAssets.map((item) => [item.id, item]));
  const collectionBySlug = new Map(archiveCollections.map((item) => [item.slug, item]));
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;
  const leadSeries = resolvedLinks.find((link) => link.link_type === "series");
  const relatedSeries = leadSeries ? seriesCards.find((series) => series.slug === leadSeries.link_key) ?? getEditorialSeriesBySlug(leadSeries.link_key) : null;
  const featuredUpdate = updates[0] ?? null;
  const updatesByType = groupDossierUpdatesByType(updates);
  const changesUpdates = [
    ...(updatesByType.development ?? []),
    ...(updatesByType.evidence ?? []),
    ...(updatesByType.correction ?? []),
  ];
  const nextStepsUpdates = [...(updatesByType.monitoring ?? []), ...(updatesByType.call ?? []), ...(updatesByType.note ?? [])];
  const roleSections = [
    { role: "evidence", title: "Evidências e documentos" },
    { role: "context", title: "Memória e contexto" },
    { role: "followup", title: "Desdobramentos" },
    { role: "archive", title: "Arquivo de base" },
  ] as const;

  return (
    <Container className="intro-grid dossier-detail-page">
      <section className="hero hero--split dossier-detail-hero">
        <div className="hero__copy">
          <p className="eyebrow">dossiê vivo</p>
          <h1 className="hero__title">{dossier.title}</h1>
          <p className="hero__lead">{dossier.excerpt || dossier.description}</p>
          <div className="meta-row">
            <span>{getDossierStatusLabel(dossier.status)}</span>
            {dossier.period_label ? <span>{dossier.period_label}</span> : null}
            {dossier.territory_label ? <span>{dossier.territory_label}</span> : null}
            {featuredUpdate ? <span>Última atualização: {featuredUpdate.title}</span> : null}
          </div>
          {dossier.lead_question ? (
            <article className="support-box dossier-question-box">
              <p className="eyebrow">pergunta central</p>
              <h2>{dossier.lead_question}</h2>
            </article>
          ) : null}
          <div className="stack-actions">
            <Link href="/dossies" className="button-secondary">
              Voltar aos dossiês
            </Link>
            <Link href="/pautas" className="button-secondary">
              Abrir pautas
            </Link>
            <SaveReadButton kind="dossier" keyValue={dossier.slug} title={dossier.title} summary={dossier.excerpt || dossier.description || dossier.title} href={`/dossies/${dossier.slug}`} compact />
            <FollowButton kind="dossier" keyValue={dossier.slug} title={dossier.title} summary={dossier.excerpt || dossier.description || dossier.title} href={`/dossies/${dossier.slug}`} compact />
            <Link href="/envie" className="button">
              Enviar pista ou documento
            </Link>
          </div>
        </div>

        <EditorialCover
          title={dossier.title}
          primaryTag={getDossierStatusLabel(dossier.status)}
          seriesTitle={dossier.lead_question || dossier.period_label || dossier.title}
          coverImageUrl={dossier.cover_image_url}
          coverVariant={dossier.featured ? "ember" : "concrete"}
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">compartilhar</p>
            <h2>Um dossiê também pode sair do site com contexto.</h2>
          </div>
          <p className="section__lead">Copie a leitura inicial e circule a investigação sem perder o caminho para o arquivo vivo.</p>
        </div>

        <SharePanel
          title={dossier.title}
          summary={dossier.excerpt || dossier.description || dossier.title}
          caption={`Leia e compartilhe: ${dossier.title}. ${dossier.excerpt || dossier.description || ""}`.trim()}
          shareHref={`/compartilhar/dossie/${dossier.slug}`}
          contentHref={`/dossies/${dossier.slug}`}
          titleLabel="compartilhe este dossiê"
        />
      </section>

      <section className="section dossier-primary-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por onde começar</p>
            <h2>Peça central da investigação.</h2>
          </div>
          <p className="section__lead">
            Um dossiê precisa de entrada principal. É a peça que abre o caso e organiza a leitura do restante do material.
          </p>
        </div>

        <DossierPrimaryPiece dossier={dossier} leadLink={leadLink} />
      </section>

      <section className="section dossier-timeline-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">timeline leve</p>
            <h2>Marcos do caso em ordem pública.</h2>
          </div>
          <p className="section__lead">
            A timeline junta passado, prova e desdobramento em uma sequência simples para orientar a leitura sem virar cronologia burocrática.
          </p>
        </div>

        <DossierTimeline entries={timelineEntries} />
      </section>

      {featuredUpdate ? (
        <section className="section dossier-update-featured-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">última atualização</p>
              <h2>{getDossierUpdateNarrativeLabel(featuredUpdate.update_type)}</h2>
            </div>
            <p className="section__lead">O acompanhamento público mostra o que mudou, o que segue em aberto e onde o público pode ajudar.</p>
          </div>

          <DossierUpdateCard update={featuredUpdate} />
        </section>
      ) : null}

      <section className="section dossier-progress-section">
        <div className="grid-2">
          <article className="support-box">
            <p className="eyebrow">o que mudou</p>
            <h3>Desenvolvimento, prova e correção</h3>
            {changesUpdates.length ? (
              <div className="stacked-list">
                {changesUpdates.slice(0, 3).map((update) => (
                  <DossierUpdateCard key={update.id} update={update} compact />
                ))}
              </div>
            ) : (
              <p>Sem movimentação nova registrada ainda.</p>
            )}
          </article>
          <article className="support-box">
            <p className="eyebrow">próximos passos</p>
            <h3>O que está em aberto</h3>
            <p>O caso segue vivo quando ainda há pista, confirmação ou documento por cruzar.</p>
            {nextStepsUpdates.length ? (
              <div className="stacked-list">
                {nextStepsUpdates.slice(0, 3).map((update) => (
                  <DossierUpdateCard key={update.id} update={update} compact />
                ))}
              </div>
            ) : (
              <p>Sem próximos passos registrados no momento.</p>
            )}
          </article>
        </div>
      </section>

      <section className="section dossier-detail-overview">
        <div className="grid-2">
          <article className="support-box">
            <p className="eyebrow">recorte</p>
            <h3>Período e território</h3>
            <p>{dossier.period_label || "Período aberto"}</p>
            <p>{dossier.territory_label || "Território aberto"}</p>
            <p>
              O dossiê funciona como unidade de entendimento. Os materiais abaixo aparecem na ordem editorial definida pelo projeto.
            </p>
          </article>
          <article className="support-box">
            <p className="eyebrow">leituras conectadas</p>
            <h3>{resolvedLinks.length} peças ligadas</h3>
            <p>O percurso separa prova, contexto e desdobramento para deixar a investigação legível.</p>
          </article>
        </div>
      </section>

      {roleSections.map(({ role, title }) => {
        const items = roleGroups[role] ?? [];
        if (!items.length) {
          return null;
        }

        return (
          <section className="section dossier-links-section" key={role}>
            <div className="grid-2">
              <div>
                <p className="eyebrow">{getDossierLinkRoleLabel(role)}</p>
                <h2>{title}</h2>
              </div>
              <p className="section__lead">
                {role === "evidence"
                  ? "Documentos-base e fontes que sustentam a hipótese pública."
                  : role === "context"
                    ? "Memórias e recortes de contexto que situam o conflito na cidade."
                    : role === "followup"
                      ? "Desdobramentos e continuidades que mantêm a investigação aberta."
                      : "Materiais de arquivo e coleções que ajudam a consolidar o lastro."}
              </p>
            </div>

            <div className="grid-2">
              {items.map((link) => {
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
                  return (
                    <article className="support-box" key={link.id}>
                      <p className="eyebrow">{getDossierLinkRoleLabel(link.link_role)}</p>
                      <h3>{link.title}</h3>
                      <p>{link.timeline_note || link.excerpt || "Série conectada ao dossiê."}</p>
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
        );
      })}

      <section className="section dossier-call-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">convocação pública</p>
            <h2>Tem documento, relato ou pista sobre este caso?</h2>
          </div>
          <p className="section__lead">
            A investigação só anda com lastro. Se houver material útil, o canal de envio abre caminho para cruzamento editorial responsável.
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>Enviar ao projeto</h3>
            <p>Pistas, relatos, fotos e documentos entram pelo canal de envio.</p>
            <Link href="/envie" className="button-secondary">
              Abrir canal
            </Link>
          </article>
          <article className="card">
            <h3>Ver o acervo</h3>
            <p>Materiais de base ajudam a sustentar o percurso do dossiê.</p>
            <Link href="/acervo" className="button-secondary">
              Entrar no acervo
            </Link>
          </article>
          <article className="card">
            <h3>Acompanhar as pautas</h3>
            <p>Os desdobramentos seguem a linha pública do projeto.</p>
            <Link href="/pautas" className="button-secondary">
              Abrir pautas
            </Link>
          </article>
        </div>
      </section>

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
          {relatedSeries ? (
            <article className="card">
              <h3>{relatedSeries.title}</h3>
              <p>{relatedSeries.description}</p>
              <Link href={`/series/${relatedSeries.slug}`} className="button-secondary">
                Ver série
              </Link>
            </article>
          ) : null}
        </div>
      </section>
    </Container>
  );
}




