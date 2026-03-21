import Link from "next/link";

import { Container } from "@/components/container";

export default function NewTimelineHighlightPage() {
  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">novo marco</p>
        <h1 className="hero__title">Abrir uma virada temporal</h1>
        <p className="hero__lead">
          Use este espaço para condensar uma origem, ruptura, reaparição ou consequência que reorganiza a leitura da cidade. Depois, relacione pauta, memória, dossiê, impacto e território.
        </p>
        <div className="hero__actions">
          <Link href="/interno/cronologia/marcos" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href="/linha-do-tempo" className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como usar</p>
            <h2>Registre o marco antes de espalhar os vínculos.</h2>
          </div>
          <p className="section__lead">
            O marco deve nascer com pergunta central, leitura curta e estado editorial claro. Os vínculos entram depois para sustentar a síntese.
          </p>
        </div>
      </section>
    </Container>
  );
}
