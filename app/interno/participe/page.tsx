import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { ParticipationPathCard } from "@/components/participation-path-card";
import { getInternalParticipationPaths, getInternalParticipationPathItems } from "@/lib/participation/queries";
import { getParticipationStatusLabel } from "@/lib/participation/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Participação interna",
  description: "Curadoria e operação dos caminhos de participação do VR Abandonada.",
};

const filters = ["all", "draft", "active", "archive"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalParticipationPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const paths = await getInternalParticipationPaths({ status });
  const allPaths = status === "all" ? paths : await getInternalParticipationPaths({ status: "all" });
  const itemPairs = await Promise.all(allPaths.map(async (path) => [path.id, (await getInternalParticipationPathItems(path.id)).length] as const));
  const itemCountById = new Map(itemPairs);
  const publishedCount = allPaths.filter((path) => path.public_visibility && path.status !== "draft").length;
  const activeCount = allPaths.filter((path) => path.status === "active").length;

  return (
    <Container className="intro-grid internal-page participation-internal-page">
      <section className="hero internal-hero participation-internal-hero">
        <p className="eyebrow">participação interna</p>
        <h1 className="hero__title">Caminhos de colaboração</h1>
        <p className="hero__lead">
          Organize as portas públicas do projeto: envio, apoio, memória, acervo, acompanhamento e compartilhamento.
        </p>
        <div className="hero__actions">          <Link href="/interno/participe/novo" className="button">
            Nova rota
          </Link>
          <Link href="/participe" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel participation-internal-section">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allPaths.length}</h3>
            <p>Rotas cadastradas.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicadas</p>
            <h3>{publishedCount}</h3>
            <p>Rotas liberadas para o público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">ativas</p>
            <h3>{activeCount}</h3>
            <p>Rotas em circulação.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">passos</p>
            <h3>{itemPairs.reduce((sum, [, count]) => sum + count, 0)}</h3>
            <p>Percursos montados.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">Filtre rápido o que está em rascunho, ativo ou arquivado.</p>
        </div>

        <div className="status-filters" aria-label="Filtro de participação">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/participe" : `/interno/participe?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getParticipationStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Rotas de participação</h2>
          </div>
          <p className="section__lead">Cada caminho orienta o visitante para um gesto concreto: enviar, apoiar, colaborar ou acompanhar.</p>
        </div>

        <div className="grid-2">
          {paths.length ? (
            paths.map((path) => (
              <ParticipationPathCard key={path.id} path={path} href={`/interno/participe/${path.id}`} itemCount={itemCountById.get(path.id) ?? 0} />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem rotas neste filtro</h3>
              <p>Crie a primeira rota para abrir a camada pública de participação.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
