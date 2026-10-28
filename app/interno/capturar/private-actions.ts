"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { authorizePrivateDocuments, PRIVATE_BUCKET } from "@/lib/media/private-server";
import { PRIVATE_FILE_LIMIT, validatePrivateFile } from "@/lib/media/private-validation";

export type PrivateUploadState = { ok: boolean; message: string };

export async function uploadPrivateCapture(_: PrivateUploadState, formData: FormData): Promise<PrivateUploadState> {
  try {
    const context = await authorizePrivateDocuments();
    if (!context) return { ok: false, message: "Acesso não autorizado ou armazenamento privado indisponível." };
    const captureId = String(formData.get("capture_id") || "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(captureId)) return { ok: false, message: "Captura inválida." };
    const { data: capture, error: captureError } = await context.userClient.from("universal_captures").select("id").eq("id", captureId).maybeSingle();
    if (captureError || !capture) return { ok: false, message: "Captura indisponível para esta sessão." };
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size || file.size > PRIVATE_FILE_LIMIT) return { ok: false, message: "Escolha um arquivo de até 900 KiB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const spec = validatePrivateFile(file.name, file.type, bytes);
    if (!spec) return { ok: false, message: "Formato inválido. Use JPEG, PNG, PDF, MP3, WAV ou OGG compatível." };
    const id = randomUUID();
    const path = `${id}.${spec.extension}`;
    const { error: uploadError } = await context.service.storage.from(PRIVATE_BUCKET).upload(path, bytes, { contentType: spec.mime, cacheControl: "0", upsert: false });
    if (uploadError) return { ok: false, message: "Não foi possível guardar o arquivo privado." };
    const { error: insertError } = await context.service.from("private_editorial_documents").insert({
      id, capture_id: captureId, object_path: path, mime_type: spec.mime, byte_size: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      origin: "captura", purpose: "revisão", created_by: context.user.id,
    });
    if (insertError) {
      const { error: cleanupError } = await context.service.storage.from(PRIVATE_BUCKET).remove([path]);
      if (cleanupError) console.error("Limpeza de upload privado pendente; revisar inventário administrativo.");
      return { ok: false, message: insertError.code === "23505" ? "Este documento já está associado a esta captura." : "Não foi possível registrar o arquivo. Verifique a captura antes de repetir." };
    }
    revalidatePath("/interno/capturar");
    return { ok: true, message: "Documento interno guardado. Não foi publicado." };
  } catch {
    return { ok: false, message: "O armazenamento privado está indisponível." };
  }
}
