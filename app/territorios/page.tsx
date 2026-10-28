import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { EditorialHubIntro } from "@/components/editorial-hub-intro";
import { EditorialTerritoryIndex } from "@/components/editorial-navigation";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedEditorialTerritories } from "@/lib/territories/editorial";
import { getPlaceHubStatusLabel } from "@/lib/territories/navigation";
import { getPublishedPlaceHubLinks, getPublishedPlaceHubs } from "@/lib/territories/queries";

export const metadata: Metadata = {
  title: "Bairros e lugares",
  description: "Notícias, reportagens e documentos organizados pelos bairros citados e investigados em Volta Redonda.",
  alternates: { canonical: "/territorios" },
  openGraph: {
    type: "website",
    title: "Bairros e lugares | VR Abandonada",
    description: "Consulte o jornalismo publicado por bairro de Volta Redonda, sem presumir ligações entre episódios.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function TerritoriesPage() {
  const [territories, editorialTerritories] = await Promise.all([
    getPublishedPlaceHubs(),
    getPublishedEditorialTerritories(),
  ]);
  const hubSlugs = new Set(territories.map((hub) => hub.slug));
  // Não duplicar o bairro que já possui hub próprio: o detalhamento do hub
  // incorpora as matérias editoriais do mesmo lugar.
  const newEditorialPlaces = editorialTerritories.filter((place) => !hubSlugs.has(place.slug));
  const countPairs = await Promise.all(territories.map(async (hub) => [hub.id, (await getPublishedPlaceHubLinks(hub.id)).length] as const));
  const linkCount = new Map(countPairs);
  const orderedHubs = [...territories].sort((a, b) =>
    Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
    a.title.localeCompare(b.title, "pt-BR"),
  );

  return (
    <Container className="vr6-hub territories-page">
      <EditorialHubIntro
        kicker="VOLTA REDONDA · JORNALISMO POR BAIRRO"
        title="A cidade, lugar por lugar."
        description="Parta de um bairro e encontre a cobertura relacionada. Um local citado não é necessariamente o local principal do acontecimento."
        navigationLabel="Explorar bairros"
        links={[
          ...(newEditorialPlaces.length > 0 ? [{ href: "#index-bairros-titulo", label: "Bairros nas reportagens" }] : []),
          ...(territories.length > 0 ? [{ href: "#lugares-documentados", label: "Lugares documentados" }] : []),
          { href: "/buscar", label: "Pesquisar a cidade ↗" },
          { href: "/noticias", label: "Notícias ↗" },
        ]}
      />

      <EditorialTerritoryIndex territories={newEditorialPlaces} />

      {territories.length > 0 ? (
        <section className="vr6-hub__section" id="lugares-documentados" aria-labelledby="vr6-hubs-title">
          <p className="vr6-eyebrow">PÁGINAS TERRITORIAIS PUBLICADAS</p>
          <h2 id="vr6-hubs-title">Lugares documentados</h2>
          <div className="vr6-hub__grid">
            {orderedHubs.map((hub) => (
              <article className="vr6-territory-card" key={hub.id}>
                <div className="vr6-territory-card__meta">
                  <span>{getPlaceHubStatusLabel(hub.status)}</span>
                  <span>{linkCount.get(hub.id) ?? 0} {(linkCount.get(hub.id) ?? 0) === 1 ? "material" : "materiais"} vinculados</span>
                </div>
                <h3><Link href={"/territorios/" + hub.slug}>{hub.title}</Link></h3>
                <p>{hub.excerpt || hub.description || hub.lead_question}</p>
                <Link className="vr6-territory-card__link" href={"/territorios/" + hub.slug}>Explorar este lugar ↗</Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {territories.length === 0 && editorialTerritories.length === 0 ? (
        <div className="vr6-empty-note">
          As páginas de bairros estão em preparação. Pesquise pelo nome de um lugar ou acompanhe as <Link href="/noticias">notícias</Link>.
        </div>
      ) : null}

      <nav className="vr6-hub__end-links" aria-label="Outros caminhos de leitura">
        <Link href="/noticias">Notícias ↗</Link>
        <Link href="/dossies">Investigações ↗</Link>
        <Link href="/acervo">Documentos e fontes ↗</Link>
        <Link href="/buscar?q=Vila%20Bras%C3%ADlia">Buscar Vila Brasília ↗</Link>
      </nav>
    </Container>
  );
}
