"use client";

import { useActionState } from "react";
import { uploadPrivateCapture } from "@/app/interno/capturar/private-actions";

export function PrivateCaptureDocuments({ captureId, documents }: { captureId: string; documents: { id: string }[] }) {
  const [state, action, pending] = useActionState(uploadPrivateCapture, { ok: false, message: "" });
  return (
    <div className="support-box">
      <p><strong>PRIVADO — DOCUMENTO INTERNO</strong></p>
      <p>O arquivo é guardado para revisão. Não é publicado com a matéria.</p>
      {documents.map((doc) => <p key={doc.id}><a href={`/api/interno/documentos/${doc.id}`}>Abrir documento interno</a></p>)}
      <form action={action} encType="multipart/form-data">
        <input type="hidden" name="capture_id" value={captureId} />
        <label>Arquivo (até 900 KiB)
          <input name="file" type="file" accept=".jpg,.jpeg,.png,.pdf,.mp3,.wav,.ogg" required />
        </label>
        <button className="button-secondary" type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar documento privado"}</button>
        <p aria-live="polite">{state.message}</p>
      </form>
    </div>
  );
}
