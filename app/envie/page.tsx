import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Envie",
  description: "Canal inicial para denúncia e envio de material.",
};

export default function EnviePage() {
  return (
    <Container className="intro-grid">
      <PageHero
        kicker="envie"
        title="Denúncia sem excesso, com contexto e precisão."
        lead="A base já deixa claro que o canal precisa ser simples, seguro e orientado. O fluxo real ainda vai ser implementado com cuidado."
      />

      <section className="section">
        <div className="grid-2">
          <article className="support-box">
            <h3>Orientações iniciais</h3>
            <ul>
              {site.intakeNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="support-box">
            <h3>O que enviar</h3>
            <ul>
              <li>Relato objetivo do fato</li>
              <li>Local, data e contexto</li>
              <li>Fotos, documentos ou links</li>
              <li>Indicação de risco ou urgência</li>
            </ul>
          </article>
        </div>
      </section>
    </Container>
  );
}
