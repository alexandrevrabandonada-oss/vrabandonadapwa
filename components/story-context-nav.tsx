import Link from "next/link";

import type { Materia } from "@/lib/materias";

/** Rotas de leitura que seguem a única URL canônica de cada reportagem. */
export function StoryContextNav({ story }: { story: Materia }) {
  const hasUpdates = Boolean(story.updates?.length);
  const hasPublicReferences = story.sources.some((source) => /^https?:\/\//i.test(source.url));

  return (
    <section className="vr6-story-nav" aria-label="Navegue nesta apuração">
      <div className="vr6-story-nav__heading">
        <strong>Explore esta matéria</strong>
        <span>Texto, contexto, fontes e acompanhamento em um único lugar</span>
      </div>
      <nav className="vr6-story-nav__links" aria-label="Atalhos da reportagem">
        <a href="#texto-da-materia">Ler matéria</a>
        {hasUpdates ? <a href="#atualizacoes-da-materia">Atualizações ({story.updates?.length})</a> : null}
        <a href="#fontes-da-materia">Fontes ({story.sources.length})</a>
        {hasPublicReferences ? <Link href={"/acervo#fontes-" + story.slug}>No acervo ↗</Link> : null}
      </nav>
      {story.territories?.length ? (
        <div className="vr6-story-nav__places">
          <span>Na cidade</span>
          {story.territories.map((place) => (
            <Link key={place.slug} href={"/territorios/" + place.slug}>
              {place.label}{place.role === "mentioned" ? " · citado" : " · foco da matéria"} ↗
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
