import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { getSearchHotTerms, searchPublicContent } from "@/lib/search/index";
import type { SearchSortMode } from "@/lib/search/types";

export const metadata: Metadata = {
  title: "Buscar notícias, documentos e investigações",
  description: "Pesquise matérias, documentos públicos, bairros, pessoas e investigações do VR Abandonada sobre Volta Redonda.",
  alternates: { canonical: "/buscar" },
  openGraph: { title: "Buscar | VR Abandonada", description: "Encontre notícias, documentos e investigações sobre Volta Redonda.", url: "/buscar", type: "website" },
};

type SearchParams = Record<string, string | string[] | undefined>;
function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
function termHref(term: string) { return "/buscar?q=" + encodeURIComponent(term); }

export default async function BuscarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = first(params.q).trim().slice(0, 160);
  const type = first(params.type) || "all";
  const territory = first(params.territory) || "all";
  const actor = first(params.actor) || "all";
  const sort: SearchSortMode = first(params.sort) === "recent" ? "recent" : query ? "relevant" : "recent";
  const results = await searchPublicContent({ query, contentType: type, territory, actor, sort });
  const suggestions = Array.from(new Set(getSearchHotTerms().map((term) => term.trim()).filter(Boolean))).slice(0, 5);
  const selectedFilters = [type, territory, actor].filter((value) => value !== "all").length;
  const hasFilters = selectedFilters > 0 || first(params.sort) === "recent" && !!query;
  const territories = results.facets.territories.filter((item) => item.count > 0).slice(0, 15);
  const actors = results.facets.actors.filter((item) => item.count > 0).slice(0, 15);
  const label = query ? "Busca por “" + query + "”" : "Itens disponíveis no acervo";

  return (
    <Container className="vr3-search">
      <header className="vr3-search__intro">
        <span className="vr2-eyebrow">ACERVO PÚBLICO · VOLTA REDONDA</span>
        <h1>O que você procura?</h1>
        <p>Pesquise notícias, documentos, investigações e bairros em um único lugar.</p>
      </header>
      <section className="vr3-search__search" aria-label="Pesquisar no VR Abandonada">
        <form action="/buscar" method="get" role="search">
          <label htmlFor="vr3-search-q">Digite um assunto, nome, bairro ou documento</label>
          <div className="vr3-search__input-row">
            <input id="vr3-search-q" type="search" name="q" defaultValue={query}
              placeholder="Ex.: CSN, Rua 33, saúde" maxLength={160}
              enterKeyHint="search" autoComplete="off" />
            <button type="submit">Buscar <span aria-hidden="true">↗</span></button>
          </div>
          <details className="vr3-search__filters" open={hasFilters}>
            <summary>Refinar pesquisa {selectedFilters ? "· " + selectedFilters + (selectedFilters === 1 ? " filtro" : " filtros") : ""}</summary>
            <div className="vr3-search__fields">
              <label>Tipo
                <select name="type" defaultValue={type}>
                  <option value="all">Todos os tipos</option>
                  {results.facets.types.map((facet) => <option key={facet.value} value={facet.value}>{facet.label} ({facet.count})</option>)}
                  {type !== "all" && !results.facets.types.some((facet) => facet.value === type) ? <option value={type}>{type}</option> : null}
                </select>
              </label>
              <label>Território
                <select name="territory" defaultValue={territory}>
                  <option value="all">Todos os territórios</option>
                  {territories.map((facet) => <option key={facet.value} value={facet.value}>{facet.label}</option>)}
                  {territory !== "all" && !territories.some((facet) => facet.value === territory) ? <option value={territory}>{territory}</option> : null}
                </select>
              </label>
              <label>Ator
                <select name="actor" defaultValue={actor}>
                  <option value="all">Todos os atores</option>
                  {actors.map((facet) => <option key={facet.value} value={facet.value}>{facet.label}</option>)}
                  {actor !== "all" && !actors.some((facet) => facet.value === actor) ? <option value={actor}>{actor}</option> : null}
                </select>
              </label>
              <label>Ordenar
                <select name="sort" defaultValue={sort}>
                  <option value="relevant">Mais relevantes</option>
                  <option value="recent">Mais recentes</option>
                </select>
              </label>
            </div>
            <div className="vr3-search__filter-actions">
              <button type="submit">Aplicar filtros</button>
              <Link href="/buscar">Limpar tudo</Link>
            </div>
          </details>
        </form>
        {!query && suggestions.length > 0 ? (
          <div className="vr3-search__suggestions" aria-label="Sugestões de busca">
            <span>Temas para pesquisar</span>
            <div>{suggestions.map((term) => <Link href={termHref(term)} key={term}>{term}</Link>)}</div>
          </div>
        ) : null}
      </section>
      <section className="vr3-search__results" aria-labelledby="vr3-search-results">
        <div className="vr3-search__results-title">
          <div><span className="vr2-eyebrow">{label}</span>
            <h2 id="vr3-search-results">{results.total} {results.total === 1 ? "resultado" : "resultados"}</h2>
          </div>
          {query || selectedFilters ? <Link href="/buscar">Nova pesquisa ↗</Link> : null}
        </div>
        {results.results.length ? (
          <div className="vr3-search__list">
            {results.results.slice(0, 30).map((item) => (
              <article className="vr3-search__item" key={item.id}>
                <div className="vr2-meta"><span>{item.kindLabel}</span>{item.territoryLabel ? <span>{item.territoryLabel}</span> : null}</div>
                <h3><Link href={item.href}>{item.title}</Link></h3>
                {item.excerpt ? <p>{item.excerpt}</p> : null}
                <Link className="vr2-readmore" href={item.href}>Abrir no acervo ↗</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="vr3-search__empty" role="status">
            <h3>{query || selectedFilters ? "Nenhuma publicação encontrada com estes filtros." : "O acervo de publicações está sendo organizado."}</h3>
            <p>{query || selectedFilters
              ? "Tente outra palavra, retire um filtro ou confira as publicações que já estão disponíveis nas redes."
              : "Aqui aparecerão somente matérias e documentos públicos reais. Nossas publicações já divulgadas continuam disponíveis no Instagram."}</p>
            <div className="vr3-search__empty-links">
              {query || selectedFilters ? <Link href="/buscar">Limpar pesquisa ↗</Link> : null}
              <a href="https://www.instagram.com/vr_abandonada/" target="_blank" rel="noopener noreferrer">Acompanhar Instagram ↗</a>
            </div>
          </div>
        )}
      </section>
    </Container>
  );
}
