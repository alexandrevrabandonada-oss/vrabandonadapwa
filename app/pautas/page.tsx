import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pautas",
  description: "Eixos editoriais e pautas iniciais do VR Abandonada.",
};

export default function PautasPage() {
  return (
    <Container className="intro-grid">
      <PageHero
        kicker="pautas"
        title="Agenda pública com método editorial."
        lead="Os eixos desta base foram desenhados para organizar investigação, memória e denúncia sem perder clareza no mobile."
      />

      <section className="section">
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
        <div className="grid-3">
          {site.featuredPautas.map((item) => (
            <article className="entry" key={item.title}>
              <span className="entry__tag">{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </Container>
  );
}
