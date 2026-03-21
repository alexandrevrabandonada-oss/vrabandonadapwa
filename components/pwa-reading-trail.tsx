"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  buildTrailItem,
  getReadingTrailItems,
  isPublicTrailPath,
  recordReadingTrail,
  subscribeToReadingTrailChanges,
  type ReadingTrailItem,
} from "@/lib/pwa/reading-trail";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getCurrentMeta() {
  const title = document.title.replace(/\s[·|]\sVR Abandonada$/u, "").trim();
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content");

  return { title, description };
}

export function PwaReadingTrailTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPublicTrailPath(pathname)) {
      return;
    }

    const id = window.setTimeout(() => {
      const { title, description } = getCurrentMeta();
      recordReadingTrail(
        buildTrailItem({
          pathname,
          title,
          description,
        }),
      );
    }, 0);

    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

export function ReadingTrailPanel({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [items, setItems] = useState<ReadingTrailItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getReadingTrailItems());
    sync();

    return subscribeToReadingTrailChanges(sync);
  }, []);

  const availableItems = items.filter((item) => item.href !== pathname);
  const primary = availableItems[0] ?? items[0] ?? null;
  const recent = availableItems.slice(0, compact ? 2 : 3);

  return (
    <section className={compact ? "section reading-trail-section reading-trail-section--compact" : "section reading-trail-section"}>
      <div className="grid-2">
        <div>
          <p className="eyebrow">retorno diário</p>
          <h2>Volte para o que ficou em curso.</h2>
        </div>
        <p className="section__lead">
          O app guarda as últimas páginas públicas que você abriu neste aparelho e ajuda a retomar sem caça ao link ou scroll perdido.
        </p>
      </div>

      {primary ? (
        <div className="reading-trail-current">
          <article className="support-box reading-trail-current__card">
            <p className="eyebrow">continuar leitura</p>
            <h3>{primary.title}</h3>
            <p>{primary.summary}</p>
            <p className="meta-row">
              <span>{primary.label}</span>
              <span>{formatDate(primary.visitedAt)}</span>
            </p>
            <div className="stack-actions">
              <Link href={primary.href} className="button">
                Abrir agora
              </Link>
              <Link href="/acompanhar" className="button-secondary">
                Ir para acompanhar
              </Link>
            </div>
          </article>

          <article className="support-box reading-trail-current__list">
            <p className="eyebrow">últimas aberturas</p>
            <div className="reading-trail-list">
              {recent.length ? (
                recent.map((item) => (
                  <article className="reading-trail-item" key={`${item.kind}:${item.key}`}>
                    <p className="meta-row">
                      <span>{item.label}</span>
                      <span>{formatDate(item.visitedAt)}</span>
                    </p>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <Link href={item.href} className="button-secondary">
                      Retomar
                    </Link>
                  </article>
                ))
              ) : (
                <p>Abra um conteúdo público e ele entra aqui para a próxima volta.</p>
              )}
            </div>
          </article>
        </div>
      ) : (
        <article className="support-box reading-trail-empty">
          <p className="eyebrow">sem trilha recente</p>
          <h3>Comece pelo radar ou por uma edição.</h3>
          <p>
            Depois da primeira abertura, o app passa a mostrar o que você deixou em curso no próprio aparelho.
          </p>
          <div className="stack-actions">
            <Link href="/agora" className="button-secondary">
              Ver radar
            </Link>
            <Link href="/edicoes" className="button-secondary">
              Ver edições
            </Link>
            <Link href="/salvos" className="button-secondary">
              Abrir salvos
            </Link>
          </div>
        </article>
      )}
    </section>
  );
}
