import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { ParticipationPathForm } from "@/components/participation-path-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nova rota de participação",
  description: "Criar uma porta pública de colaboração para o VR Abandonada.",
};

export default async function InternalParticipationNewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  return (
    <Container className="intro-grid internal-page participation-internal-page">
      <section className="hero internal-hero participation-internal-hero">
        <p className="eyebrow">participação interna</p>
        <h1 className="hero__title">Nova rota de participação</h1>
        <p className="hero__lead">Crie uma porta curta para enviar, apoiar, colaborar com memória ou acompanhar casos em curso.</p>
        <div className="hero__actions">
          <Link href="/interno/participe" className="button-secondary">
            Voltar às rotas
          </Link>
          <Link href="/participe" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel participation-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Dados da rota</h2>
          </div>
          <p className="section__lead">A rota deve orientar uma ação pública clara e não virar lista genérica de links.</p>
        </div>

        <ParticipationPathForm />
      </section>
    </Container>
  );
}