import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { DossierForm } from "@/components/dossier-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Novo dossiê",
  description: "Criar uma nova linha de investigação pública.",
};

export default async function NewInternalDossierPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  return (
    <Container className="intro-grid internal-page dossier-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">dossiês internos</p>
        <h1 className="hero__title">Novo dossiê</h1>
        <p className="hero__lead">
          Crie uma investigação pública com pergunta, território e caminho de leitura antes de ligar as peças.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
        </div>
      </section>

      <section className="section internal-panel">
        <DossierForm />
      </section>
    </Container>
  );
}
