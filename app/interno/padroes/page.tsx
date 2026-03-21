import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { PatternReadCard } from "@/components/pattern-read-card";
import { getInternalPatternReadLinks, getInternalPatternReads } from "@/lib/patterns/queries";
import { getPatternReadStatusLabel } from "@/lib/patterns/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Padrões internos",
  description: "Curadoria e operação das leituras estruturais do VR Abandonada.",
};

const filters = ["all", "draft", "active", "monitoring", "archive"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalPatternsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const patterns = await getInternalPatternReads({ status });
  const allPatterns = status === "all" ? patterns : await getInternalPatternReads({ status: "all" });
  const linkPairs = await Promise.all(allPatterns.map(async (pattern) => [pattern.id, await getInternalPatternReadLinks(pattern.id)] as const));
  const linkCountById = new Map(linkPairs.map(([id, links]) => [id, links.length]));
  const publishedCount = allPatterns.filter((pattern) => pattern.status !== "draft" && pattern.public_visibility).length;
  const activeCount = allPatterns.filter((pattern) => pattern.status === "active" || pattern.status === "monitoring").length;

  return (
    <Container className="intro-grid internal-page theme-hub-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">padrões internos</p>
        <h1 className="hero__title">Leituras estruturais da cidade</h1>
        <p className="hero__lead">
          Organize hipóteses públicas sobre o que se repete entre atores, territórios, campanhas, impactos e casos. O padrão não substitui o caso, ele o sintetiza.
        </p>
        <div className="hero__actions">          <Link href="/interno/padroes/novo" className="button">
            Novo padrão
          </Link>
          <Link href="/padroes" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allPatterns.length}</h3>
            <p>Padrões cadastrados.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicados</p>
            <h3>{publishedCount}</h3>
            <p>Leituras liberadas para o público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">ativos</p>
            <h3>{activeCount}</h3>
            <p>Frentes em andamento.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{linkPairs.reduce((sum, [, links]) => sum + links.length, 0)}</h3>
            <p>Peças conectadas aos padrões.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">Filtre rápido o que está em rascunho, ativo, monitoramento ou arquivo.</p>
        </div>

        <div className="status-filters" aria-label="Filtro de padrões">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/padroes" : `/interno/padroes?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getPatternReadStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Padrões registrados</h2>
          </div>
          <p className="section__lead">Cada padrão sintetiza o que insiste em voltar para o arquivo vivo da cidade.</p>
        </div>

        <div className="grid-2">
          {patterns.length ? (
            patterns.map((patternRead) => (
              <PatternReadCard
                key={patternRead.id}
                patternRead={patternRead}
                href={`/interno/padroes/${patternRead.id}`}
                itemCount={linkCountById.get(patternRead.id) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem padrões neste filtro</h3>
              <p>Crie o primeiro padrão para abrir a camada estrutural do projeto.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}

