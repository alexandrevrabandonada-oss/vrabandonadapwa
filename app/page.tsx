import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { EditorialHero } from "@/components/editorial-hero";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { site } from "@/lib/site";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function HomePage() {
  const items = await getPublishedEditorialItems();
  const featuredItem = items[0] ?? null;
  const secondaryItems = items.slice(1, 4);
  const seriesCards = getEditorialSeriesCards(items);
  const featuredSeries = seriesCards.slice(0, 4);

  return (
    <Container className="intro-grid landing-page">
      <section className="hero hero--split landing-hero">
        <div className="hero__copy landing-hero__copy">
          <p className="eyebrow">{site.hero.kicker}</p>
          <h1 className="hero__title">{site.hero.title}</h1>
          <p className="hero__lead">{site.hero.lead}</p>

          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">arquivo vivo</span>
            <span className="home-hero__signal">denúncia com contexto</span>
            <span className="home-hero__signal">organização popular</span>
          </div>

          <div className="hero__actions">
            {site.hero.ctas.map((cta, index) =>
              index === 0 ? (
                <Link key={cta.href} href={cta.href} className="button">
                  {cta.label}
                </Link>
              ) : (
                <Link key={cta.href} href={cta.href} className="button-secondary">
                  {cta.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <EditorialCover
          title={site.hero.title}
          primaryTag="arquivo vivo"
          seriesTitle="VR Abandonada"
          coverImageUrl="/editorial/covers/arquivo-inicial.svg"
          coverVariant="night"
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">O que é o VR Abandonada</p>
            <h2>Uma casa digital para memória, denúncia e organização popular.</h2>
          </div>
          <p className="section__lead">
            O projeto existe para reunir arquivo, pauta e apoio numa mesma casa editorial.
            Ele documenta o que a cidade vive, o que tentam esconder e o que precisa virar ação pública.
          </p>
        </div>

        <div className="grid-3">
          {site.principles.map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {featuredItem ? (
        <section className="section home-featured-wrap">
          <div className="grid-2">
            <div>
              <p className="eyebrow">Pauta principal</p>
              <h2>Radar editorial em destaque.</h2>
            </div>
            <p className="section__lead">
              O destaque da vez abre caminho para a leitura e puxa o restante do arquivo sem virar feed solto.
            </p>
          </div>
          <EditorialHero item={featuredItem} />
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Pautas em sequência</p>
            <h2>Mais leituras que mantêm o fio puxado.</h2>
          </div>
          <p className="section__lead">
            As pautas abaixo entram como continuidade do arquivo e funcionam melhor quando lidas em conjunto.
          </p>
        </div>

        <div className="grid-3">
          {(secondaryItems.length ? secondaryItems : items.slice(0, 3)).map((item) => (
            <EditorialCard key={item.id} item={item} href={`/pautas/${item.slug}`} compact />
          ))}
        </div>`r`n        <div className="stack-actions">`r`n          <Link href="/memoria" className="button-secondary">`r`n            Entrar no arquivo vivo`r`n          </Link>`r`n        </div>`r`n      </section>`r`n`r`n      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Eixos editoriais</p>
            <h2>Uma navegação pública por conflito, memória e território.</h2>
          </div>
          <p className="section__lead">
            Os eixos ajudam a entender que a página não é um acúmulo de posts. Ela organiza disputa, contexto e recorrência.
          </p>
        </div>

        <div className="grid-4">
          {site.editorialAxes.map((item) => (
            <article className="card" key={item.title}>
              <span className="pill">Eixo</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>`r`n        <div className="stack-actions">`r`n          <Link href="/memoria" className="button-secondary">`r`n            Entrar no arquivo vivo`r`n          </Link>`r`n        </div>`r`n      </section>`r`n`r`n      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Séries em evidência</p>
            <h2>Linhas de investigação com continuidade visual.</h2>
          </div>
          <p className="section__lead">
            Cada série dá corpo ao arquivo e ajuda a ler o projeto como método, não como coleção de peças isoladas.
          </p>
        </div>

        <div className="series-grid landing-series-grid">
          {featuredSeries.map((series) => (
            <article className="series-card landing-series-card" key={series.slug}>
              <EditorialCover
                title={series.title}
                primaryTag="Série"
                seriesTitle={series.title}
                coverImageUrl={series.coverImageUrl ?? null}
                coverVariant={series.coverVariant}
              />
              <div className="series-card__body">
                <p className="eyebrow">{series.axis}</p>
                <h3>{series.title}</h3>
                <p>{series.description}</p>
                <p className="series-card__count">
                  {series.items.length} pauta{series.items.length === 1 ? "" : "s"}
                </p>
                <Link href={`/series/${series.slug}`} className="button-secondary">
                  Ver série
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section home-memory-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Memória e arquivo vivo</p>
            <h2>Preservar a cidade antes que ela seja reescrita.</h2>
          </div>
          <p className="section__lead">
            A memória entra como arquivo vivo: o que a cidade foi, o que deixou de ser e o que insiste em aparecer apesar do apagamento.
          </p>
        </div>

        <div className="grid-3">
          {site.memoryHighlights.map((item) => (
            <article className="quote" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section home-intake-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Envie sua denúncia</p>
            <h2>Se é urgente, precisa entrar com contexto e cuidado.</h2>
          </div>
          <p className="section__lead">
            O canal de envio foi feito para relatos, documentos e sinais de problema público. Denúncia anônima é possível.
          </p>
        </div>

        <div className="grid-2">
          <div className="support-box home-callout">
            <h3>O que pode entrar</h3>
            <ul>
              {site.intakeNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="support-box home-callout home-callout--accent">
            <h3>Enviar agora</h3>
            <p>
              Se houver dado sensível, descreva o nível de risco. Se houver urgência, marque isso no começo do relato.
            </p>
            <div className="stack-actions">
              <Link href="/envie" className="button">
                Abrir canal de envio
              </Link>
              <Link href="/sobre" className="button-secondary">
                Entender o cuidado editorial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-support-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Apoie o projeto</p>
            <h2>Sem rede, sem base. Sem base, sem continuidade.</h2>
          </div>
          <p className="section__lead">
            O apoio sustenta apuração, redação, design, infraestrutura e o tempo necessário para transformar relato em publicação séria.
          </p>
        </div>

        <div className="grid-2">
          <div className="support-box home-callout">
            <h3>Como apoiar</h3>
            <ul>
              {site.supportWays.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="support-box home-callout">
            <h3>Onde sua ajuda entra</h3>
            <p>
              Em leitura, material, colaboração técnica, revisão, design, rede e, quando disponível, apoio financeiro.
            </p>
            <div className="stack-actions">
              <Link href="/apoie" className="button">
                Apoiar o projeto
              </Link>
              <Link href="/manifesto" className="button-secondary">
                Ler o manifesto
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-manifesto">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Manifesto curto</p>
            <h2>O projeto existe para nomear a cidade em disputa.</h2>
          </div>
          <p className="section__lead">
            VR Abandonada é arquivo, denúncia e organização popular. Quem chega pela home precisa entender isso em poucos segundos.
          </p>
        </div>

        <div className="grid-3">
          {site.manifestoPhrases.map((phrase) => (
            <article className="card" key={phrase}>
              <p className="manifesto-line">{phrase}</p>
            </article>
          ))}
        </div>

        <div className="stack-actions">
          <Link href="/manifesto" className="button">
            Ler manifesto completo
          </Link>
          <Link href="/pautas" className="button-secondary">
            Entrar no arquivo
          </Link>
        </div>
      </section>
    </Container>
  );
}


