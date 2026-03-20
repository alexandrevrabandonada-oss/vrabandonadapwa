import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { EntryRouteForm } from "@/components/entry-route-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nova rota",
  description: "Criar uma guia de leitura pública para o VR Abandonada.",
};

export default async function InternalEntryRouteNewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  return (
    <Container className="intro-grid internal-page entry-route-internal-page">
      <section className="hero internal-hero entry-route-internal-hero">
        <p className="eyebrow">rotas internas</p>
        <h1 className="hero__title">Nova rota de entrada</h1>
        <p className="hero__lead">Crie um percurso curto e forte para primeira visita, tema, memória, dossiê ou acompanhamento do agora.</p>
        <div className="hero__actions">
          <Link href="/interno/rotas" className="button-secondary">
            Voltar às rotas
          </Link>
          <Link href="/comecar" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel entry-route-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Dados da rota</h2>
          </div>
          <p className="section__lead">A rota precisa ser curta, atravessável e fácil de operar sem virar manual de site.</p>
        </div>

        <EntryRouteForm />
      </section>
    </Container>
  );
}