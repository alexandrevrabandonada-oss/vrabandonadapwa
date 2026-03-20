"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { clearSavedReads, getSavedReadLabel, getSavedReads, removeRead, type SavedRead } from "@/lib/pwa/saved-reads";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function SavedReadsClient() {
  const [items, setItems] = useState<SavedRead[]>([]);

  useEffect(() => {
    const sync = () => setItems(getSavedReads());
    sync();

    const onStorage = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  const grouped = useMemo(() => {
    return items.reduce<Record<string, SavedRead[]>>((acc, item) => {
      const key = item.kind || "page";
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    }, {});
  }, [items]);

  if (!items.length) {
    return (
      <section className="section">
        <div className="support-box saved-reads-empty">
          <p className="eyebrow">sem leituras salvas</p>
          <h2>Guarde uma pauta, edição, campanha ou dossiê no aparelho.</h2>
          <p>
            O que você salva aqui fica localmente no celular ou computador e ajuda a voltar ao arquivo sem depender de busca ou memória de link.
          </p>
          <div className="stack-actions">
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
            <Link href="/edicoes" className="button-secondary">
              Ver edições
            </Link>
            <Link href="/campanhas" className="button-secondary">
              Ver campanhas
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section saved-reads-section">
      <div className="grid-2">
        <div>
          <p className="eyebrow">salvos locais</p>
          <h2>Leituras guardadas neste aparelho.</h2>
        </div>
        <p className="section__lead">
          O salvos é a memória curta do celular. Ele ajuda a voltar depois sem sync em nuvem, sem login e sem perder o fio do projeto.
        </p>
      </div>

      <div className="stack-actions saved-reads-actions">
        <button type="button" className="button-secondary" onClick={() => { clearSavedReads(); setItems([]); }}>
          Limpar tudo
        </button>
        <Link href="/agora" className="button-secondary">
          Ver radar
        </Link>
        <Link href="/participe" className="button-secondary">
          Participar
        </Link>
      </div>

      <div className="grid-2">
        {Object.entries(grouped).map(([kind, group]) => (
          <article className="support-box saved-reads-group" key={kind}>
            <p className="eyebrow">{getSavedReadLabel(kind)}</p>
            <div className="saved-reads-group__list">
              {group.map((item) => (
                <article className="saved-read-card" key={`${item.kind}:${item.key}`}>
                  <div className="saved-read-card__body">
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <p className="saved-read-card__meta">Salvo em {formatDate(item.savedAt)}</p>
                  </div>
                  <div className="stack-actions">
                    <Link href={item.href} className="button-secondary">
                      Abrir
                    </Link>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        removeRead(item.kind, item.key);
                        setItems(getSavedReads());
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}