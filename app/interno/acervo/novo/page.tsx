import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { ArchiveAssetForm } from "@/components/archive-asset-form";
import { Container } from "@/components/container";
import { getInternalEditorialItems } from "@/lib/editorial/queries";
import { getInternalMemoryItems } from "@/lib/memory/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Novo anexo",
  description: "Cadastrar um novo objeto de acervo.",
};

type PageProps = {
  searchParams?: Promise<{ memory_item_id?: string; editorial_item_id?: string }>;
};

export default async function InternalArchiveNewPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const memoryItems = await getInternalMemoryItems();
  const editorialItems = await getInternalEditorialItems();
  const selectedMemory = resolvedSearchParams.memory_item_id
    ? memoryItems.find((item) => item.id === resolvedSearchParams.memory_item_id) ?? null
    : null;

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">acervo interno</p>
        <h1 className="hero__title">Novo anexo</h1>
        <p className="hero__lead">
          Suba um objeto de acervo e amarre-o a uma memória, pauta ou série. O lote pequeno ajuda a alimentar o arquivo sem travar a operação.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/acervo" className="button-secondary">
            Voltar ao acervo
          </Link>
          <Link href="/interno/memoria" className="button-secondary">
            Memória
          </Link>
        </div>
      </section>

      {selectedMemory ? (
        <section className="section internal-panel">
          <div className="support-box">
            <p className="eyebrow">vínculo de memória</p>
            <h3>{selectedMemory.title}</h3>
            <p>{selectedMemory.excerpt}</p>
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">cadastro</p>
            <h2>Dados mínimos do objeto</h2>
          </div>
          <p className="section__lead">Se começar com pouco, o arquivo cresce sem perder disciplina editorial.</p>
        </div>

        <ArchiveAssetForm
          memoryItems={memoryItems}
          editorialItems={editorialItems}
          allowBatch
          initialMemoryItemId={resolvedSearchParams.memory_item_id ?? ""}
          initialEditorialItemId={resolvedSearchParams.editorial_item_id ?? ""}
        />
      </section>
    </Container>
  );
}
