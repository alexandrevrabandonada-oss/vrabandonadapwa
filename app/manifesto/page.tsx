import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Texto-base de posição política e editorial do projeto.",
};

export default function ManifestoPage() {
  return (
    <Container className="intro-grid">
      <PageHero
        kicker="manifesto"
        title="A cidade não é propriedade de gabinete."
        lead="Este texto é a base de tom: popular, combativo, urbano, investigativo e profissional."
      />

      <section className="section">
        <div className="grid-2">
          <article className="quote">
            <strong>Posição</strong>
            <p>{site.manifestoPhrases[0]}</p>
          </article>
          <article className="quote">
            <strong>Memória</strong>
            <p>{site.manifestoPhrases[1]}</p>
          </article>
        </div>

        <article className="quote">
          <strong>Organização</strong>
          <p>{site.manifestoPhrases[2]}</p>
        </article>
      </section>
    </Container>
  );
}
