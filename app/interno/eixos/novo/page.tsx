import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { ThemeHubForm } from "@/components/theme-hub-form";

export const metadata: Metadata = {
  title: "Novo eixo",
  description: "Criar uma frente temática pública para o VR Abandonada.",
};

export default function InternalThemeHubNewPage() {
  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">eixos internos</p>
        <h1 className="hero__title">Novo eixo temático</h1>
        <p className="hero__lead">Crie um hub que atravesse pauta, memória, acervo e dossiê sem depender de taxonomia pesada.</p>
        <div className="hero__actions">
          <Link href="/interno/eixos" className="button-secondary">
            Voltar aos eixos
          </Link>
          <Link href="/eixos" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Dados do eixo</h2>
          </div>
          <p className="section__lead">O eixo precisa ser curto, forte e atravessável pelo público sem virar catálogo frio.</p>
        </div>

        <ThemeHubForm />
      </section>
    </Container>
  );
}
