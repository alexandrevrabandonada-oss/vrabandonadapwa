"use client";

import { useState } from "react";
import { submitUniversalCaptureAction } from "@/lib/captura/actions";

type Props = {
  message?: string | null;
  status?: string | null;
};

export function UniversalCaptureComposer({ message, status }: Props) {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fileInput = e.currentTarget.elements.namedItem("file") as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      // 9MB limit to stay safely under Next.js 10MB bodySizeLimit
      if (file.size > 9 * 1024 * 1024) {
        e.preventDefault();
        setLocalError("O arquivo é muito grande. O limite máximo é 9MB.");
      }
    }
  };

  const currentStatus = localError ? "error" : status;
  const currentMessage = localError || message;

  const tone = currentStatus === "error" ? "var(--alert)" : currentStatus === "ok" ? "var(--success)" : "var(--foreground-50)";
  const text = currentMessage || "Jogue o material aqui primeiro. Decida para onde vai depois.";

  return (
    <div className="card" style={{ padding: "1.5rem", background: "var(--background-alt)", border: "1px solid var(--border)" }}>
      <form onSubmit={handleSubmit} action={submitUniversalCaptureAction} encType="multipart/form-data" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
            onChange={() => setLocalError(null)}
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
