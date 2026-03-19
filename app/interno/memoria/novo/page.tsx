import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { MemoryForm } from "@/components/memory-form";
import { signOutAction } from "@/app/interno/actions";
import { getPublishedMemoryCollections } from "@/lib/memory/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nova memória",
  description: "Criar um item de memória viva para o arquivo público.",
};

export default async function InternalMemoryNewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const collections = await getPublishedMemoryCollections();

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">memória interna</p>
        <h1 className="hero__title">Nova memória</h1>
        <p className="hero__lead">Cadastre um recorte leve e já pense nele como peça do arquivo público.</p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/interno/memoria" className="button-secondary">Voltar à fila</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">cadastro</p>
            <h2>Preencha os campos da memória</h2>
          </div>
          <p className="section__lead">
            O formulário salva em rascunho por padrão e só vai ao público quando o estado for publicado.
          </p>
        </div>

        <MemoryForm collections={collections} />
      </section>
    </Container>
  );
}
