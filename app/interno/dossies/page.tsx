import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { DossierCard } from "@/components/dossier-card";
import { InternalRecentCentralEntries } from "@/components/internal-recent-central-entries";
import { getInternalDossiers, getInternalDossierLinks } from "@/lib/dossiers/queries";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getInternalArchiveAssets } from "@/lib/archive/queries";
import { getInternalEditorialEntries } from "@/lib/entrada/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dossiês internos",
  description: "Curadoria e operação dos dossiês vivos do VR Abandonada.",
};

const filters = ["all", "draft", "in_progress", "monitoring", "concluded", "archived"] as const;

type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalDossiersPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const [dossiers, allDossiers, editorialEntries, archiveAssets] = await Promise.all([
    getInternalDossiers({ status }),
    getInternalDossiers({ status: "all" }),
    getInternalEditorialEntries(),
    getInternalArchiveAssets(),
  ]);
  const linkPairs = await Promise.all(allDossiers.map(async (dossier) => [dossier.id, await getInternalDossierLinks(dossier.id)] as const));
  const linkCountById = new Map(linkPairs.map(([id, links]) => [id, links.length]));
  const publishedCount = allDossiers.filter((dossier) => dossier.status !== "draft" && dossier.public_visibility).length;
  const activeCount = allDossiers.filter((dossier) => dossier.status === "in_progress" || dossier.status === "monitoring").length;
  const centralEntries = editorialEntries.filter((entry) => (entry.entry_type === "document" || entry.entry_type === "image") && Boolean(entry.file_url)).slice(0, 6);

  return (
    <Container className="intro-grid internal-page dossier-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">dossiês internos</p>
        <h1 className="hero__title">Dossiês.</h1>
        <p className="hero__lead">Cada linha de investigação costura pauta, memória, acervo e coleção em um percurso editorial curto.</p>
        <div className="hero__actions">
          <Link href="/interno/dossies/novo" className="button">
            Novo dossiê
          </Link>
          <Link href="/dossies" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allDossiers.length}</h3>
            <p>Dossiês cadastrados.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicados</p>
            <h3>{publishedCount}</h3>
            <p>Linhas abertas ao público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">em curso</p>
            <h3>{activeCount}</h3>
            <p>Investigação em andamento.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">Filtre o que está em rascunho, em curso, em monitoramento, concluído ou arquivado.</p>
        </div>

        <div className="status-filters" aria-label="Filtro de dossiês">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/dossies" : `/interno/dossies?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "Todos" : getDossierStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <InternalRecentCentralEntries
        title="O que pode virar dossiê."
        lead="Entradas de foto e documento aparecem aqui quando já carregam lastro para abrir investigação."
        entries={centralEntries}
        archiveAssets={archiveAssets}
        emptyTitle="Sem recentes da central"
        emptyDescription="Quando subir foto ou PDF pela entrada simplificada, eles aparecem aqui para virar dossiê sem retrabalho."
        fallbackLabel="Levar ao dossiê"
        fallbackHref={(entry) => `/interno/dossies/novo?entry_id=${entry.id}`}
      />

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Dossiês registrados</h2>
          </div>
          <p className="section__lead">Cada peça abre um caso com contexto, prova e navegação para o restante do projeto.</p>
        </div>

        <div className="grid-2">
          {dossiers.length ? (
            dossiers.map((dossier) => (
              <DossierCard
                key={dossier.id}
                dossier={dossier}
                href={`/interno/dossies/${dossier.id}`}
                itemCount={linkCountById.get(dossier.id) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem dossiês neste filtro</h3>
              <p>Crie o primeiro recorte investigativo para abrir a camada pública.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
