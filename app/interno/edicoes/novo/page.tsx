import { redirect } from "next/navigation";

import { EditionForm } from "@/components/edition-form";
import { Container } from "@/components/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function InternalEditionsNewPage() {
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
        <p className="eyebrow">nova edição</p>
        <h1 className="hero__title">Criar síntese pública.</h1>
        <p className="hero__lead">Use esta ficha para condensar o radar, uma campanha, um tema ou um arquivo em circulação.</p>
      </section>

      <section className="section internal-panel">
        <EditionForm />
      </section>
    </Container>
  );
}
