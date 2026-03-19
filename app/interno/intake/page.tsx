import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { signOutAction } from "@/app/interno/actions";
import { intakeStatusLabels, intakeStatuses, type IntakeStatus } from "@/lib/intake/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Triagem",
  description: "Lista interna de envios para revisão editorial.",
};

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

const statusOptions = ["all", "new", "reviewing", "archived", "published"] as const;

type FilterStatus = (typeof statusOptions)[number];

function isStatusFilter(value: string | undefined): value is FilterStatus {
  return Boolean(value) && statusOptions.includes(value as FilterStatus);
}

export default async function IntakeListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const statusFilter = isStatusFilter(resolvedSearchParams.status)
    ? resolvedSearchParams.status
    : "all";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  let query = supabase
    .from("intake_submissions")
    .select(
      "id, category, source_type, title, location, anonymous, is_sensitive, status, created_at, reviewed_at, reviewed_by",
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const [{ data: submissions, error }, { data: allSubmissions }] = await Promise.all([
    query,
    supabase.from("intake_submissions").select("status"),
  ]);

  if (error) {
    throw error;
  }

  const counts = intakeStatuses.reduce<Record<IntakeStatus, number>>((acc, status) => {
    acc[status] = (allSubmissions ?? []).filter((row) => row.status === status).length;
    return acc;
  }, { new: 0, reviewing: 0, archived: 0, published: 0 });

  const totalCount = counts.new + counts.reviewing + counts.archived + counts.published;

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">painel interno</p>
        <h1 className="hero__title">Triagem editorial</h1>
        <p className="hero__lead">
          Revisão rápida, foco em contexto e cuidado com relatos sensíveis.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/envie" className="button-secondary">Ver canal público</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Submissões recebidas</h2>
          </div>
          <p className="section__lead">
            Aqui fica a leitura interna. O conteúdo público nunca expõe essa fila.
          </p>
        </div>

        <div className="status-filters" aria-label="Filtro por status">
          {statusOptions.map((status) => {
            const label =
              status === "all"
                ? `Tudo (${totalCount})`
                : `${intakeStatusLabels[status as IntakeStatus]} (${counts[status]})`;
            return (
              <Link
                key={status}
                href={status === "all" ? "/interno/intake" : `/interno/intake?status=${status}`}
                className={`status-chip ${statusFilter === status ? "status-chip--active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="grid-2" style={{ alignItems: "stretch" }}>
          {submissions && submissions.length > 0 ? (
            submissions.map((item) => (
              <article className="entry" key={item.id}>
                <span className="entry__tag">{item.source_type ?? item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.location || "Sem local informado"}</p>
                <div className="meta-row">
                  <span>{intakeStatusLabels[item.status as IntakeStatus] ?? item.status}</span>
                  <span>{item.is_sensitive ? "Sensível" : "Padrão"}</span>
                  <span>{item.anonymous ? "Anônimo" : "Contato possível"}</span>
                </div>
                <Link href={`/interno/intake/${item.id}`} className="button-secondary">
                  Abrir detalhe
                </Link>
              </article>
            ))
          ) : (
            <div className="support-box">
              <h3>Sem envios nesta visão</h3>
              <p>Use outro filtro ou aguarde novas submissões.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
