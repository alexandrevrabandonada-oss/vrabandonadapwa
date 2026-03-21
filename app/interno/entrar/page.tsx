import type { Metadata } from "next";

import { Container } from "@/components/container";
import { AdminAccessForm } from "@/components/admin-access-form";

export const metadata: Metadata = {
  title: "Acesso interno",
  description: "Entrada protegida para triagem editorial do VR Abandonada.",
};

export default function InternalLoginPage() {
  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">acesso interno</p>
        <h1 className="hero__title">Triagem editorial</h1>
        <p className="hero__lead">
          Entrada protegida para leitura, revisão e atualização dos envios.
        </p>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">entrada</p>
            <h2>Solicitar acesso</h2>
          </div>
          <p className="section__lead">
            O acesso é liberado só para e-mails autorizados. Quando o endereço está na allowlist, o painel abre direto sem depender da caixa de entrada.
          </p>
        </div>

        <AdminAccessForm />

        <div className="support-box" style={{ marginTop: "1rem" }}>
          <h3>Como liberar acesso</h3>
          <ul>
            <li>Garanta que o e-mail esteja na allowlist do projeto.</li>
            <li>Solicite o acesso nesta página.</li>
            <li>Se o endereço estiver liberado, o painel abre direto pelo link gerado.</li>
          </ul>
        </div>
      </section>
    </Container>
  );
}
