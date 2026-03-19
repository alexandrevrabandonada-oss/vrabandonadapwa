import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Entenda a proposta editorial e política do VR Abandonada.",
};

export default function SobrePage() {
  return (
    <Container className="intro-grid">
      <PageHero
        kicker="sobre o projeto"
        title="Uma redação popular, não um cartão de visita."
        lead="VR Abandonada nasce para conectar memória, denúncia e organização popular em Volta Redonda com linguagem editorial séria e visual industrial."
      />

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">posição</p>
            <h2>O projeto parte da cidade real, não da versão oficial.</h2>
          </div>
          <p className="section__lead">
            A base do site precisa sustentar leitura pública, apuração e
            participação sem perder firmeza. Por isso a linguagem é direta, o
            contraste é alto e a estrutura evita decoração vazia.
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
    </Container>
  );
}
