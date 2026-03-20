import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { ImpactForm } from "@/components/impact-form";

export const metadata: Metadata = {
  title: "Novo impacto",
  description: "Criação de chamado público do VR Abandonada.",
};

export default function NewImpactPage() {
  return (
    <Container className="intro-grid internal-page impact-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">impactos internos</p>
        <h1 className="hero__title">Novo impacto</h1>
        <p className="hero__lead">
          Crie um foco temporário para condensar investigação, participação e mobilização pública sem virar marketing genérico.
        </p>
        <div className="hero__actions">
          <Link href="/interno/impacto" className="button-secondary">
            Voltar para a lista
          </Link>
          <Link href="/impacto" className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">formulário</p>
            <h2>Dados do impacto</h2>
          </div>
          <p className="section__lead">Defina título, pergunta central, status, tipo e a visibilidade pública antes de montar os vínculos.</p>
        </div>

        <ImpactForm />
      </section>
    </Container>
  );
}



