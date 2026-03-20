import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveCollectionCard } from "@/components/archive-collection-card";
import { Container } from "@/components/container";
import { DossierCard } from "@/components/dossier-card";
import { DossierUpdateCard } from "@/components/dossier-update-card";
import { EditorialCard } from "@/components/editorial-card";
import { MemoryCard } from "@/components/memory-card";
import { ThemeHubForm } from "@/components/theme-hub-form";
import { ThemeHubLinkForm } from "@/components/theme-hub-link-form";
import { ThemeHubLeadPiece } from "@/components/theme-hub-primary-piece";
import { ThemeHubTimeline } from "@/components/theme-hub-timeline";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesBySlug, getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { buildThemeHubLinkOptions, buildThemeHubTimeline, groupThemeHubLinksByType, resolveThemeHubLinks } from "@/lib/hubs/resolve";
import { getThemeHubLinkRoleLabel, getThemeHubStatusLabel } from "@/lib/hubs/navigation";
import { getInternalThemeHubById, getInternalThemeHubLinks } from "@/lib/hubs/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { removeThemeHubLinkAction } from "@/app/interno/eixos/actions";
import { signOutAction } from "@/app/interno/actions";

export const metadata: Metadata = {
  title: "Eixo interno",
  description: "Editar e conectar uma frente temática pública.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalThemeHubDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const hub = await getInternalThemeHubById(id);
  if (!hub) {
    notFound();
  }

  const links = await getInternalThemeHubLinks(hub.id);
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const dossiers = await getPublishedDossiers();
  const seriesCards = getEditorialSeriesCards(editorialItems);
  const options = buildThemeHubLinkOptions({ editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, seriesCards });
  const resolvedLinks = resolveThemeHubLinks(links, { editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, seriesCards });
  const grouped = groupThemeHubLinksByType(resolvedLinks);
  const timelineEntries = buildThemeHubTimeline(resolvedLinks);
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;
  const dossierLinks = resolvedLinks.filter((link) => link.link_type === "dossier");
  const relatedDossiers = dossierLinks
    .map((link) => dossiers.find((dossier) => dossier.slug === link.link_key))
    .filter((item): item is (typeof dossiers)[number] => Boolean(item));
  const updatesByDossierId = await getPublishedDossierUpdatesByDossierIds(relatedDossiers.map((item) => item.id));
  const latestMovements = relatedDossiers
    .map((dossier) => ({ dossier, update: updatesByDossierId.get(dossier.id)?.[0] ?? null }))
    .filter((item) => Boolean(item.update))
    .slice(0, 3);

  const typeSections = [
    { type: "dossier", title: "Dossiês conectados" },
    { type: "editorial", title: "Pautas conectadas" },
    { type: "memory", title: "Memória relacionada" },
    { type: "archive", title: "Materiais do acervo" },
    { type: "collection", title: "Coleções relacionadas" },
    { type: "series", title: "Séries relacionadas" },
  ] as const;

  return (
    <Container className="intro-grid internal-page theme-hub-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">eixos internos</p>
        <h1 className="hero__title">{hub.title}</h1>
        <p className="hero__lead">{hub.excerpt || hub.description || "Frente temática pública."}</p>
        <div className="meta-row">
          <span>{getThemeHubStatusLabel(hub.status)}</span>
          <span>{links.length} vínculo(s)</span>
          {latestMovements.length ? <span>Última movimentação: {latestMovements[0].update?.title}</span> : null}
        </div>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/eixos" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/eixos/${hub.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3>{getThemeHubStatusLabel(hub.status)}</h3>
            <p>{hub.public_visibility ? "Público" : "Interno"}</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{links.length}</h3>
            <p>Peças já conectadas.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">timeline</p>
            <h3>{timelineEntries.length}</h3>
            <p>Marcos organizados na leitura pública.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">destaque</p>
            <h3>{hub.featured ? "sim" : "não"}</h3>
            <p>Se deve puxar a home pública.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">editar</p>
            <h2>Dados do eixo</h2>
          </div>
          <p className="section__lead">Atualize título, pergunta central, recorte e visibilidade sem perder o eixo temático.</p>
        </div>

        <ThemeHubForm hub={hub} />
      </section>

      {latestMovements.length ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <div>
              <p className="eyebrow">movimento recente</p>
              <h2>O tema está vivo</h2>
            </div>
            <p className="section__lead">Os dossiês relacionados mostram o tema respirando no presente.</p>
          </div>

          <div className="grid-2">
            {latestMovements.map(({ dossier, update }) =>
              update ? <DossierUpdateCard key={update.id} update={update} href={`/interno/dossies/${dossier.id}/updates/${update.id}`} actionLabel="Editar update" /> : null,
            )}
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">peça central</p>
            <h2>Entrada principal do eixo</h2>
          </div>
          <p className="section__lead">A peça central organiza a pergunta e define por onde o leitor começa.</p>
        </div>

        <ThemeHubLeadPiece hub={hub} leadLink={leadLink} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">timeline</p>
            <h2>Ordem de leitura</h2>
          </div>
          <p className="section__lead">Edite a ordem pelos campos de ano, papel e ordenação do vínculo.</p>
        </div>

        <ThemeHubTimeline entries={timelineEntries} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">vínculos</p>
            <h2>Ligações do eixo</h2>
          </div>
          <p className="section__lead">Conecte o tema a pauta, memória, acervo, coleção, dossiê e série já publicáveis.</p>
        </div>

        <div className="grid-2">
          <div>
            <ThemeHubLinkForm hub={hub} options={options} existingLinks={links} />
          </div>
          <div className="support-box">
            <h3>Vínculos já ligados</h3>
            <div className="stacked-list">
              {resolvedLinks.length ? (
                resolvedLinks.map((link) => (
                  <article className="card" key={link.id}>
                    <p className="eyebrow">{getThemeHubLinkRoleLabel(link.link_role)}</p>
                    <h4>{link.title}</h4>
                    <p>{link.timeline_note || link.excerpt || "Sem resumo."}</p>
                    <div className="meta-row">
                      {link.timeline_label ? <span>{link.timeline_label}</span> : null}
                      {link.timeline_year ? <span>{link.timeline_year}</span> : null}
                    </div>
                    <div className="stack-actions">
                      <Link href={link.href} className="button-secondary">
                        Abrir
                      </Link>
                      <form action={removeThemeHubLinkAction}>
                        <input type="hidden" name="theme_hub_id" value={hub.id} />
                        <input type="hidden" name="link_id" value={link.id} />
                        <button type="submit" className="button-secondary">
                          Remover
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <p>Nenhum vínculo registrado ainda.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {typeSections.map(({ type, title }) => {
        const items = grouped[type] ?? [];
        if (!items.length) {
          return null;
        }

        return (
          <section className="section internal-panel" key={type}>
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
                  const item = editorialItems.find((entry) => entry.slug === link.link_key);
                  return item ? <EditorialCard key={link.id} item={item} href={link.href} compact /> : null;
                }

                if (link.link_type === "memory") {
                  const item = memoryItems.find((entry) => entry.slug === link.link_key);
                  return item ? <MemoryCard key={link.id} item={item} href={link.href} compact /> : null;
                }

                if (link.link_type === "archive") {
                  const item = archiveAssets.find((entry) => entry.id === link.link_key);
                  return item ? <ArchiveAssetCard key={link.id} asset={item} href={link.href} actionLabel="Abrir documento" compact /> : null;
                }

                if (link.link_type === "collection") {
                  const item = archiveCollections.find((entry) => entry.slug === link.link_key);
                  return item ? <ArchiveCollectionCard key={link.id} collection={item} href={link.href} compact /> : null;
                }

                if (link.link_type === "series") {
                  const item = seriesCards.find((series) => series.slug === link.link_key) ?? getEditorialSeriesBySlug(link.link_key);
                  return item ? (
                    <article className="support-box" key={link.id}>
                      <p className="eyebrow">{getThemeHubLinkRoleLabel(link.link_role)}</p>
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
    </Container>
  );
}


