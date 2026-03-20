import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { CampaignForm } from "@/components/campaign-form";

export const metadata: Metadata = {
  title: "Nova campanha",
  description: "Criação de chamado público do VR Abandonada.",
};

export default function NewCampaignPage() {
  return (
    <Container className="intro-grid internal-page campaign-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">campanhas internas</p>
        <h1 className="hero__title">Nova campanha</h1>
        <p className="hero__lead">
          Crie um foco temporário para condensar investigação, participação e mobilização pública sem virar marketing genérico.
        </p>
        <div className="hero__actions">
          <Link href="/interno/campanhas" className="button-secondary">
            Voltar para a lista
          </Link>
          <Link href="/campanhas" className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">formulário</p>
            <h2>Dados da campanha</h2>
          </div>
          <p className="section__lead">Defina título, pergunta central, status, tipo e a visibilidade pública antes de montar os vínculos.</p>
        </div>

        <CampaignForm />
      </section>
    </Container>
  );
}
