import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { CampaignCard } from "@/components/campaign-card";
import { getCampaignStatusLabel } from "@/lib/campaigns/navigation";
import { getInternalCampaignLinks, getInternalCampaigns } from "@/lib/campaigns/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Campanhas internas",
  description: "Curadoria e operação dos chamados públicos do VR Abandonada.",
};

const filters = ["all", "upcoming", "active", "monitoring", "closed", "archived"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalCampaignsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const campaigns = await getInternalCampaigns({ status });
  const allCampaigns = status === "all" ? campaigns : await getInternalCampaigns({ status: "all" });
  const linkPairs = await Promise.all(allCampaigns.map(async (campaign) => [campaign.id, await getInternalCampaignLinks(campaign.id)] as const));
  const linkCountById = new Map(linkPairs.map(([id, links]) => [id, links.length]));
  const publishedCount = allCampaigns.filter((campaign) => campaign.public_visibility).length;
  const activeCount = allCampaigns.filter((campaign) => campaign.status === "active" || campaign.status === "monitoring").length;

  return (
    <Container className="intro-grid internal-page campaign-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">campanhas internas</p>
        <h1 className="hero__title">Foco editorial temporário</h1>
        <p className="hero__lead">
          Organize chamados públicos que condensam investigação, participação, método e apoio.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/campanhas/novo" className="button">
            Nova campanha
          </Link>
          <Link href="/campanhas" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allCampaigns.length}</h3>
            <p>Campanhas cadastradas.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicadas</p>
            <h3>{publishedCount}</h3>
            <p>Chamados liberados para o público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">em foco</p>
            <h3>{activeCount}</h3>
            <p>Campanhas ativas ou em monitoramento.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{linkPairs.reduce((sum, [, links]) => sum + links.length, 0)}</h3>
            <p>Peças conectadas às campanhas.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">Filtre rápido o que está em preparação, ativo, monitoramento, encerrado ou arquivado.</p>
        </div>

        <div className="status-filters" aria-label="Filtro de campanhas">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/campanhas" : `/interno/campanhas?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getCampaignStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Campanhas registradas</h2>
          </div>
          <p className="section__lead">Cada foco temporário abre uma frente pública que articula investigação, participação e apoio.</p>
        </div>

        <div className="grid-2">
          {campaigns.length ? (
            campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                href={`/interno/campanhas/${campaign.id}`}
                itemCount={linkCountById.get(campaign.id) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem campanhas neste filtro</h3>
              <p>Crie o primeiro foco para condensar a mobilização pública do projeto.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}



