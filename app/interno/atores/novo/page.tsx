import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { ActorHubForm } from "@/components/actor-hub-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Novo ator",
  description: "Criar ator recorrente do VR Abandonada.",
};

export default async function InternalActorNewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">novo ator</p>
        <h1 className="hero__title">Cadastrar responsabilidade recorrente</h1>
        <p className="hero__lead">Crie uma entidade pública curta, clara e operável. O objetivo é enxergar quem atravessa o caso sem cair em burocracia.</p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/atores" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href="/atores" className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <ActorHubForm />
      </section>
    </Container>
  );
}
