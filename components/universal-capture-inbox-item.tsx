"use client";

import { useState } from "react";
import type { UniversalCapture } from "@/lib/captura/queries";
import { publishCapture, archiveCapture, sendToEnrichment } from "@/lib/captura/actions";

type Props = {
  item: UniversalCapture;
};

function formatSafeDate(value: string | null | undefined) {
  if (!value) {
    return "Data indefinida";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Data indefinida";
  }

  return date.toLocaleDateString("pt-BR");
}

export function UniversalCaptureInboxItem({ item }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; err: boolean } | null>(null);

  const handlePublish = async () => {
    setIsUpdating(true);
    const res = await publishCapture(item.id);
    setFeedback({ msg: res.message, err: !res.ok });
    setIsUpdating(false);
  };

  const handleArchive = async () => {
    setIsUpdating(true);
    const res = await archiveCapture(item.id);
    setFeedback({ msg: res.message, err: !res.ok });
    setIsUpdating(false);
  };

  const handleEnrich = async () => {
    setIsUpdating(true);
    const res = await sendToEnrichment(item.id);
    setFeedback({ msg: res.message, err: !res.ok });
    setIsUpdating(false);
  };

  return (
    <article className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>
            {item.title || "Captura sem título"}
          </h3>
          <p className="eyebrow" style={{ color: "var(--foreground-50)" }}>
             Sugestão: {item.suggested_type || "Nenhuma"} 
             {item.file_type ? ` · Arquivo: ${item.file_type}` : ""}
          </p>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--foreground-50)" }}>
          {formatSafeDate(item.created_at)}
        </span>
      </div>

      {item.raw_text && (
        <div style={{ padding: "0.75rem", background: "var(--foreground-5)", borderRadius: "4px", fontSize: "0.875rem", maxHeight: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.raw_text}
        </div>
      )}

      {item.file_url && (
        <div style={{ padding: "0.5rem", border: "1px dashed var(--border)", borderRadius: "4px", fontSize: "0.875rem" }}>
          <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)", textDecoration: "underline" }}>
            Visualizar Arquivo Anexo
          </a>
        </div>
      )}

      {feedback ? (
        <div style={{ 
          marginTop: "auto", 
          padding: "0.75rem", 
          borderRadius: "4px", 
          background: feedback.err ? "var(--alert-bg, #fee2e2)" : "var(--success-bg, #dcfce7)", 
          color: feedback.err ? "var(--alert, #991b1b)" : "var(--success, #166534)",
          fontSize: "0.875rem",
          fontWeight: "bold"
        }}>
          {feedback.msg}
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", flexWrap: "wrap" }}>
          <button 
            className="button-secondary" 
            style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }} 
            disabled={isUpdating}
            onClick={handlePublish}
          >
            Publicar (Agora)
          </button>
          <button 
            className="button-secondary" 
            style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }} 
            disabled={isUpdating}
            onClick={handleArchive}
          >
            Guardar (Acervo)
          </button>
          <button 
            className="button-secondary" 
            style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }} 
            disabled={isUpdating}
            onClick={handleEnrich}
          >
            Revisar Depois
          </button>
        </div>
      )}
    </article>
  );
}
