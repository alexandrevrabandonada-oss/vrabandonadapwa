"use client";

import { useState } from "react";

type Props = {
  title: string;
  summary: string;
  caption: string;
  url: string;
};

async function copyText(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }

  await navigator.clipboard.writeText(text);
  return true;
}

export function ShareTools({ title, summary, caption, url }: Props) {
  const [status, setStatus] = useState("Pronto para copiar.");

  async function handleCopyLink() {
    const ok = await copyText(url);
    setStatus(ok ? "Link copiado." : "Não foi possível copiar o link.");
  }

  async function handleCopySummary() {
    const ok = await copyText(summary);
    setStatus(ok ? "Resumo copiado." : "Não foi possível copiar o resumo.");
  }

  async function handleCopyCaption() {
    const ok = await copyText(`${caption}\n\n${url}`);
    setStatus(ok ? "Legenda copiada." : "Não foi possível copiar a legenda.");
  }

  async function handleNativeShare() {
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      setStatus("Compartilhamento nativo indisponível.");
      return;
    }

    try {
      await navigator.share({ title, text: caption, url });
      setStatus("Compartilhado.");
    } catch {
      setStatus("Compartilhamento cancelado.");
    }
  }

  return (
    <div className="support-box share-tools">
      <p className="eyebrow">compartilhar</p>
      <div className="stack-actions">
        <button className="button-secondary" type="button" onClick={handleCopyLink}>
          Copiar link
        </button>
        <button className="button-secondary" type="button" onClick={handleCopySummary}>
          Copiar resumo
        </button>
        <button className="button-secondary" type="button" onClick={handleCopyCaption}>
          Copiar legenda
        </button>
        <button className="button-secondary" type="button" onClick={handleNativeShare}>
          Compartilhar nativo
        </button>
      </div>
      <p className="form-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
