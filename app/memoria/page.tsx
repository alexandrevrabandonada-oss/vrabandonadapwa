import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Memória",
  description: "Arquivo vivo, relatos e marcas da cidade de Volta Redonda.",
};

export default function MemoriaPage() {
  return (
    <Container className="intro-grid">
      <PageHero
        kicker="memória"
        title="Arquivo vivo da cidade operária."
        lead="A memória aqui funciona como ferramenta editorial: comparar versões, preservar relatos e registrar o que o tempo e o poder querem apagar."
      />

      <section className="section">
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
          <article className="support-box">
            <h3>Tipos de acervo</h3>
            <ul>
              <li>Fotos históricas e atuais</li>
              <li>Relatos de trabalhadores e moradores</li>
              <li>Recortes, documentos e arquivos públicos</li>
              <li>Linhas do tempo de bairros e lutas</li>
            </ul>
          </article>
          <article className="support-box">
            <h3>Uso editorial</h3>
            <ul>
              <li>Contextualizar pautas e denúncias</li>
              <li>Construir comparação entre épocas</li>
              <li>Dar densidade ao arquivo urbano</li>
              <li>Reforçar pertencimento e memória coletiva</li>
            </ul>
          </article>
        </div>
      </section>
    </Container>
  );
}
