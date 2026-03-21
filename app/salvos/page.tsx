import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { SavedReadsClient } from "@/components/saved-reads-client";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { ReadingTrailPanel } from "@/components/pwa-reading-trail";

export const metadata: Metadata = {
  title: "Salvos",
  description: "Leituras guardadas no aparelho para voltar depois.",
  openGraph: {
    title: "Salvos | VR Abandonada",
    description: "Leituras guardadas no aparelho para voltar depois.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Salvos | VR Abandonada",
    description: "Leituras guardadas no aparelho para voltar depois.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default function SalvosPage() {
  return (
    <Container className="intro-grid saved-reads-page">
      <section className="hero hero--split">
        <div className="hero__copy">
          <p className="eyebrow">salvos locais</p>
          <h1 className="hero__title">Leituras guardadas para voltar no celular.</h1>
          <p className="hero__lead">
            O que você salva fica neste aparelho. É um retorno curto para pautas, dossiês, campanhas, impactos e edições que merecem acompanhamento.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">offline leve</span>
            <span className="home-hero__signal">sem login</span>
            <span className="home-hero__signal">retorno recorrente</span>
          </div>
        </div>
        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">como funciona</p>
          <h2>Salvar é guardar para ler depois, mesmo sem internet.</h2>
          <p>
            O dispositivo vira uma pequena prateleira local. A leitura salva não depende de conta nem de nuvem; ela acompanha o que você escolheu abrir aqui.
          </p>
          <div className="stack-actions">
            <Link href="/acompanhar" className="button-secondary">
              Abrir acompanhar
            </Link>
            <Link href="/metodo" className="button-secondary">
              Entender a diferença
            </Link>
          </div>
        </article>
      </section>

      <ReadingTrailPanel compact />

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhar</p>
            <h2>Salvar é uma leitura. Seguir é uma frente.</h2>
          </div>
          <p className="section__lead">Quando a leitura precisa de continuidade, abra o painel local de acompanhamento.</p>
        </div>
        <div className="stack-actions">
          <Link href="/acompanhar" className="button">
            Abrir acompanhar
          </Link>
          <Link href="/metodo" className="button-secondary">
            Entender a diferença
          </Link>
        </div>
      </section>

      <SavedReadsClient />
    </Container>
  );
}

