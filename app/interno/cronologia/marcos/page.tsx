import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { TimelineHighlightCard } from "@/components/timeline-highlight-card";
import { getInternalTimelineHighlightLinks, getInternalTimelineHighlights } from "@/lib/timeline/highlight-queries";
import { getTimelineHighlightStatusLabel } from "@/lib/timeline/highlights";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Marcos internos",
  description: "Curadoria e operação dos marcos centrais do VR Abandonada.",
};

const filters = ["all", "draft", "active", "monitoring", "archive"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalTimelineHighlightsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const highlights = await getInternalTimelineHighlights({ status });
  const allHighlights = status === "all" ? highlights : await getInternalTimelineHighlights({ status: "all" });
  const linkPairs = await Promise.all(allHighlights.map(async (highlight) => [highlight.id, await getInternalTimelineHighlightLinks(highlight.id)] as const));
  const linkCountById = new Map(linkPairs.map(([id, links]) => [id, links.length]));
  const publishedCount = allHighlights.filter((highlight) => highlight.status !== "draft" && highlight.public_visibility).length;
  const activeCount = allHighlights.filter((highlight) => highlight.status === "active" || highlight.status === "monitoring").length;

  return (
    <Container className="intro-grid internal-page theme-hub-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">marcos internos</p>
        <h1 className="hero__title">Rupturas e continuidades da cidade</h1>
        <p className="hero__lead">
          Organize os marcos centrais que condensam a leitura histórica do site. O marco não substitui a cronologia ampla, ele orienta a leitura do que importa.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/cronologia/marcos/novo" className="button">
            Novo marco
          </Link>
          <Link href="/linha-do-tempo" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allHighlights.length}</h3>
            <p>Marcos cadastrados.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicados</p>
            <h3>{publishedCount}</h3>
            <p>Leituras liberadas para o público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">ativos</p>
            <h3>{activeCount}</h3>
            <p>Viradas em andamento.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{linkPairs.reduce((sum, [, links]) => sum + links.length, 0)}</h3>
            <p>Peças conectadas aos marcos.</p>
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

        <div className="status-filters" aria-label="Filtro de marcos">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/cronologia/marcos" : `/interno/cronologia/marcos?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getTimelineHighlightStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Marcos centrais cadastrados</h2>
          </div>
          <p className="section__lead">Cada marco sintetiza uma virada temporal e empurra o leitor de volta para o ecossistema público.</p>
        </div>

        <div className="grid-2">
          {highlights.length ? (
            highlights.map((highlight) => {
              const latestMovement = linkPairs.find(([id]) => id === highlight.id)?.[1]?.[0] ?? null;
              return (
                <TimelineHighlightCard
                  key={highlight.id}
                  highlight={highlight}
                  href={`/interno/cronologia/marcos/${highlight.id}`}
                  itemCount={linkCountById.get(highlight.id) ?? 0}
                  latestMovement={latestMovement?.timeline_note || latestMovement?.timeline_label || null}
                />
              );
            })
          ) : (
            <div className="support-box">
              <h3>Sem marcos neste filtro</h3>
              <p>Crie o primeiro marco para dar corpo à leitura temporal curada.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
