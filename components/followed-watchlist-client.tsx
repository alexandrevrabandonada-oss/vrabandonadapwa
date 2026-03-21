"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getFollowItems, subscribeToFollowChanges, type FollowItem } from "@/lib/pwa/follows";

type FollowSnapshot = {
  kind: string;
  key: string;
  title: string;
  summary: string;
  href: string;
  label: string;
  statusLabel: string;
  movementLabel: string;
  movementSummary: string | null;
  movementHref: string | null;
  updatedAtLabel: string | null;
};

type Props = {
  snapshots: FollowSnapshot[];
};

function groupByKind(items: FollowSnapshot[]) {
  return items.reduce<Record<string, FollowSnapshot[]>>((acc, item) => {
    acc[item.kind] = acc[item.kind] ? [...acc[item.kind], item] : [item];
    return acc;
  }, {});
}

export function FollowedWatchlistClient({ snapshots }: Props) {
  const [follows, setFollows] = useState<FollowItem[]>([]);

  useEffect(() => {
    const update = () => setFollows(getFollowItems());
    update();

    return subscribeToFollowChanges(update);
  }, []);

  const followedSnapshots = useMemo(() => {
    const byKey = new Map(snapshots.map((snapshot) => [`${snapshot.kind}:${snapshot.key}`, snapshot] as const));

    return follows
      .map((item) => byKey.get(`${item.kind}:${item.key}`) ?? null)
      .filter((item): item is FollowSnapshot => Boolean(item));
  }, [follows, snapshots]);

  const grouped = useMemo(() => groupByKind(followedSnapshots), [followedSnapshots]);

  const recentSignals = useMemo(() => [...followedSnapshots].slice(0, 3), [followedSnapshots]);

  return (
    <section className="section follow-watchlist-page">
      <div className="grid-2">
        <div>
          <p className="eyebrow">acompanhar</p>
          <h2>Seu painel local.</h2>
        </div>
        <p className="section__lead">
          Seguir é diferente de salvar: você acompanha frentes ao longo do tempo. Tudo fica neste aparelho.
        </p>
      </div>

      <div className="grid-2">
        <article className="support-box follow-watchlist-summary">
          <p className="eyebrow">frentes seguidas</p>
          <h3>{followedSnapshots.length}</h3>
          <p>O que o app traz de volta para você.</p>
          <div className="stack-actions">
            <Link href="/salvos" className="button-secondary">
              Ver salvos
            </Link>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </div>
        </article>

        <article className="support-box follow-watchlist-summary">
          <p className="eyebrow">continue de onde parou</p>
          <h3>Salvar é para uma peça. Seguir é para uma frente.</h3>
          <p>
            Uma edição, pauta ou documento pode ir para <Link href="/salvos">Salvos</Link>. Um eixo, território, dossiê ou campanha entra aqui para acompanhar o que continua em curso.
          </p>
        </article>
      </div>

      {followedSnapshots.length ? (
        <div className="follow-watchlist-grid">
          <article className="support-box follow-watchlist-group" id="frentes-seguidas">
            <p className="eyebrow">o que você acompanha</p>
            <div className="follow-watchlist-list">
              {followedSnapshots.map((item) => (
                <article className="follow-watchlist-card" key={`${item.kind}:${item.key}`}>
                  <div className="meta-row">
                    <span>{item.label}</span>
                    <span>{item.statusLabel}</span>
                    {item.updatedAtLabel ? <span>{item.updatedAtLabel}</span> : null}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="follow-watchlist-card__movement">
                    <p className="eyebrow">{item.movementLabel}</p>
                    <p>{item.movementSummary || "Sem nova movimentação pública detectada."}</p>
                  </div>
                  <div className="stack-actions">
                    <Link href={item.href} className="button-secondary">
                      Abrir
                    </Link>
                    {item.movementHref ? (
                      <Link href={item.movementHref} className="button-secondary">
                        Ver sinal
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="support-box follow-watchlist-group">
            <p className="eyebrow">frentes por tipo</p>
            <div className="follow-watchlist-compact-grid">
              {Object.entries(grouped).map(([kind, items]) => (
                <article className="follow-watchlist-compact" key={kind}>
                  <p className="eyebrow">{items[0]?.label ?? kind}</p>
                  <h3>{items.length}</h3>
                  <p>{items.map((item) => item.title).slice(0, 3).join(" • ")}</p>
                </article>
              ))}
            </div>
            <div className="follow-watchlist-recent">
              <p className="eyebrow">sinais recentes</p>
              {recentSignals.length ? (
                <div className="stacked-list">
                  {recentSignals.map((item) => (
                    <article className="follow-watchlist-signal" key={`${item.kind}:${item.key}`}>
                      <p className="meta-row">
                        <span>{item.label}</span>
                        {item.updatedAtLabel ? <span>{item.updatedAtLabel}</span> : null}
                      </p>
                      <h3>{item.title}</h3>
                      <p>{item.movementSummary || item.summary}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p>Seguir uma frente ajuda a construir esse painel local.</p>
              )}
            </div>
          </article>
        </div>
      ) : (
        <article className="support-box follow-watchlist-empty">
          <p className="eyebrow">sem frentes seguidas</p>
          <h3>Escolha o que quer acompanhar.</h3>
          <p>
            Comece por um eixo, território, dossiê, campanha ou ator. Quando a frente mudar, este painel volta a mostrar o caminho.
          </p>
          <div className="stack-actions">
            <Link href="/eixos" className="button-secondary">
              Ver eixos
            </Link>
            <Link href="/territorios" className="button-secondary">
              Ver territórios
            </Link>
            <Link href="/dossies" className="button-secondary">
              Ver dossiês
            </Link>
            <Link href="/campanhas" className="button-secondary">
              Ver campanhas
            </Link>
          </div>
        </article>
      )}

      <section className="section follow-suggestions-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">sugestões para começar</p>
            <h2>Escolha frentes para o app trazer de volta.</h2>
          </div>
          <p className="section__lead">
            Você pode seguir um eixo, um território, um dossiê, uma campanha ou um ator.
          </p>
        </div>

        <div className="grid-3">
          {snapshots.slice(0, 6).map((item) => (
            <article className="card card--compact" key={`${item.kind}:${item.key}`}>
              <span className="pill">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="stack-actions">
                <Link href={item.href} className="button-secondary">
                  Abrir
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

