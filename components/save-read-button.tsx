"use client";

import { useEffect, useMemo, useState } from "react";

import { getSavedReadLabel, isSavedRead, toggleRead } from "@/lib/pwa/saved-reads";

type Props = {
  kind: string;
  keyValue: string;
  title: string;
  summary: string;
  href: string;
  compact?: boolean;
};

export function SaveReadButton({ kind, keyValue, title, summary, href, compact = false }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSavedRead(kind, keyValue));
  }, [kind, keyValue]);

  const label = useMemo(() => (saved ? "Salvo" : "Salvar"), [saved]);

  return (
    <button
      type="button"
      className={compact ? "button-secondary save-read-button save-read-button--compact" : "button-secondary save-read-button"}
      aria-pressed={saved}
      aria-label={`${saved ? "Remover de" : "Adicionar aos"} salvos ${getSavedReadLabel(kind)}`}
      onClick={() => {
        toggleRead({ kind, key: keyValue, title, summary, href, label: getSavedReadLabel(kind) });
        setSaved((current) => !current);
      }}
    >
      {label}
    </button>
  );
}