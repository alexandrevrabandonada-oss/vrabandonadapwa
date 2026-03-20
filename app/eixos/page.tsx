import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { ThemeHubCard } from "@/components/theme-hub-card";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getThemeHubStatusLabel } from "@/lib/hubs/navigation";
import { EditorialCover } from "@/components/editorial-cover";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";

export const metadata: Metadata = {
  title: "Eixos",
  description: "Grandes frentes temáticas do VR Abandonada.",
  openGraph: {
    title: "Eixos | VR Abandonada",
    description: "Grandes frentes temáticas do VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function ThemeHubsPage() {
  const hubs = await getPublishedThemeHubs();
  const featuredHub = hubs[0] ?? null;
  const activeHubs = hubs.filter((hub) => hub.status === "active");
  const monitoringHubs = hubs.filter((hub) => hub.status === "monitoring");
  const archiveHubs = hubs.filter((hub) => hub.status === "archive");

  return (
    <Container className="intro-grid theme-hub-page">
      <section className="hero hero--split landing-hero">
        <div className="hero__copy landing-hero__copy">
          <p className="eyebrow">grandes frentes</p>
          <h1 className="hero__title">Eixos vivos para navegar o conflito da cidade.</h1>
          <p className="hero__lead">
            Os eixos atravessam pauta, memória, acervo e dossiê. Em vez de começar pelo formato, o público entra pelo tema que organiza a disputa pública.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">mapa temático vivo</span>
            <span className="home-hero__signal">grande frente editorial</span>
            <span className="home-hero__signal">leitura por conflito</span>
          </div>
          <div className="hero__actions">
            <Link href="#eixos-ativos" className="button">
              Ver eixos
            </Link>
            <Link href="/dossies" className="button-secondary">
              Abrir dossiês
            </Link>
          </div>
        </div>

        <EditorialCover
          title={featuredHub?.title || "Eixos"}
          primaryTag={featuredHub ? getThemeHubStatusLabel(featuredHub.status) : "mapa vivo"}
          seriesTitle={featuredHub?.lead_question || featuredHub?.excerpt || "Uma frente editorial"}
          coverImageUrl={featuredHub?.cover_image_url || "/editorial/covers/arquivo-inicial.svg"}
          coverVariant={featuredHub?.featured ? "ember" : "concrete"}
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">O que são os eixos</p>
            <h2>Não são categorias soltas. São linhas de investigação pública.</h2>
          </div>
          <p className="section__lead">
            Cada eixo cruza documento, memória, pauta e dossiê para mostrar como um tema insiste na cidade ao longo do tempo.
          </p>
        </div>

        <div className="grid-3">
          {[
            {
              title: "Poluição e CSN",
              text: "O custo ambiental da siderurgia lido como questão pública, não ruído de fundo.",
            },
            {
              title: "Trabalho e acidentes",
              text: "Risco, desgaste e lesão como parte da vida operária e da política do turno.",
            },
            {
              title: "Cidade e abandono",
              text: "O que a manutenção interrompida faz com o cotidiano, o acesso e a dignidade.",
            },
          ].map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="eixos-ativos">
        <div className="grid-2">
          <div>
            <p className="eyebrow">mapa temático</p>
            <h2>Ativos, em monitoramento e arquivo.</h2>
          </div>
          <p className="section__lead">A leitura por status ajuda a perceber o que está em curso e o que segue como lastro editorial.</p>
        </div>

        <div className="grid-2">
          <article className="card">
            <h3>Ativos</h3>
            <p>{activeHubs.length} eixo(s) em circulação pública.</p>
          </article>
          <article className="card">
            <h3>Monitoramento</h3>
            <p>{monitoringHubs.length} eixo(s) acompanhados como frente viva.</p>
          </article>
          <article className="card">
            <h3>Arquivo</h3>
            <p>{archiveHubs.length} eixo(s) guardados como base de leitura.</p>
          </article>
          <article className="card">
            <h3>Leitura temática</h3>
            <p>O mapa permite entrar pela frente editorial e seguir até o caso, o documento e a memória.</p>
          </article>
        </div>
      </section>

      {featuredHub ? (
        <section className="section home-dossier-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">eixo em destaque</p>
              <h2>{featuredHub.title}</h2>
            </div>
            <p className="section__lead">{featuredHub.lead_question || featuredHub.excerpt || featuredHub.description}</p>
          </div>

          <div className="grid-2">
            <ThemeHubCard hub={featuredHub} href={`/eixos/${featuredHub.slug}`} itemCount={0} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">como navegar</p>
              <h3>Comece pelo eixo e depois desça para o caso.</h3>
              <p>
                O eixo puxa a investigação maior, aponta as peças centrais e atravessa pauta, memória, acervo e dossiê sem confundir o formato com o tema.
              </p>
              <div className="stack-actions">
                <Link href={`/eixos/${featuredHub.slug}`} className="button">
                  Abrir eixo
                </Link>
                <Link href="/envie" className="button-secondary">
                  Enviar pista
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">frentes públicas</p>
            <h2>Os demais eixos organizados por status.</h2>
          </div>
          <p className="section__lead">Os blocos abaixo funcionam como mapa rápido para o público entender onde há investigação ativa e onde há memória consolidada.</p>
        </div>

        <div className="grid-2">
          {[...activeHubs.slice(1), ...monitoringHubs, ...archiveHubs].map((hub) => (
            <ThemeHubCard key={hub.id} hub={hub} href={`/eixos/${hub.slug}`} itemCount={0} compact />
          ))}
        </div>
      </section>
    </Container>
  );
}
