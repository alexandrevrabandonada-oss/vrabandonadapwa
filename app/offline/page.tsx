import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";

export const metadata: Metadata = {
  title: "Offline",
  description: "O VR Abandonada continua acessível no que já ficou salvo.",
  openGraph: {
    title: "Offline | VR Abandonada",
    description: "O VR Abandonada continua acessível no que já ficou salvo.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offline | VR Abandonada",
    description: "O VR Abandonada continua acessível no que já ficou salvo.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default function OfflinePage() {
  return (
    <Container className="intro-grid offline-page">
      <section className="hero hero--split">
        <div className="hero__copy">
          <p className="eyebrow">offline</p>
          <h1 className="hero__title">A conexão caiu, mas a leitura continua.</h1>
          <p className="hero__lead">
            O app guarda o shell principal e algumas páginas recentes para você voltar ao arquivo sem ficar preso na rede.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">cache local</span>
            <span className="home-hero__signal">leitura salva</span>
            <span className="home-hero__signal">retorno ao app</span>
          </div>
        </div>
        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">o que fazer agora</p>
          <p>Abra o que já esteve carregado, volte para os salvos ou retome quando a rede aparecer de novo.</p>
          <div className="stack-actions">
            <Link href="/salvos" className="button-secondary">
              Abrir salvos
            </Link>
            <Link href="/agora" className="button-secondary">
              Ver radar
            </Link>
            <Link href="/edicoes" className="button-secondary">
              Ver edições
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">continuidade</p>
            <h2>O app não promete tudo offline. Ele garante um retorno útil.</h2>
          </div>
          <p className="section__lead">
            A navegação salva localmente, os caminhos principais ficam mais estáveis e a leitura importante pode ser retomada sem recomeçar do zero.
          </p>
        </div>
      </section>
    </Container>
  );
}
