import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { TimelineEntryCard } from "@/components/timeline-entry-card";
import { TimelineHighlightCard } from "@/components/timeline-highlight-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedTimelineHighlights, getPublishedTimelineHighlightLinks } from "@/lib/timeline/highlight-queries";
import { getTimelineChronologicalGroups, getTimelinePageData, getTimelineQueryHotTerms } from "@/lib/timeline/queries";
import type { TimelineSortMode } from "@/lib/timeline/types";

export const metadata: Metadata = {
  title: "Linha do tempo",
  description: "Cronologia transversal do VR Abandonada.",
  openGraph: {
    title: "Linha do tempo | VR Abandonada",
    description: "Cronologia transversal do VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linha do tempo | VR Abandonada",
    description: "Cronologia transversal do VR Abandonada.",
    images: [getHomeOpenGraphImagePath()],
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function buildTimelineHref(
  current: { q: string; type: string; territory: string; actor: string; period: string; sort: TimelineSortMode },
  next: Partial<{ q: string; type: string; territory: string; actor: string; period: string; sort: TimelineSortMode }>,
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };

  if (merged.q.trim()) params.set("q", merged.q.trim());
  if (merged.type && merged.type !== "all") params.set("type", merged.type);
  if (merged.territory && merged.territory !== "all") params.set("territory", merged.territory);
  if (merged.actor && merged.actor !== "all") params.set("actor", merged.actor);
  if (merged.period && merged.period !== "all") params.set("period", merged.period);
  if (merged.sort && merged.sort !== "chronological") params.set("sort", merged.sort);

  const query = params.toString();
  return query ? `/linha-do-tempo?${query}` : "/linha-do-tempo";
}

function getSelectOptions(values: Array<{ label: string; count: number }>) {
  return values
    .filter((value) => value.count > 0)
    .slice(0, 10)
    .map((value) => value.label);
}

export default async function TimelinePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const query = firstParam(resolvedSearchParams.q);
  const contentType = firstParam(resolvedSearchParams.type) || "all";
  const territory = firstParam(resolvedSearchParams.territory) || "all";
  const actor = firstParam(resolvedSearchParams.actor) || "all";
  const period = firstParam(resolvedSearchParams.period) || "all";
  const sort = (firstParam(resolvedSearchParams.sort) as TimelineSortMode) || "chronological";

  const data = await getTimelinePageData({ query, contentType, territory, actor, period, sort });
  const curatedHighlights = await getPublishedTimelineHighlights();
  const highlightCounts = new Map(
    await Promise.all(curatedHighlights.slice(0, 4).map(async (highlight) => [highlight.id, (await getPublishedTimelineHighlightLinks(highlight.id)).length] as const)),
  );
  const groups = getTimelineChronologicalGroups(data.entries);
  const hotTerms = getTimelineQueryHotTerms().slice(0, 8);
  const currentParams = { q: query, type: contentType, territory, actor, period, sort };
  const territoryOptions = getSelectOptions(data.facets.territories);
  const actorOptions = getSelectOptions(data.facets.actors);
  const selectedCount = [contentType, territory, actor, period].filter((value) => value && value !== "all").length;

  return (
    <Container className="intro-grid timeline-page">
      <section className="hero hero--split timeline-hero">
        <div className="hero__copy">
          <p className="eyebrow">cronologia transversal</p>
          <h1 className="hero__title">A cidade no tempo.</h1>
          <p className="hero__lead">
            Leia passado, documento, atualização, campanha e impacto como processo contínuo. A linha do tempo atravessa pautas, memória, dossiês, territórios e atores sem virar arquivo morto.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">marcos públicos</span>
            <span className="home-hero__signal">desdobramentos</span>
            <span className="home-hero__signal">presente em curso</span>
          </div>
          <div className="hero__actions">
            <Link href="#marcos-centrais" className="button">
              Ver marcos centrais
            </Link>
            <Link href="/buscar" className="button-secondary">
              Buscar
            </Link>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
            <Link href="/acompanhar" className="button-secondary">
              Acompanhar
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">como usar</p>
          <h2>Entre por ano, por caso ou por responsabilidade.</h2>
          <p>
            Se a cidade parece fragmentada, a cronologia junta as frentes e mostra como os mesmos conflitos voltam com outras formas.
          </p>
          <div className="stack-actions">
            <Link href="/comecar" className="button-secondary">
              Abrir guias
            </Link>
            <Link href="/padroes" className="button-secondary">
              Ver padrões
            </Link>
          </div>
        </article>
      </section>

      <section className="section timeline-toolbar-section">
        <form method="get" className="timeline-toolbar">
          <div className="grid-2 timeline-toolbar__header">
            <div>
              <p className="eyebrow">consulta temporal</p>
              <h2>Filtrar a cidade pelo tempo.</h2>
            </div>
            <p className="section__lead">
              A cronologia cruza {data.total} marco{data.total === 1 ? "" : "s"} públicos entre pautas, memória, acervo, dossiês, campanhas, impactos e frentes estruturais.
            </p>
          </div>

          <div className="timeline-toolbar__fields">
            <label className="field">
              <span>Buscar</span>
              <input type="search" name="q" defaultValue={query} placeholder="CSN, Vila Santa Cecília, acidente, arquivo..." autoComplete="off" />
            </label>

            <label className="field">
              <span>Tipo</span>
              <select name="type" defaultValue={contentType}>
                <option value="all">Todos</option>
                {data.facets.types.map((facet) => (
                  <option key={facet.value} value={facet.value}>
                    {facet.label} ({facet.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Território</span>
              <select name="territory" defaultValue={territory}>
                <option value="all">Todos</option>
                {territoryOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Ator</span>
              <select name="actor" defaultValue={actor}>
                <option value="all">Todos</option>
                {actorOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Período</span>
              <select name="period" defaultValue={period}>
                <option value="all">Todos</option>
                {data.facets.periods.map((facet) => (
                  <option key={facet.value} value={facet.value}>
                    {facet.label} ({facet.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Ordem</span>
              <select name="sort" defaultValue={sort}>
                <option value="chronological">Cronológica</option>
                <option value="recent">Mais recentes</option>
              </select>
            </label>
          </div>

          <div className="timeline-toolbar__actions stack-actions">
            <button type="submit" className="button">
              Atualizar
            </button>
            <Link href="/linha-do-tempo" className="button-secondary">
              Limpar
            </Link>
            {selectedCount ? <span className="pwa-install-status">Filtros ativos: {selectedCount}</span> : null}
          </div>
        </form>
      </section>

      <section className="section timeline-discovery-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">pontos de entrada</p>
            <h2>Quando faltar o termo exato, siga um atalho editorial.</h2>
          </div>
          <p className="section__lead">
            Buscas frequentes e termos editoriais ajudam a encontrar o fio temporal antes de afinar a consulta.
          </p>
        </div>

        <div className="status-filters search-hint-filters">
          {hotTerms.map((term) => (
            <Link key={term} href={buildTimelineHref(currentParams, { q: term })} className={`status-chip ${query === term ? "status-chip--active" : ""}`}>
              {term}
            </Link>
          ))}
        </div>
      </section>

      {curatedHighlights.length ? (
        <section className="section" id="marcos-centrais">
          <div className="grid-2">
            <div>
              <p className="eyebrow">marcos centrais</p>
              <h2>Rupturas, reaparições e consequências que estruturam a cidade.</h2>
            </div>
            <p className="section__lead">Esses marcos curados abrem a linha do tempo por viradas reais, antes de devolver o leitor à cronologia ampla.</p>
          </div>

          <div className="grid-2">
            {curatedHighlights.slice(0, 4).map((highlight) => (
              <TimelineHighlightCard
                key={highlight.id}
                highlight={highlight}
                href={`/linha-do-tempo/marcos/${highlight.slug}`}
                itemCount={highlightCounts.get(highlight.id) ?? 0}
                latestMovement={highlight.lead_question || highlight.description || highlight.excerpt}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section timeline-results-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">linha aberta</p>
            <h2>
              {data.total} resultado{data.total === 1 ? "" : "s"} na cronologia
            </h2>
          </div>
          <p className="section__lead">
            {query
              ? `Mostrando os pontos mais próximos de “${query}” na história pública do VR Abandonada.`
              : "Sem termo definido, a linha se abre de forma cronológica para conectar memória, documento e consequência."}
          </p>
        </div>

        <div className="grid-2 timeline-period-hint-row">
          {data.facets.periods.map((facet) => (
            <Link key={facet.value} href={buildTimelineHref(currentParams, { period: facet.value })} className={`status-chip ${period === facet.value ? "status-chip--active" : ""}`}>
              {facet.label} ({facet.count})
            </Link>
          ))}
        </div>

        {groups.length ? (
          <div className="timeline-groups">
            {groups.map((group) => (
              <section className="timeline-group" key={group.periodKey}>
                <div className="grid-2 timeline-group__header">
                  <div>
                    <p className="eyebrow">{group.label}</p>
                    <h3>{group.entries.length} marco{group.entries.length === 1 ? "" : "s"}</h3>
                  </div>
                  <p className="section__lead">
                    {group.periodKey === "agora"
                      ? "O presente recente, onde campanha, impacto e atualização continuam correndo."
                      : group.periodKey === "sem_data"
                        ? "Entradas que precisam de melhor lastro temporal."
                        : "O período ajuda a ligar origem, permanência e desdobramento."}
                  </p>
                </div>

                <div className="timeline-grid grid-2">
                  {group.entries.map((entry) => (
                    <TimelineEntryCard key={entry.id} entry={entry} query={query} compact />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <article className="support-box search-empty">
            <p className="eyebrow">nenhum resultado</p>
            <h3>Troque o termo ou solte os filtros.</h3>
            <p>
              A cronologia funciona melhor quando você entra por um nome, um lugar ou um ator recorrente. Se quiser, volte para a busca geral e abra o caminho certo.
            </p>
            <div className="stack-actions">
              <Link href="/buscar" className="button">
                Buscar no site
              </Link>
              <Link href="/agora" className="button-secondary">
                Ver radar
              </Link>
              <Link href="/acompanhar" className="button-secondary">
                Acompanhar
              </Link>
            </div>
          </article>
        )}
      </section>

      <section className="section timeline-bridge-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">da cronologia ao acompanhamento</p>
            <h2>O tempo ajuda a decidir o que seguir.</h2>
          </div>
          <p className="section__lead">Leia um marco, salve o conteúdo original e acompanhe a frente mais ampla se o caso pedir retorno recorrente.</p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>Salvar leitura</h3>
            <p>Guarde uma peça específica do tempo para voltar depois no celular.</p>
            <Link href="/salvos" className="button-secondary">
              Abrir salvos
            </Link>
          </article>
          <article className="card">
            <h3>Acompanhar frentes</h3>
            <p>Se o marco apontar um eixo, território ou dossiê, o retorno pode virar acompanhamento local.</p>
            <Link href="/acompanhar" className="button-secondary">
              Abrir acompanhar
            </Link>
          </article>
          <article className="card">
            <h3>Voltar ao agora</h3>
            <p>Se a cronologia te trouxe ao presente, o radar mostra o que está quente neste momento.</p>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </article>
        </div>
      </section>
    </Container>
  );
}
