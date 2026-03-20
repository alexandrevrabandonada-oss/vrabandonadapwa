import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { DossierForm } from "@/components/dossier-form";
import { DossierLinkForm } from "@/components/dossier-link-form";
import { DossierPrimaryPiece } from "@/components/dossier-primary-piece";
import { DossierTimeline } from "@/components/dossier-timeline";
import { DossierUpdateCard } from "@/components/dossier-update-card";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { buildDossierLinkOptions, buildDossierTimeline, resolveDossierLinks } from "@/lib/dossiers/resolve";
import { getDossierLinkRoleLabel, getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getInternalDossierById, getInternalDossierLinks, getInternalDossierUpdates } from "@/lib/dossiers/queries";
import { getDossierLatestUpdate } from "@/lib/dossiers/updates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { removeInvestigationDossierLinkAction } from "@/app/interno/dossies/actions";

export const metadata: Metadata = {
  title: "Dossiê interno",
  description: "Editar e conectar uma linha de investigação pública.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalDossierDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const dossier = await getInternalDossierById(id);
  if (!dossier) {
    notFound();
  }

  const links = await getInternalDossierLinks(dossier.id);
  const updates = await getInternalDossierUpdates(dossier.id);
  const latestUpdate = getDossierLatestUpdate(updates);
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const seriesCards = getEditorialSeriesCards(editorialItems);
  const options = buildDossierLinkOptions({ editorialItems, memoryItems, archiveAssets, archiveCollections, seriesCards });
  const resolvedLinks = resolveDossierLinks(links, { editorialItems, memoryItems, archiveAssets, archiveCollections, seriesCards });
  const timelineEntries = buildDossierTimeline(resolvedLinks);
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;

  return (
    <Container className="intro-grid internal-page dossier-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">dossiês internos</p>
        <h1 className="hero__title">{dossier.title}</h1>
        <p className="hero__lead">{dossier.excerpt || dossier.description || "Linha de investigação pública."}</p>
        <div className="meta-row">
          <span>{getDossierStatusLabel(dossier.status)}</span>
          {dossier.period_label ? <span>{dossier.period_label}</span> : null}
          {dossier.territory_label ? <span>{dossier.territory_label}</span> : null}
          {latestUpdate ? <span>Última atualização: {latestUpdate.title}</span> : null}
        </div>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/dossies" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/interno/dossies/${dossier.id}/updates`} className="button-secondary">
            Gerir updates
          </Link>
          <Link href={`/dossies/${dossier.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3>{getDossierStatusLabel(dossier.status)}</h3>
            <p>{dossier.public_visibility ? "Público" : "Interno"}</p>
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
            <h3>{dossier.featured ? "sim" : "não"}</h3>
            <p>Se deve puxar a home pública.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">editar</p>
            <h2>Dados do dossiê</h2>
          </div>
          <p className="section__lead">Atualize título, hipótese, território e visibilidade sem quebrar o percurso público.</p>
        </div>

        <DossierForm dossier={dossier} />
      </section>

      {updates.length ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <div>
              <p className="eyebrow">updates recentes</p>
              <h2>A investigação está viva</h2>
            </div>
            <p className="section__lead">Acompanhe o andamento, as correções e a convocação pública sem sair do dossiê.</p>
          </div>

          <div className="grid-2">
            {updates.slice(0, 2).map((update) => (
              <DossierUpdateCard key={update.id} update={update} href={`/interno/dossies/${dossier.id}/updates/${update.id}`} actionLabel="Editar update" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">peça central</p>
            <h2>Entrada principal do caso</h2>
          </div>
          <p className="section__lead">A peça central organiza a pergunta e define por onde o leitor começa.</p>
        </div>

        <DossierPrimaryPiece dossier={dossier} leadLink={leadLink} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">timeline</p>
            <h2>Ordem de leitura</h2>
          </div>
          <p className="section__lead">Edite a ordem pelos campos de ano, papel e ordenação do vínculo.</p>
        </div>

        <DossierTimeline entries={timelineEntries} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">vínculos</p>
            <h2>Ligações do dossiê</h2>
          </div>
          <p className="section__lead">Conecte o caso a pauta, memória, acervo, coleção e série já publicáveis.</p>
        </div>

        <div className="grid-2">
          <div>
            <DossierLinkForm dossier={dossier} options={options} existingLinks={resolvedLinks} />
          </div>
          <div className="support-box">
            <h3>Vínculos já ligados</h3>
            <div className="stacked-list">
              {resolvedLinks.length ? (
                resolvedLinks.map((link) => (
                  <article className="card" key={link.id}>
                    <p className="eyebrow">{getDossierLinkRoleLabel(link.link_role)}</p>
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
                      <form action={removeInvestigationDossierLinkAction}>
                        <input type="hidden" name="dossier_id" value={dossier.id} />
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
    </Container>
  );
}
