import Link from "next/link";

import { Container } from "@/components/container";
import { getPublishedTimelineEntries, getTimelineDateBasisCount, getTimelineFeaturedEntries, getTimelinePageData } from "@/lib/timeline/queries";
import { getTimelineDateBasisLabel } from "@/lib/timeline/navigation";

export default async function CronologiaInternaPage() {
  const entries = await getPublishedTimelineEntries();
  const pageData = await getTimelinePageData({ query: "", contentType: "all", territory: "all", actor: "all", period: "all", sort: "chronological" });
  const featured = getTimelineFeaturedEntries(entries, 4);
  const historical = getTimelineDateBasisCount(entries, "historical");
  const approximate = getTimelineDateBasisCount(entries, "approximate");
  const editorial = getTimelineDateBasisCount(entries, "editorial");
  const operational = getTimelineDateBasisCount(entries, "operational");
  const unknown = getTimelineDateBasisCount(entries, "unknown");

  const weakDateEntries = entries.filter((entry) => entry.dateBasis === "editorial" || entry.dateBasis === "operational" || entry.dateBasis === "unknown").slice(0, 8);

  return (
    <Container className="intro-grid internal-timeline-page">
      <section className="section editorial-detail-hero">
        <div className="editorial-hero__copy">
          <p className="eyebrow">cronologia interna</p>
          <h1>Diagnóstico da linha do tempo.</h1>
          <p className="hero__lead">
            Esta área ajuda a ver onde a cronologia tem lastro histórico forte e onde ainda depende de data editorial, operacional ou aproximada.
          </p>
          <div className="hero__actions">
            <Link href="/linha-do-tempo" className="button">
              Abrir cronologia pública
            </Link>
            <Link href="/buscar" className="button-secondary">
              Buscar no site
            </Link>
            <Link href="/agora" className="button-secondary">
              Ver radar
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">resumo</p>
          <h2>{pageData.total} marcos públicos</h2>
          <p>
            {historical} históricos, {approximate} aproximados, {editorial} editoriais, {operational} operacionais e {unknown} sem lastro forte.
          </p>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">marcos destacados</p>
            <h2>O que vale revisão editorial primeiro.</h2>
          </div>
          <p className="section__lead">Os marcos destacados ajudam a entender o que já está pronto para leitura recorrente.</p>
        </div>

        <div className="grid-2">
          {featured.map((entry) => (
            <article className="card" key={entry.id}>
              <span className="pill">{entry.kindLabel}</span>
              <h3>{entry.title}</h3>
              <p>{entry.excerpt || entry.title}</p>
              <p className="saved-read-card__meta">{entry.dateLabel || entry.periodLabel}</p>
              <Link href={entry.timelineHref} className="button-secondary">
                Abrir marco
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lastro temporal</p>
            <h2>Onde o tempo está mais firme e onde precisa ser tratado como leitura editorial.</h2>
          </div>
          <p className="section__lead">O diagnóstico não bloqueia publicação. Ele ajuda a priorizar revisão e contextualização.</p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>{historical}</h3>
            <p>{getTimelineDateBasisLabel("historical")}</p>
          </article>
          <article className="card">
            <h3>{approximate}</h3>
            <p>{getTimelineDateBasisLabel("approximate")}</p>
          </article>
          <article className="card">
            <h3>{unknown}</h3>
            <p>{getTimelineDateBasisLabel("unknown")}</p>
          </article>
        </div>
      </section>

      {weakDateEntries.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">itens para revisão</p>
              <h2>Entradas que dependem de data editorial ou operacional.</h2>
            </div>
            <p className="section__lead">Se um marco temporal importante ainda não tem data histórica, ele aparece aqui para receber melhor lastro no futuro.</p>
          </div>

          <div className="grid-2">
            {weakDateEntries.map((entry) => (
              <article className="support-box" key={entry.id}>
                <p className="eyebrow">{entry.kindLabel}</p>
                <h3>{entry.title}</h3>
                <p>{entry.excerpt || entry.title}</p>
                <div className="meta-row">
                  <span>{entry.periodLabel}</span>
                  <span>{entry.dateLabel || "sem data"}</span>
                </div>
                <Link href={entry.contentHref} className="button-secondary">
                  Abrir conteúdo
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próxima ação</p>
            <h2>Quando o tempo aponta recorrência, continue no acompanhamento.</h2>
          </div>
          <p className="section__lead">O valor da cronologia cresce quando ela leva de volta a dossiês, campanhas, territórios e atores.</p>
        </div>

        <div className="stack-actions">
          <Link href="/acompanhar" className="button-secondary">
            Abrir acompanhar
          </Link>
          <Link href="/salvos" className="button-secondary">
            Ver salvos
          </Link>
          <Link href="/linha-do-tempo" className="button-secondary">
            Ver cronologia pública
          </Link>
        </div>
      </section>
    </Container>
  );
}


