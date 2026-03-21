"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getFollowItems, subscribeToFollowChanges, type FollowItem } from "@/lib/pwa/follows";
import { getReadingTrailItems, subscribeToReadingTrailChanges, type ReadingTrailItem } from "@/lib/pwa/reading-trail";
import { getSavedReads, subscribeToSavedReadsChanges, type SavedRead } from "@/lib/pwa/saved-reads";

function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type HomeReturnState = {
  trail: ReadingTrailItem[];
  saves: SavedRead[];
  follows: FollowItem[];
};

export function HomeReturnPanel() {
  const [state, setState] = useState<HomeReturnState>({
    trail: [],
    saves: [],
    follows: [],
  });

  useEffect(() => {
    const sync = () =>
      setState({
        trail: getReadingTrailItems(),
        saves: getSavedReads(),
        follows: getFollowItems(),
      });

    sync();

    const offTrail = subscribeToReadingTrailChanges(sync);
    const offSaves = subscribeToSavedReadsChanges(sync);
    const offFollows = subscribeToFollowChanges(sync);

    return () => {
      offTrail();
      offSaves();
      offFollows();
    };
  }, []);

  const returnTrail = useMemo(() => state.trail.filter((item) => item.href !== "/"), [state.trail]);
  const primaryTrail = returnTrail[0] ?? state.trail[0] ?? null;
  const activeFollow = state.follows[0] ?? null;
  const latestSave = state.saves[0] ?? null;
  const hasReturnSignals = Boolean(primaryTrail || latestSave || activeFollow);

  if (!hasReturnSignals) {
    return (
      <section className="home-return-panel home-return-panel--first">
        <div>
          <p className="eyebrow">uso diário</p>
          <h2>Retome o que já começou.</h2>
          <p className="section__lead">A home traz de volta o que você abriu, salvou ou acompanha neste aparelho.</p>
        </div>
        <div className="home-return-panel__actions">
          <Link href="/agora" className="button">
            Ver agora
          </Link>
          <Link href="/acompanhar" className="button-secondary">
            Escolher frentes
          </Link>
          <Link href="/salvos" className="button-secondary">
            Salvos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="home-return-panel home-return-panel--return">
      <div className="home-return-panel__copy">
        <p className="eyebrow">retorno recorrente</p>
        <h2>Continue de onde parou.</h2>
        <p className="section__lead">A home traz de volta o que você abriu, salvou ou acompanha neste aparelho.</p>
      </div>

      <div className="home-return-panel__grid">
        {primaryTrail ? (
          <article className="support-box home-return-panel__card">
            <p className="eyebrow">retomar leitura</p>
            <h3>{primaryTrail.title}</h3>
            <p>{primaryTrail.summary}</p>
            <p className="meta-row">
              <span>{primaryTrail.label}</span>
              <span>{formatDate(primaryTrail.visitedAt)}</span>
            </p>
            <div className="stack-actions">
              <Link href={primaryTrail.href} className="button">
                Abrir agora
              </Link>
              <Link href="/salvos" className="button-secondary">
                Salvos
              </Link>
            </div>
          </article>
        ) : null}

        <article className="support-box home-return-panel__card">
          <p className="eyebrow">sua rotina</p>
          <h3>{formatCount(state.follows.length, "frente seguida")}</h3>
          <p>{formatCount(state.saves.length, "item salvo")}</p>
          <div className="stack-actions">
            <Link href="/acompanhar" className="button-secondary">
              Acompanhar
            </Link>
            <Link href="/salvos" className="button-secondary">
              Salvos
            </Link>
          </div>
        </article>

        {latestSave ? (
          <article className="support-box home-return-panel__card">
            <p className="eyebrow">último salvo</p>
            <h3>{latestSave.title}</h3>
            <p>{latestSave.summary}</p>
            <p className="meta-row">
              <span>{latestSave.label}</span>
              <span>{formatDate(latestSave.savedAt)}</span>
            </p>
            <div className="stack-actions">
              <Link href={latestSave.href} className="button-secondary">
                Continuar
              </Link>
            </div>
          </article>
        ) : null}

        {activeFollow ? (
          <article className="support-box home-return-panel__card">
            <p className="eyebrow">última frente</p>
            <h3>{activeFollow.title}</h3>
            <p>{activeFollow.summary}</p>
            <p className="meta-row">
              <span>{activeFollow.label}</span>
              <span>{formatDate(activeFollow.followedAt)}</span>
            </p>
            <div className="stack-actions">
              <Link href={activeFollow.href} className="button-secondary">
                Abrir
              </Link>
            </div>
          </article>
        ) : null}
      </div>

      <div className="home-return-panel__actions">
        <Link href="/agora" className="button">
          Ver o que mudou
        </Link>
        <Link href="/edicoes" className="button-secondary">
          Edição do momento
        </Link>
        <Link href="/buscar" className="button-secondary">
          Buscar no arquivo
        </Link>
      </div>
    </section>
  );
}
