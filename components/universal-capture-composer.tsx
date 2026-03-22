"use client";

import { useState, useRef } from "react";
import { saveUniversalCapture } from "@/lib/captura/actions";

export function UniversalCaptureComposer() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCapturing(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const text = formData.get("raw_text")?.toString().trim();
    const file = formData.get("file") as File;

    if (!text && (!file || file.size === 0)) {
        setMessage("Adicione um texto, link ou arquivo para colar na Inbox.");
        setIsCapturing(false);
        return;
    }

    try {
      // For real application, this should use a proper client upload or server action with RLS
      const res = await saveUniversalCapture(formData);
      if (res.ok) {
        formRef.current?.reset();
        setMessage("Material capturado com sucesso!");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(res.message);
      }
    } catch (err) {
       console.error(err);
       setMessage("Erro inesperado ao capturar. Tente novamente.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem", background: "var(--background-alt)", border: "1px solid var(--border)" }}>
      <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="raw_text" className="eyebrow" style={{ color: "var(--foreground-50)" }}>
            Anotação ou Link
          </label>
          <textarea
            id="raw_text"
            name="raw_text"
            placeholder="Cole o texto, ideia ou url de referência..."
            rows={4}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="file" className="eyebrow" style={{ color: "var(--foreground-50)" }}>
            Arquivo Rápido (Opcional)
          </label>
          <input
            id="file"
            name="file"
            type="file"
            style={{ padding: "0.75rem", borderRadius: "4px", border: "1px dotted var(--foreground-50)", background: "var(--foreground-5)", cursor: "pointer" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
          <button 
            type="submit" 
            className="button" 
            disabled={isCapturing}
            style={{ padding: "0.75rem 1.5rem", fontWeight: "bold" }}
          >
            {isCapturing ? "Subindo..." : "Guardar na Inbox"}
          </button>
          
          {message && <span style={{ fontSize: "0.875rem", color: message.includes("Erro") ? "var(--alert)" : "var(--success)" }}>{message}</span>}
        </div>
      </form>
    </div>
  );
}
