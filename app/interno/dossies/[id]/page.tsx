import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { DossierForm } from "@/components/dossier-form";
import { DossierLinkForm } from "@/components/dossier-link-form";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { buildDossierLinkOptions, resolveDossierLinks } from "@/lib/dossiers/resolve";
import { getInternalDossierById, getInternalDossierLinks } from "@/lib/dossiers/queries";
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
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const seriesCards = getEditorialSeriesCards(editorialItems);
  const options = buildDossierLinkOptions({ editorialItems, memoryItems, archiveAssets, archiveCollections, seriesCards });
  const resolvedLinks = resolveDossierLinks(links, { editorialItems, memoryItems, archiveAssets, archiveCollections, seriesCards });

  return (
    <Container className="intro-grid internal-page dossier-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">dossiês internos</p>
        <h1 className="hero__title">{dossier.title}</h1>
        <p className="hero__lead">{dossier.excerpt || dossier.description || "Linha de investigação pública."}</p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/dossies" className="button-secondary">
            Voltar à lista
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
            <h3>{dossier.status}</h3>
            <p>{dossier.public_visibility ? "Público" : "Interno"}</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{links.length}</h3>
            <p>Peças já conectadas.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">período</p>
            <h3>{dossier.period_label || "aberto"}</h3>
            <p>{dossier.territory_label || "território aberto"}</p>
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
                    <p className="eyebrow">{link.link_type}</p>
                    <h4>{link.title}</h4>
                    <p>{link.excerpt || "Sem resumo."}</p>
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
