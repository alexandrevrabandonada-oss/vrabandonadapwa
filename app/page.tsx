import type { Metadata } from "next";
import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { Container } from "@/components/container";
import { SupabaseStatus } from "@/components/supabase-status";
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

export default function HomePage() {
  return (
    <Container className="intro-grid">
      <section className="hero hero--split">
        <div className="hero__copy">
          <p className="eyebrow">{site.hero.kicker}</p>
          <h1 className="hero__title">{site.hero.title}</h1>
          <p className="hero__lead">{site.hero.lead}</p>
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
            <h2>Uma casa digital para memória, denúncia e organização.</h2>
          </div>
          <p className="section__lead">
            O projeto reúne arquivo, pauta e apoio numa estrutura pública e
            acessível. A ideia é sair da lógica do site institucional e operar
            como plataforma editorial viva: pública quando precisa ser pública,
            cuidadosa quando o tema exige proteção.
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

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Eixos editoriais</p>
            <h2>Uma redação enxuta, com método e território.</h2>
          </div>
          <p className="section__lead">
            Cada eixo nasce para sustentar leitura, apuração e continuidade.
            Não é feed aleatório. É organização por tema, impacto e utilidade
            pública.
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
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Pautas em destaque</p>
            <h2>Mock inicial para mostrar ritmo editorial.</h2>
          </div>
          <p className="section__lead">
            Esses exemplos servem como molde de linguagem, densidade e formato.
            A home já precisa parecer publicação séria, não tela vazia.
          </p>
        </div>

        <div className="grid-3">
          {site.featuredPautas.map((item) => (
            <article className="entry" key={item.title}>
              <span className="entry__tag">{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="meta-row">
                <span>Leitura editorial</span>
                <span>Arquivo em formação</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Memória</p>
            <h2>Preservar a cidade antes que ela seja reescrita.</h2>
          </div>
          <p className="section__lead">
            A memória entra como arquivo vivo: o que a cidade foi, o que deixou
            de ser, e o que insiste em aparecer apesar do apagamento.
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

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Apoie</p>
            <h2>Sem rede, sem base. Sem base, sem continuidade.</h2>
          </div>
          <p className="section__lead">
            O projeto precisa de leitura, de material, de trabalho e de
            sustentabilidade. O apoio pode vir em forma de colaboração, rede,
            recurso ou apuração compartilhada.
          </p>
        </div>

        <div className="grid-2">
          <div className="support-box">
            <h3>Como apoiar agora</h3>
            <ul>
              {site.supportWays.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="support-box">
            <h3>Supabase</h3>
            <p style={{ marginBottom: "0.75rem" }}>
              A base já está ligada ao cliente browser e pronta para receber
              formulário, pauta e fila editorial.
            </p>
            <SupabaseStatus />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Denúncia</p>
            <h2>Se é urgente, precisa entrar com contexto.</h2>
          </div>
          <p className="section__lead">
            O canal de envio deve ser simples, claro e sério. A base já fica
            preparada para isso, sem fingir que segurança é detalhe.
          </p>
        </div>

        <div className="stack-actions">
          <Link href="/envie" className="button">
            Enviar denúncia
          </Link>
          <Link href="/sobre" className="button-secondary">
            Entender o projeto
          </Link>
        </div>
      </section>
    </Container>
  );
}
