import Link from "next/link";

import type { Materia } from "@/lib/materias";

/**
 * Índice documental de links publicados. Não significa posse do arquivo,
 * verificação da disponibilidade atual nem autorização para reproduzi-lo.
 */
export function EditorialSourceIndex({ articles }: { articles: Materia[] }) {
  const groups = articles.map((article) => {
    const seen = new Set<string>();
    const sources = article.sources.filter((source) => {
      if (!/^https?:\/\//i.test(source.url) || seen.has(source.url)) return false;
      seen.add(source.url);
      return true;
    });
    return { article, sources };
  }).filter((group) => group.sources.length > 0);

  if (!groups.length) return null;
  const sourceCount = groups.reduce((total, group) => total + group.sources.length, 0);

  return (
    <section className="vr6-section vr6-sources" id="fontes-reportagens" aria-labelledby="vr6-sources-title">
      <header className="vr6-section__head">
        <div>
          <p className="vr6-eyebrow">TRANSPARÊNCIA DA APURAÇÃO</p>
          <h2 id="vr6-sources-title">Fontes citadas</h2>
          <p>Referências públicas usadas em reportagens aprovadas. Os links levam aos sites de origem, não a cópias hospedadas aqui.</p>
        </div>
        <span className="vr6-count">{sourceCount} {sourceCount === 1 ? "referência" : "referências"}</span>
      </header>
      <div className="vr6-source-groups">
        {groups.map(({ article, sources }) => (
          <details className="vr6-source-group" key={article.slug} id={"fontes-" + article.slug}>
            <summary>
              <span className="vr6-source-group__heading">{article.title}</span>
              <span className="vr6-source-group__count">{sources.length} {sources.length === 1 ? "fonte" : "fontes"} · Abrir lista</span>
            </summary>
            <div className="vr6-source-group__body">
              <Link className="vr6-story-link" href={"/materias/" + article.slug}>Ler a reportagem e conferir o contexto ↗</Link>
              <ol>
                {sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>
                    <span>Fonte externa{source.consultedAt ? " · consulta registrada: " + source.consultedAt : ""}</span>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
