import { submitUniversalCaptureAction } from "@/lib/captura/actions";

type Props = {
  message?: string | null;
  status?: string | null;
};

export function UniversalCaptureComposer({ message, status }: Props) {
  const tone = status === "error" ? "var(--alert)" : status === "ok" ? "var(--success)" : "var(--foreground-50)";
  const text = message || "Jogue o material aqui primeiro. Decida para onde vai depois.";

  return (
    <div className="card" style={{ padding: "1.5rem", background: "var(--background-alt)", border: "1px solid var(--border)" }}>
      <form action={submitUniversalCaptureAction} encType="multipart/form-data" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="raw_text" className="eyebrow" style={{ color: "var(--foreground-50)" }}>
            Anotacao ou Link
          </label>
          <textarea
            id="raw_text"
            name="raw_text"
            placeholder="Cole o texto, ideia ou url de referencia..."
            rows={4}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="file" className="eyebrow" style={{ color: "var(--foreground-50)" }}>
            Arquivo Rapido (Opcional)
          </label>
          <input
            id="file"
            name="file"
            type="file"
            style={{ padding: "0.75rem", borderRadius: "4px", border: "1px dotted var(--foreground-50)", background: "var(--foreground-5)", cursor: "pointer" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", gap: "1rem", flexWrap: "wrap" }}>
          <button type="submit" className="button" style={{ padding: "0.75rem 1.5rem", fontWeight: "bold" }}>
            Guardar na Inbox
          </button>

          <span style={{ fontSize: "0.875rem", color: tone }} aria-live="polite">
            {text}
          </span>
        </div>
      </form>
    </div>
  );
}
