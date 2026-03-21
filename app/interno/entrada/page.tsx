import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { EntryCentralForm } from "@/components/entry-central-form";
import { InternalPriorityBoard } from "@/components/internal-priority-board";
import { EntryCentralReviewCard } from "@/components/entry-central-review-card";
import { EntryCentralTypeCard } from "@/components/entry-central-type-card";
import { entryTypeConfig } from "@/lib/entrada/navigation";
import { getInternalEditorialEntries, getInternalEditorialEntryCounts, getInternalEditorialTypeCounts } from "@/lib/entrada/queries";
import { editorialEntryStatuses, editorialEntryTypeLabels, editorialEntryTypes, type EditorialEntryStatus, type EditorialEntryType } from "@/lib/entrada/types";
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

  const resolvedCount = counts.enriched + counts.linked + counts.published;

  return (
    <Container className="intro-grid internal-page internal-page--operator">
      <section className="hero internal-hero internal-hero--operator">
        <p className="eyebrow">modo operador</p>
        <h1 className="hero__title">Entrada rápida.</h1>
        <p className="hero__lead">
          Suba o mínimo agora. Depois você liga, enriquece e decide a camada certa sem travar a entrada.
        </p>
        <div className="hero__actions">
          <Link href="/interno/enriquecer" className="button-secondary">
            Ir para enriquecimento
          </Link>
          <Link href="/interno/intake" className="button-secondary">
            Ver intake
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4 internal-operator-metrics">
          <article className="card internal-operator-metric internal-operator-metric--hot">
            <p className="eyebrow">urgentes</p>
            <h3>{counts.draft + counts.stored}</h3>
            <p>Itens que pedem decisão.</p>
          </article>
          <article className="card internal-operator-metric internal-operator-metric--watch">
            <p className="eyebrow">prontos</p>
            <h3>{counts.ready_for_enrichment}</h3>
            <p>Itens para enriquecer.</p>
          </article>
          <article className="card internal-operator-metric internal-operator-metric--calm">
            <p className="eyebrow">fechados</p>
            <h3>{resolvedCount}</h3>
            <p>Itens já amarrados.</p>
          </article>
          <article className="card internal-operator-metric internal-operator-metric--muted">
            <p className="eyebrow">arquivo</p>
            <h3>{counts.archived}</h3>
            <p>Itens guardados.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">três portas</p>
            <h2>Escolha a entrada mínima agora.</h2>
          </div>
          <p className="section__lead">
            Cada porta reduz a decisão inicial. Depois você aprofunda onde fizer sentido.
          </p>
        </div>

        <div className="grid-3 internal-operator-strip">
          {editorialEntryTypes.map((entryTypeItem) => (
            <EntryCentralTypeCard
              key={entryTypeItem}
              entryType={entryTypeItem}
              config={entryTypeConfig[entryTypeItem]}
              href={`/interno/entrada?tipo=${entryTypeItem}`}
              count={typeCounts[entryTypeItem]}
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
                <Link href="/interno/entrada" className="button-secondary">
                  Voltar à central
                </Link>
                <Link href="/interno/enriquecer" className="button-secondary">
                  Ir para etapa 2
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <InternalPriorityBoard
        entries={entries}
        title="O que precisa de ação agora."
        lead="A fila separa o que está frio, o que está pronto e o que já saiu rápido mas ainda pede revisão."
      />

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">últimas entradas</p>
            <h2>O que entrou por último.</h2>
          </div>
          <p className="section__lead">As últimas movimentações ficam aqui para você retomar sem refazer a leitura.</p>
        </div>

        <div className="grid-2">
          {entries.length > 0 ? (
            entries.slice(0, 6).map((entry) => <EntryCentralReviewCard key={entry.id} entry={entry} />)
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


