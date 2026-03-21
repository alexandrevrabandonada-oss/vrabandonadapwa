import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { EntryCentralForm } from "@/components/entry-central-form";
import { EntryCentralReviewCard } from "@/components/entry-central-review-card";
import { EntryCentralTypeCard } from "@/components/entry-central-type-card";
import { signOutAction } from "@/app/interno/actions";
import { entryTypeConfig } from "@/lib/entrada/navigation";
import { getInternalEditorialEntries, getInternalEditorialEntryCounts, getInternalEditorialTypeCounts } from "@/lib/entrada/queries";
import { editorialEntryStatusLabels, editorialEntryStatuses, editorialEntryTypeLabels, editorialEntryTypes, type EditorialEntryStatus, type EditorialEntryType } from "@/lib/entrada/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Central de entrada",
  description: "Porta única para subir conteúdo em passos curtos.",
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

export default async function EntradaPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const tipo = firstParam(resolvedSearchParams.tipo);
  const statusFilterInput = firstParam(resolvedSearchParams.status) || "all";
  const entryType = isEntryType(tipo) ? tipo : null;
  const statusFilter = isStatusFilter(statusFilterInput) ? statusFilterInput : "all";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const [entries, counts, typeCounts] = await Promise.all([
    getInternalEditorialEntries({ status: statusFilter }),
    getInternalEditorialEntryCounts(),
    getInternalEditorialTypeCounts(),
  ]);

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">entrada simplificada</p>
        <h1 className="hero__title">Uma porta, três entradas.</h1>
        <p className="hero__lead">
          Suba o mínimo agora. Depois você liga, enriquece e decide a camada certa sem travar a entrada.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/interno/enriquecer" className="button-secondary">Abrir enriquecimento</Link>
          <Link href="/interno/intake" className="button-secondary">Ver fila pública</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como funciona</p>
            <h2>Etapa 1 guarda o mínimo. Etapa 2 enriquece depois.</h2>
          </div>
          <p className="section__lead">
            A central reduz a decisão inicial para que você consiga subir conteúdo mesmo sobrecarregado.
          </p>
        </div>

        <div className="grid-3">
          {editorialEntryTypes.map((entryTypeItem) => (
            <EntryCentralTypeCard
              key={entryTypeItem}
              entryType={entryTypeItem}
              config={entryTypeConfig[entryTypeItem]}
              href={`/interno/entrada?tipo=${entryTypeItem}`}
              active={entryType === entryTypeItem}
            />
          ))}
        </div>
      </section>

      {entryType ? (
        <section className="section internal-panel" id="formulario">
          <div className="grid-2">
            <div>
              <p className="eyebrow">fluxo rápido</p>
              <h2>{editorialEntryTypeLabels[entryType]}</h2>
            </div>
            <p className="section__lead">Escolha o mínimo agora e deixe o enriquecimento para a fila de revisão.</p>
          </div>

          <div className="grid-2" style={{ alignItems: "start" }}>
            <EntryCentralForm entryType={entryType} />
            <article className="support-box">
              <p className="eyebrow">etapa 2</p>
              <h3>Depois de guardar</h3>
              <p>
                O item entra como rascunho, guardado ou pronto para enriquecer. Depois você decide se ele vira Agora, Acervo, Memória ou algo maior.
              </p>
              <div className="stack-actions">
                <Link href="/interno/entrada" className="button-secondary">Voltar à central</Link>
                <Link href="/interno/enriquecer" className="button-secondary">Ir para etapa 2</Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">painel de revisão</p>
            <h2>O que entrou e ainda pede tratamento.</h2>
          </div>
          <p className="section__lead">
            A fila curta ajuda a ver o que já está guardado, o que precisa de enriquecimento e o que está pronto para seguir.
          </p>
        </div>

        <div className="status-filters" aria-label="Filtro por status">
          {(["all", ...editorialEntryStatuses] as const).map((status) => {
            const label =
              status === "all"
                ? `Tudo (${counts.total})`
                : `${editorialEntryStatusLabels[status as EditorialEntryStatus]} (${counts[status]})`;
            return (
              <Link
                key={status}
                href={status === "all" ? "/interno/entrada" : `/interno/entrada?status=${status}${entryType ? `&tipo=${entryType}` : ""}`}
                className={`status-chip ${statusFilter === status ? "status-chip--active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="grid-3">
          {editorialEntryTypes.map((type) => (
            <article key={type} className="card">
              <p className="eyebrow">{editorialEntryTypeLabels[type]}</p>
              <h3>{typeCounts[type]}</h3>
              <p>Entradas registradas nesta forma.</p>
            </article>
          ))}
        </div>

        <div className="grid-2">
          {entries.length > 0 ? (
            entries.slice(0, 8).map((entry) => <EntryCentralReviewCard key={entry.id} entry={entry} />)
          ) : (
            <article className="support-box">
              <h3>Sem entradas nesta visão</h3>
              <p>Use outro filtro ou comece por um dos três caminhos.</p>
            </article>
          )}
        </div>
      </section>
    </Container>
  );
}
