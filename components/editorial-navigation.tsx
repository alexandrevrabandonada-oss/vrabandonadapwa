import Link from "next/link";

import { EditorialStoryCard } from "@/components/editorial-story-card";

import type { Materia } from "@/lib/materias";
import type { EditorialTerritoryEntry } from "@/lib/territories/editorial";

import "./editorial-navigation.css";

export function EditorialAcervoIndex({ articles }: { articles: Materia[] }) {
  return (
    <section className="vr-index" aria-labelledby="index-acervo-titulo">
      <div className="vr-index__top">
        <div>
          <span className="vr-index__eyebrow">MEMÓRIA JORNALÍSTICA</span>
          <h2 id="index-acervo-titulo">Publicações que não desaparecem.</h2>
          <p>Notícias, investigações e explicações num único índice. Os anexos documentais são uma camada complementar deste acervo.</p>
        </div>
        <span className="vr-index__count">{articles.length} {articles.length === 1 ? "publicação disponível" : "publicações disponíveis"}</span>
      </div>
      <nav className="vr-index__quick" aria-label="Explorar o acervo por formato">
        <Link href="/materias">Todas as matérias</Link>
        <Link href="/materias?tipo=news">Notícias</Link>
        <Link href="/materias?tipo=investigation">Investigações</Link>
        <Link href="/territorios">Por bairro</Link>
        <Link href="/buscar">Buscar tudo</Link>
      </nav>
      {articles.length ? (
        <div className="vr-index__items">
          {articles.slice(0, 8).map((article) => (
            <EditorialStoryCard key={article.slug} article={article} showMainPlaces actionLabel="Abrir publicação" />
          ))}
        </div>
      ) : <p>As matérias verificadas aparecerão aqui depois da aprovação editorial. Nenhum registro fictício é exibido.</p>}
      {articles.length > 8 && <Link className="vr-index__more" href="/materias">Ver todas as {articles.length} publicações ↗</Link>}
    </section>
  );
}

export function EditorialTerritoryIndex({ territories }: { territories: EditorialTerritoryEntry[] }) {
  if (!territories.length) return null;
  return (
    <section className="vr-index" aria-labelledby="index-bairros-titulo">
      <div className="vr-index__top">
        <div>
          <span className="vr-index__eyebrow">VOLTA REDONDA · LEITURA POR BAIRRO</span>
          <h2 id="index-bairros-titulo">Bairros presentes na cobertura.</h2>
          <p>As páginas surgem das matérias aprovadas. Um bairro pode ser local principal de uma reportagem ou apenas mencionado — os papéis não são confundidos.</p>
        </div>
        <span className="vr-index__count">{territories.length} localidade{territories.length === 1 ? "" : "s"}</span>
      </div>
      <div className="vr-index__territories">
        {territories.map((place) => (
          <Link key={place.slug} href={"/territorios/" + place.slug} className="vr-index__territory vr7-editorial-card">
            <span className="vr-index__eyebrow">COBERTURA LOCAL</span>
            <strong>{place.label}</strong>
            <span>{place.main.length} {place.main.length === 1 ? "matéria principal" : "matérias principais"} · {place.mentioned.length} {place.mentioned.length === 1 ? "menção contextual" : "menções contextuais"}</span>
            <span className="vr-index__territory-cta">Explorar bairro ↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function EditorialTerritoryFeed({ place }: { place: EditorialTerritoryEntry }) {
  const sections: Array<{title: string; items: Materia[]; label: string}> = [
    { title: "Notícias e investigações deste lugar", items: place.main, label: "LOCAL PRINCIPAL" },
    { title: "Outras matérias que mencionam o bairro", items: place.mentioned, label: "MENÇÃO CONTEXTUAL" },
  ];
  return (
    <section className="vr-index" aria-labelledby={"territory-feed-" + place.slug}>
      <div className="vr-index__top">
        <div>
          <span className="vr-index__eyebrow">COBERTURA COM FONTES</span>
          <h2 id={"territory-feed-" + place.slug}>O que publicamos sobre {place.label}.</h2>
          <p>Esta seleção é gerada a partir das matérias verificadas. Uma menção ao lugar não significa que episódios distintos estejam relacionados.</p>
        </div>
      </div>
      {sections.map((group) => group.items.length ? (
        <div key={group.label} className="vr-index__group">
          <h3>{group.title}</h3>
          <div className="vr-index__items">
            {group.items.map((article) => (
              <EditorialStoryCard
                key={article.slug}
                article={article}
                headingLevel={4}
                contextLabel={group.label}
              />
            ))}
          </div>
        </div>
      ) : null)}
      <nav className="vr-index__quick" aria-label="Próximos passos no acervo">
        <Link href="/territorios">Todos os bairros</Link>
        <Link href="/acervo">Acervo geral</Link>
        <Link href="/noticias">Últimas notícias</Link>
      </nav>
    </section>
  );
}
