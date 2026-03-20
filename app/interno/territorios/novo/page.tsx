import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PlaceHubForm } from "@/components/place-hub-form";

export const metadata: Metadata = {
  title: "Novo território",
  description: "Criação de lugar vivo do VR Abandonada.",
};

export default function NewTerritoryPage() {
  return (
    <Container className="intro-grid internal-page territory-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">territórios internos</p>
        <h1 className="hero__title">Novo lugar</h1>
        <p className="hero__lead">Crie um bairro, equipamento ou ponto crítico para ligar o arquivo ao endereço concreto da cidade.</p>
        <div className="hero__actions">
          <Link href="/interno/territorios" className="button-secondary">
            Voltar para a lista
          </Link>
          <Link href="/territorios" className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">formulário</p>
            <h2>Dados do lugar</h2>
          </div>
          <p className="section__lead">Defina endereço editorial, território, status e ligações com o restante do projeto.</p>
        </div>

        <PlaceHubForm />
      </section>
    </Container>
  );
}
