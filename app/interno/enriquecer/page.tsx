import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { EnrichmentQueueCard } from "@/components/enrichment-queue-card";
import { editorialEntryStatusLabels, editorialEntryStatuses, editorialEntryTypeLabels, editorialEntryTypes, type EditorialEntryStatus, type EditorialEntryType } from "@/lib/entrada/types";
import { getInternalEditorialEntries, getInternalEditorialEntryCounts, getInternalEditorialTypeCounts } from "@/lib/entrada/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Enriquecimento",
  description: "Fila de transformação posterior da entrada simplificada.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function isEntryType(value: string): value is EditorialEntryType {
  return editorialEntryTypes.includes(value as EditorialEntryType);
}

function isStatusFilter(value: string): value is EditorialEntryStatus | "all" {
  return value === "all" || editorialEntryStatuses.includes(value as EditorialEntryStatus);
}

export default async function EnrichmentPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const tipoInput = firstParam(resolvedSearchParams.tipo);
  const statusInput = firstParam(resolvedSearchParams.status) || "all";
  const entryType = isEntryType(tipoInput) ? tipoInput : null;
  const statusFilter = isStatusFilter(statusInput) ? statusInput : "all";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const [entries, counts, typeCounts] = await Promise.all([
    getInternalEditorialEntries({ status: statusFilter, type: entryType ?? "all" }),
    getInternalEditorialEntryCounts(),
    getInternalEditorialTypeCounts(),
  ]);

  const currentUrl = `/interno/enriquecer${statusFilter !== "all" || entryType ? `?${new URLSearchParams({ ...(statusFilter !== "all" ? { status: statusFilter } : {}), ...(entryType ? { tipo: entryType } : {}) }).toString()}` : ""}`;

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">enriquecimento posterior</p>
        <h1 className="hero__title">Uma fila curta para transformar o que entrou.</h1>
        <p className="hero__lead">
          Pegue o que foi guardado, escolha um destino rápido e deixe o conteúdo seguir para memória, acervo ou uma peça editorial sem retrabalho.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/interno/entrada" className="button-secondary">Voltar à central</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como usar</p>
            <h2>Etapa 2 pega a entrada guardada e reduz o trabalho manual.</h2>
          </div>
          <p className="section__lead">
            A fila mostra o que está parado, o que já pode seguir e o que precisa só de um destino para virar parte útil do ecossistema.
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <p className="eyebrow">Fila total</p>
            <h3>{counts.total}</h3>
            <p>Entradas no caminho de transformação.</p>
          </article>
          <article className="card">
            <p className="eyebrow">Guardados</p>
            <h3>{counts.stored}</h3>
            <p>Itens para decidir depois.</p>
          </article>
          <article className="card">
            <p className="eyebrow">Prontos</p>
            <h3>{counts.ready_for_enrichment}</h3>
            <p>Itens com destino esperado.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">filtro</p>
            <h2>Recentes, guardados e prontos.</h2>
          </div>
          <p className="section__lead">Filtre rápido por estado ou tipo e siga com um clique para o destino que faz sentido.</p>
        </div>

        <div className="status-filters" aria-label="Filtro por status">
          {(["all", ...editorialEntryStatuses] as const).map((status) => {
            const label =
              status === "all"
                ? `Recentes (${counts.total})`
                : `${editorialEntryStatusLabels[status as EditorialEntryStatus]} (${counts[status]})`;

            return (
              <Link
                key={status}
                href={status === "all" ? "/interno/enriquecer" : `/interno/enriquecer?status=${status}${entryType ? `&tipo=${entryType}` : ""}`}
                className={`status-chip ${statusFilter === status ? "status-chip--active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="status-filters" aria-label="Filtro por tipo">
          {(["all", ...editorialEntryTypes] as const).map((type) => {
            const label = type === "all" ? `Todos os tipos (${typeCounts.total})` : `${editorialEntryTypeLabels[type as EditorialEntryType]} (${typeCounts[type]})`;
            const nextHref = type === "all" ? "/interno/enriquecer" : `/interno/enriquecer?tipo=${type}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`;

            return (
              <Link
                key={type}
                href={nextHref}
                className={`status-chip ${entryType === type ? "status-chip--active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila viva</p>
            <h2>O que está na fila agora.</h2>
          </div>
          <p className="section__lead">Cada cartão mostra o mínimo útil e já oferece o próximo passo, sem abrir outro labirinto interno.</p>
        </div>

        <div className="grid-2">
          {entries.length > 0 ? (
            entries.slice(0, 12).map((entry) => <EnrichmentQueueCard key={entry.id} entry={entry} returnUrl={currentUrl} />)
          ) : (
            <article className="support-box">
              <h3>Sem entradas nesta visão</h3>
              <p>Troque o filtro ou volte para a central de entrada.</p>
            </article>
          )}
        </div>
      </section>
    </Container>
  );
}
