import Link from "next/link";

import { Container } from "@/components/container";

export default function NewPatternPage() {
  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">novo padrão</p>
        <h1 className="hero__title">Abrir uma leitura estrutural</h1>
        <p className="hero__lead">
          Use este espaço para condensar uma hipótese pública sobre o que se repete na cidade. Depois, relacione atores, territórios, campanhas, impactos e arquivo.
        </p>
        <div className="hero__actions">
          <Link href="/interno/padroes" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href="/padroes" className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como usar</p>
            <h2>Registre a hipótese antes de espalhar vínculos.</h2>
          </div>
          <p className="section__lead">
            O padrão deve nascer com pergunta central, leitura curta e estado editorial claro. Os vínculos entram depois para sustentar a síntese.
          </p>
        </div>
      </section>
    </Container>
  );
}
