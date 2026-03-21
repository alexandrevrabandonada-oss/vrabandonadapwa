import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { removeEntryRouteItemAction } from "@/app/interno/rotas/actions";
import { Container } from "@/components/container";
import { EntryRouteForm } from "@/components/entry-route-form";
import { EntryRouteItemForm } from "@/components/entry-route-item-form";
import { EntryRouteStepCard } from "@/components/entry-route-step-card";
import { getInternalEntryRouteById, getInternalEntryRouteContext, getInternalEntryRouteItems } from "@/lib/entry-routes/queries";
import { getEntryRouteLeadItem, resolveEntryRouteItems } from "@/lib/entry-routes/resolve";
import { getEntryRouteStatusLabel } from "@/lib/entry-routes/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rota interna",
  description: "Editar uma rota de entrada do VR Abandonada.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalEntryRouteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const route = await getInternalEntryRouteById(id);
  if (!route) {
    notFound();
  }

  const [items, context] = await Promise.all([getInternalEntryRouteItems(route.id), getInternalEntryRouteContext()]);
  const resolvedItems = resolveEntryRouteItems(items, context);
  const leadItem = getEntryRouteLeadItem(resolvedItems);
  const totalItems = items.length;

  return (
    <Container className="intro-grid internal-page entry-route-internal-page">
      <section className="hero internal-hero entry-route-internal-hero">
        <p className="eyebrow">rotas internas</p>
        <h1 className="hero__title">{route.title}</h1>
        <p className="hero__lead">{route.excerpt || route.description || "Rota de entrada pública."}</p>
        <div className="meta-row">
          <span>{getEntryRouteStatusLabel(route.status)}</span>
          <span>{route.public_visibility ? "Público" : "Interno"}</span>
          <span>{totalItems} passo{totalItems === 1 ? "" : "s"}</span>
          {route.audience_label ? <span>{route.audience_label}</span> : null}
        </div>
        <div className="hero__actions">`r`n          <Link href="/interno/rotas" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/comecar/${route.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel entry-route-internal-section">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3>{getEntryRouteStatusLabel(route.status)}</h3>
            <p>Estado editorial da rota.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">visibilidade</p>
            <h3>{route.public_visibility ? "pública" : "interna"}</h3>
            <p>Quem pode acessar a entrada.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">destaque</p>
            <h3>{route.featured ? "sim" : "não"}</h3>
            <p>Se a rota deve entrar em destaque.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">passos</p>
            <h3>{totalItems}</h3>
            <p>Peças já costuradas.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel entry-route-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">editar</p>
            <h2>Dados da rota</h2>
          </div>
          <p className="section__lead">Ajuste a abertura, o público, o destaque e a ordem editorial da porta de entrada.</p>
        </div>

        <EntryRouteForm route={route} />
      </section>

      {leadItem ? (
        <section className="section internal-panel entry-route-internal-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">peça central</p>
              <h2>Por onde a rota começa</h2>
            </div>
            <p className="section__lead">A peça principal orienta a primeira leitura e define o tom do percurso.</p>
          </div>

          <EntryRouteStepCard item={leadItem} />
        </section>
      ) : null}

      <section className="section internal-panel entry-route-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">sequência</p>
            <h2>Ordem pública</h2>
          </div>
          <p className="section__lead">Veja como a rota aparece para o público antes de editar cada passo individualmente.</p>
        </div>

        <div className="grid-2">
          {resolvedItems.length ? (
            resolvedItems.map((item) => <EntryRouteStepCard key={item.id} item={item} />)
          ) : (
            <div className="support-box">
              <h3>Sem passos ainda</h3>
              <p>Adicione a primeira peça para montar a leitura guiada.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section internal-panel entry-route-internal-section">
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
                <EntryRouteItemForm route={route} options={context.linkOptions} item={item} />
                <form action={removeEntryRouteItemAction}>
                  <input type="hidden" name="route_id" value={route.id} />
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

      <section className="section internal-panel entry-route-internal-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">novo passo</p>
            <h2>Adicionar à sequência</h2>
          </div>
          <p className="section__lead">Conecte a rota a pauta, dossiê, memória, acervo, coleção, eixo ou série já publicada.</p>
        </div>

        <EntryRouteItemForm route={route} options={context.linkOptions} />
      </section>
    </Container>
  );
}

