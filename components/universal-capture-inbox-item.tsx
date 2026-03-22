import type { UniversalCapture } from "@/lib/captura/queries";
import { archiveCaptureAction, publishCaptureAction, sendToEnrichmentAction } from "@/lib/captura/actions";

type Props = {
  item: UniversalCapture;
  feedbackMessage?: string | null;
  feedbackStatus?: string | null;
  active?: boolean;
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

export function UniversalCaptureInboxItem({ item, feedbackMessage, feedbackStatus, active }: Props) {
  const showFeedback = Boolean(active && feedbackMessage);
  const feedbackTone = feedbackStatus === "error" ? "var(--alert, #991b1b)" : "var(--success, #166534)";
  const feedbackBg = feedbackStatus === "error" ? "var(--alert-bg, #fee2e2)" : "var(--success-bg, #dcfce7)";

  return (
    <article className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>
            {item.title || "Captura sem titulo"}
          </h3>
          <p className="eyebrow" style={{ color: "var(--foreground-50)" }}>
            Sugestao: {item.suggested_type || "Nenhuma"}
            {item.file_type ? ` · Arquivo: ${item.file_type}` : ""}
          </p>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--foreground-50)" }}>
          {formatSafeDate(item.created_at)}
        </span>
      </div>

      {item.raw_text ? (
        <div style={{ padding: "0.75rem", background: "var(--foreground-5)", borderRadius: "4px", fontSize: "0.875rem", maxHeight: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.raw_text}
        </div>
      ) : null}

      {item.file_url ? (
        <div style={{ padding: "0.5rem", border: "1px dashed var(--border)", borderRadius: "4px", fontSize: "0.875rem" }}>
          <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)", textDecoration: "underline" }}>
            Visualizar arquivo anexo
          </a>
        </div>
      ) : null}

      {showFeedback ? (
        <div
          style={{
            marginTop: "auto",
            padding: "0.75rem",
            borderRadius: "4px",
            background: feedbackBg,
            color: feedbackTone,
            fontSize: "0.875rem",
            fontWeight: "bold",
          }}
        >
          {feedbackMessage}
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", flexWrap: "wrap" }}>
          <form action={publishCaptureAction}>
            <input type="hidden" name="id" value={item.id} />
            <button className="button-secondary" style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }} type="submit">
              Publicar (Agora)
            </button>
          </form>
          <form action={archiveCaptureAction}>
            <input type="hidden" name="id" value={item.id} />
            <button className="button-secondary" style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }} type="submit">
              Guardar (Acervo)
            </button>
          </form>
          <form action={sendToEnrichmentAction}>
            <input type="hidden" name="id" value={item.id} />
            <button className="button-secondary" style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }} type="submit">
              Revisar Depois
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
