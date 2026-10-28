import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedPlaceHubLinks, getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPlaceHubPlaceTypeLabel, getPlaceHubStatusLabel } from "@/lib/territories/navigation";

export const metadata: Metadata = {
  title: "Bairros e lugares",
  description: "Consulte a cobertura do VR Abandonada por bairro e lugar de Volta Redonda.",
  alternates: { canonical: "/territorios" },
  openGraph: {
    title: "Bairros e lugares | VR Abandonada",
    description: "A cidade pelo lugar: notícias, documentos e investigações ligados aos bairros de Volta Redonda.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function TerritoriesPage() {
  const places = await getPublishedPlaceHubs();
  const pairs = await Promise.all(places.map(async (place) => [place.id, await getPublishedPlaceHubLinks(place.id)] as const));
  const counts = new Map(pairs.map(([id, links]) => [id, links.length]));
  const orderedPlaces = [...places].sort((a, b) => {
    const rank = (place: typeof a) => place.status === "active" ? 0 : place.status === "monitoring" ? 1 : 2;
    return rank(a) - rank(b) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.title.localeCompare(b.title, "pt-BR");
  });

  return (
    <Container className="vr4-index vr4-territories">
      <header className="vr4-index__header">
        <p className="vr2-eyebrow">A CIDADE POR ONDE A VIDA ACONTECE</p>
        <h1>Bairros e lugares</h1>
        <p>Encontre notícias, investigações e documentos ligados aos lugares de Volta Redonda.</p>
        <form className="vr4-quick-search" action="/buscar" method="get" role="search">
          <label htmlFor="vr4-territory-search">Qual bairro ou lugar você procura?</label>
          <div>
            <input id="vr4-territory-search" type="search" name="q" maxLength={100} placeholder="Vila Brasília, Água Limpa, Aterrado..." />
            <button type="submit">Pesquisar</button>
          </div>
        </form>
      </header>

      <section id="territorios-ativos" className="vr4-index__section" aria-labelledby="vr4-territory-title">
        <div className="vr4-index__section-heading">
          <h2 id="vr4-territory-title">Lugares publicados</h2>
          <span>{orderedPlaces.length} {orderedPlaces.length === 1 ? "lugar" : "lugares"}</span>
        </div>
        {orderedPlaces.length > 0 ? (
          <div className="vr4-item-list">
            {orderedPlaces.map((place) => (
              <article className="vr4-item" key={place.id}>
                <div className="vr4-item__meta">
                  <span>{getPlaceHubStatusLabel(place.status)}</span>
                  <span>{getPlaceHubPlaceTypeLabel(place.place_type)}</span>
                  {place.territory_label ? <span>{place.territory_label}</span> : null}
                </div>
                <h3><Link href={"/territorios/" + place.slug}>{place.title}</Link></h3>
                <p>{place.excerpt || place.description || place.lead_question}</p>
                <div className="vr4-item__bottom">
                  <span>{counts.get(place.id) ?? 0} {(counts.get(place.id) ?? 0) === 1 ? "material relacionado" : "materiais relacionados"}</span>
                  <Link href={"/territorios/" + place.slug}>Explorar lugar ↗</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="vr4-empty">
            <strong>As páginas de bairros ainda estão sendo organizadas.</strong>
            <p>Isso não significa que o tema não tenha cobertura. Pesquise o bairro acima para encontrar as matérias já publicadas.</p>
            <Link href="/agora">Ver notícias recentes ↗</Link>
          </div>
        )}
      </section>

      <nav className="vr4-index__related" aria-label="Continue explorando a cidade">
        <Link href="/agora">Últimas notícias ↗</Link>
        <Link href="/dossies">Investigações ↗</Link>
        <Link href="/acervo">Documentos e fontes ↗</Link>
      </nav>
    </Container>
  );
}
