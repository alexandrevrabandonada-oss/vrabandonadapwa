"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { saveUniversalCaptureMetadata } from "@/lib/captura/actions";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getClientSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

function detectFileType(mime: string) {
  if (mime.startsWith("image/")) return { fileType: "image" as const, suggestedType: "photo" };
  if (mime === "application/pdf") return { fileType: "pdf" as const, suggestedType: "doc" };
  if (mime.startsWith("video/")) return { fileType: "video" as const, suggestedType: "video" };
  if (mime.startsWith("audio/")) return { fileType: "audio" as const, suggestedType: "audio" };
  return { fileType: "other" as const, suggestedType: "doc" };
}

export function UniversalCaptureComposer() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCapturing(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const rawText = formData.get("raw_text")?.toString().trim() || null;
    const file = formData.get("file") as File | null;
    const hasFile = file && file.size > 0;

    if (!rawText && !hasFile) {
      setMessage("Adicione um texto, link ou arquivo para colar na Inbox.");
      setIsCapturing(false);
      return;
    }

    try {
      let fileUrl: string | null = null;
      let fileType: string | null = null;
      let suggestedType: string | null = null;
      let title: string | null = null;

      // 1. Upload file client-side directly to Supabase Storage
      if (hasFile) {
        const supabase = getClientSupabase();
        const detected = detectFileType(file.type);
        fileType = detected.fileType;
        suggestedType = detected.suggestedType;

        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("archive-assets")
          .upload(`captures/${fileName}`, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error", uploadError);
          setMessage(`Erro no upload: ${uploadError.message}`);
          setIsCapturing(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("archive-assets")
          .getPublicUrl(`captures/${fileName}`);

        fileUrl = publicUrlData.publicUrl;
        title = file.name;
      }

      // 2. Detect type for text-only captures
      if (!fileUrl && rawText) {
        suggestedType = rawText.startsWith("http") ? "link" : "post";
        title = rawText.substring(0, 50) + (rawText.length > 50 ? "..." : "");
      }

      // 3. Save metadata via server action (no file in payload, just strings)
      const res = await saveUniversalCaptureMetadata({
        rawText, fileUrl, fileType, suggestedType, title,
      });

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

