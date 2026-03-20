import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { removeParticipationPathItemAction } from "@/app/interno/participe/actions";
import { Container } from "@/components/container";
import { ParticipationPathForm } from "@/components/participation-path-form";
import { ParticipationPathItemForm } from "@/components/participation-path-item-form";
import { ParticipationStepCard } from "@/components/participation-step-card";
import { getInternalParticipationContext, getInternalParticipationPathById, getInternalParticipationPathItems } from "@/lib/participation/queries";
import { getParticipationLeadItem, resolveParticipationItems } from "@/lib/participation/resolve";
import { getParticipationStatusLabel } from "@/lib/participation/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rota de participação",
  description: "Editar um caminho público de colaboração do VR Abandonada.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalParticipationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const path = await getInternalParticipationPathById(id);
  if (!path) {
    notFound();
  }

  const [items, context] = await Promise.all([getInternalParticipationPathItems(path.id), getInternalParticipationContext()]);
  const resolvedItems = resolveParticipationItems(items, context);
  const leadItem = getParticipationLeadItem(resolvedItems);
  const totalItems = items.length;

  return (
    <Container className="intro-grid internal-page participation-internal-page">
      <section className="hero internal-hero participation-internal-hero">
        <p className="eyebrow">participação interna</p>
        <h1 className="hero__title">{path.title}</h1>
        <p className="hero__lead">{path.excerpt || path.description || "Rota pública de participação."}</p>
        <div className="meta-row">
          <span>{getParticipationStatusLabel(path.status)}</span>
          <span>{path.public_visibility ? "Pública" : "Interna"}</span>
          <span>{totalItems} passo{totalItems === 1 ? "" : "s"}</span>
          {path.audience_label ? <span>{path.audience_label}</span> : null}
        </div>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/participe" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/participe/${path.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel participation-internal-section">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3>{getParticipationStatusLabel(path.status)}</h3>
            <p>Estado editorial da rota.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">visibilidade</p>
            <h3>{path.public_visibility ? "pública" : "interna"}</h3>
            <p>Quem pode acessar a porta.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">destaque</p>
            <h3>{path.featured ? "sim" : "não"}</h3>
            <p>Se deve aparecer na home da participação.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">passos</p>
            <h3>{totalItems}</h3>
            <p>Percurso já montado.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel participation-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">editar</p>
            <h2>Dados da rota</h2>
          </div>
          <p className="section__lead">Ajuste abertura, público, destaque e visibilidade sem perder a clareza editorial.</p>
        </div>

        <ParticipationPathForm path={path} />
      </section>

      {leadItem ? (
        <section className="section internal-panel participation-internal-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">peça central</p>
              <h2>Por onde a participação começa</h2>
            </div>
            <p className="section__lead">A peça principal orienta o gesto de colaboração e reduz a dispersão.</p>
          </div>

          <ParticipationStepCard item={leadItem} />
        </section>
      ) : null}

      <section className="section internal-panel participation-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">sequência</p>
            <h2>Ordem pública</h2>
          </div>
          <p className="section__lead">Veja como a rota aparece para o público antes de editar cada passo individualmente.</p>
        </div>

        <div className="grid-2">
          {resolvedItems.length ? (
            resolvedItems.map((item) => <ParticipationStepCard key={item.id} item={item} />)
          ) : (
            <div className="support-box">
              <h3>Sem passos ainda</h3>
              <p>Adicione a primeira peça para montar a leitura guiada.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section internal-panel participation-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">editar passos</p>
            <h2>Passos existentes</h2>
          </div>
          <p className="section__lead">Cada passo pode ser ajustado, reordenado ou removido sem sair da rota.</p>
        </div>

        <div className="grid-2">
          {items.length ? (
            items.map((item) => (
              <article className="support-box" key={item.id}>
                <ParticipationPathItemForm path={path} options={context.linkOptions} item={item} />
                <form action={removeParticipationPathItemAction}>
                  <input type="hidden" name="path_id" value={path.id} />
                  <input type="hidden" name="item_id" value={item.id} />
                  <button className="button-secondary" type="submit">
                    Remover passo
                  </button>
                </form>
              </article>
            ))
          ) : (
            <div className="support-box">
              <h3>Nenhum passo registrado</h3>
              <p>Use o formulário abaixo para abrir o primeiro trecho da rota.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section internal-panel participation-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">novo passo</p>
            <h2>Adicionar à sequência</h2>
          </div>
          <p className="section__lead">Conecte a rota a páginas, pautas, dossiês, memória, acervo, coleções, eixos ou séries já publicadas.</p>
        </div>

        <ParticipationPathItemForm path={path} options={context.linkOptions} />
      </section>
    </Container>
  );
}