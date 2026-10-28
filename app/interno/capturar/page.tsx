import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUniversalInboxItems } from "@/lib/captura/queries";
import { UniversalCaptureComposer } from "@/components/universal-capture-composer";
import { UniversalCaptureInboxItem } from "@/components/universal-capture-inbox-item";
import { authorizePrivateDocuments } from "@/lib/media/private-server";

export const metadata: Metadata = {
  title: "Captura & Inbox",
  description: "Entrada rapida e universal do VR Abandonada.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function CapturarPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <Container><section className="section"><h1>Área interna indisponível</h1><p>Este ambiente não tem conexão editorial configurada.</p></section></Container>;
  }
  const resolvedSearchParams = (await searchParams) ?? {};
  const feedbackStatus = firstParam(resolvedSearchParams.status) || null;
  const feedbackMessage = firstParam(resolvedSearchParams.message) || null;
  const feedbackItemId = firstParam(resolvedSearchParams.item) || null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const inboxItems = await getUniversalInboxItems();
  const privateContext = await authorizePrivateDocuments().catch(() => null);
  const privateResult = privateContext && inboxItems.length
    ? await privateContext.service.from("private_editorial_documents").select("id,capture_id").in("capture_id", inboxItems.map((item) => item.id))
    : null;
  const privateDocuments = privateResult?.error ? [] : privateResult?.data ?? [];

  return (
    <Container className="internal-page internal-page--operator">
      <section className="hero internal-hero internal-hero--operator">
        <p className="eyebrow">Ato Continuo</p>
        <h1 className="hero__title">Captura Universal.</h1>
        <p className="hero__lead">Jogue o material aqui primeiro. Decida para onde vai depois.</p>
      </section>

      <section className="section internal-panel" style={{ marginTop: "1rem" }}>
        <UniversalCaptureComposer message={feedbackItemId ? null : feedbackMessage} status={feedbackItemId ? null : feedbackStatus} />
      </section>

      <div className="section-separator" style={{ margin: "3rem 0", height: "1px", background: "var(--border)" }} />

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Inbox de Entrada</p>
            <h2>Para Decidir ({inboxItems.length})</h2>
          </div>
          <p className="section__lead">
            Material recem chegado. Direcione para a rua, para o acervo ou mande para enriquecer com calma.
          </p>
        </div>

        {inboxItems.length > 0 ? (
          <div className="grid-3" style={{ marginTop: "2rem" }}>
            {inboxItems.map((item) => (
              <UniversalCaptureInboxItem
                key={item.id}
                item={item}
                privateDocumentsEnabled={Boolean(privateContext && !privateResult?.error)}
                privateDocuments={privateDocuments.filter((doc) => doc.capture_id === item.id)}
                active={feedbackItemId === item.id}
                feedbackMessage={feedbackMessage}
                feedbackStatus={feedbackStatus}
              />
            ))}
          </div>
        ) : (
          <article className="support-box" style={{ marginTop: "2rem" }}>
            <h3>Inbox vazia</h3>
            <p>Nenhuma captura pendente aguardando triagem.</p>
          </article>
        )}
      </section>
    </Container>
  );
}
