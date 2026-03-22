import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUniversalInboxItems } from "@/lib/captura/queries";
import { UniversalCaptureComposer } from "@/components/universal-capture-composer";
import { UniversalCaptureInboxItem } from "@/components/universal-capture-inbox-item";

export const metadata: Metadata = {
  title: "Captura & Inbox",
  description: "Entrada rápida e universal do VR Abandonada.",
};

export default async function CapturarPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const inboxItems = await getUniversalInboxItems();

  return (
    <Container className="internal-page internal-page--operator">
      <section className="hero internal-hero internal-hero--operator">
        <p className="eyebrow">Ato Contínuo</p>
        <h1 className="hero__title">Captura Universal.</h1>
        <p className="hero__lead">Jogue o material aqui primeiro. Decida para onde vai depois.</p>
      </section>

      <section className="section internal-panel" style={{ marginTop: "1rem" }}>
        <UniversalCaptureComposer />
      </section>

      <div className="section-separator" style={{ margin: "3rem 0", height: "1px", background: "var(--border)" }} />

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Inbox de Entrada</p>
            <h2>Para Decidir ({inboxItems.length})</h2>
          </div>
          <p className="section__lead">
            Material recém chegado. Direcione para a rua, para o acervo ou mande para enriquecer com calma.
          </p>
        </div>

        {inboxItems.length > 0 ? (
          <div className="grid-3" style={{ marginTop: "2rem" }}>
            {inboxItems.map((item) => (
              <UniversalCaptureInboxItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <article className="support-box" style={{ marginTop: "2rem" }}>
             <h3>Inbox Vazia</h3>
             <p>Nenhuma captura pendente aguardando triagem.</p>
          </article>
        )}
      </section>
    </Container>
  );
}
