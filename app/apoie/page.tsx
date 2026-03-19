import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Apoie",
  description: "Formas de apoio ao VR Abandonada.",
};

export default function ApoiePage() {
  return (
    <Container className="intro-grid">
      <PageHero
        kicker="apoio"
        title="Sem base coletiva, o projeto não sustenta ritmo."
        lead="Este bloco já nasce preparado para colaboração, rede e sustentabilidade. O fluxo financeiro e de apoio ainda não foi fechado."
      />

      <section className="section">
        <div className="grid-2">
          <article className="support-box">
            <h3>Como ajudar agora</h3>
            <ul>
              {site.supportWays.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="support-box">
            <h3>O que ainda falta definir</h3>
            <ul>
              <li>Modelo de contribuição</li>
              <li>Canal de colaboração editorial</li>
              <li>Processo de curadoria de material</li>
              <li>Rotina de resposta ao público</li>
            </ul>
          </article>
        </div>
      </section>
    </Container>
  );
}
