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
            <h2>Solicitar link de acesso</h2>
          </div>
          <p className="section__lead">
            O link só é enviado para e-mails presentes na allowlist do projeto.
            Depois do login, a leitura e a edição seguem RLS no Supabase.
          </p>
        </div>

        <AdminAccessForm />

        <div className="support-box" style={{ marginTop: "1rem" }}>
          <h3>Como liberar acesso</h3>
          <ul>
            <li>Insira seu e-mail na tabela `admin_email_allowlist` do Supabase.</li>
            <li>Depois solicite o link nesta página.</li>
            <li>Use o link recebido para entrar no painel interno.</li>
          </ul>
        </div>
      </section>
    </Container>
  );
}
