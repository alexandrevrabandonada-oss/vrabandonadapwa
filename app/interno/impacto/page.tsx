import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { ImpactCard } from "@/components/impact-card";
import { getImpactStatusLabel } from "@/lib/impact/navigation";
import { getInternalImpactLinks, getInternalImpacts } from "@/lib/impact/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Impactos internos",
  description: "Curadoria e operação dos chamados públicos do VR Abandonada.",
};

const filters = ["all", "observed", "partial", "ongoing", "consolidated", "disputed", "archived"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalImpactsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const impacts = await getInternalImpacts({ status });
  const allImpacts = status === "all" ? impacts : await getInternalImpacts({ status: "all" });
  const linkPairs = await Promise.all(allImpacts.map(async (impact) => [impact.id, await getInternalImpactLinks(impact.id)] as const));
  const linkCountById = new Map(linkPairs.map(([id, links]) => [id, links.length]));
  const publishedCount = allImpacts.filter((impact) => impact.public_visibility).length;
  const activeCount = allImpacts.filter((impact) => impact.status === "ongoing" || impact.status === "partial").length;

  return (
    <Container className="intro-grid internal-page impact-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">impactos internos</p>
        <h1 className="hero__title">Foco editorial temporário</h1>
        <p className="hero__lead">
          Organize chamados públicos que condensam investigação, participação, método e apoio.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/impacto/novo" className="button">
            Novo impacto
          </Link>
          <Link href="/impacto" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allImpacts.length}</h3>
            <p>Impactos cadastrados.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicadas</p>
            <h3>{publishedCount}</h3>
            <p>Chamados liberados para o público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">em foco</p>
            <h3>{activeCount}</h3>
            <p>Impactos em andamento ou observação.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{linkPairs.reduce((sum, [, links]) => sum + links.length, 0)}</h3>
            <p>Peças conectadas aos impactos.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">Filtre rápido o que está em preparação, ativo, monitoramento, encerrado ou arquivado.</p>
        </div>

        <div className="status-filters" aria-label="Filtro de impacto">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/impacto" : `/interno/impacto?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getImpactStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Impactos registrados</h2>
          </div>
          <p className="section__lead">Cada foco temporário abre uma frente pública que articula investigação, participação e apoio.</p>
        </div>

        <div className="grid-2">
          {impacts.length ? (
            impacts.map((impact) => (
              <ImpactCard
                key={impact.id}
                impact={impact}
                href={`/interno/impacto/${impact.id}`}
                itemCount={linkCountById.get(impact.id) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem impacto neste filtro</h3>
              <p>Crie o primeiro foco para condensar a mobilização pública do projeto.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}








