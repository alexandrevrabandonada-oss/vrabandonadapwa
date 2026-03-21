import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArchiveCollectionForm } from "@/components/archive-collection-form";
import { Container } from "@/components/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nova coleção",
  description: "Criar um recorte editorial para o acervo.",
};

export default async function InternalArchiveNewCollectionPage() {
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
        <p className="eyebrow">coleções internas</p>
        <h1 className="hero__title">Nova coleção</h1>
        <p className="hero__lead">Crie um recorte público do arquivo vivo sem depender de estruturas pesadas.</p>
        <div className="hero__actions">          <Link href="/interno/acervo/colecoes" className="button-secondary">
            Voltar às coleções
          </Link>
          <Link href="/interno/acervo" className="button-secondary">
            Voltar ao acervo
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <ArchiveCollectionForm />
      </section>
    </Container>
  );
}

