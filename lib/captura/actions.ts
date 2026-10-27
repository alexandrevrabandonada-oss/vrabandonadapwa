"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { removeArchiveAsset, uploadArchiveAsset } from "@/lib/media/archive";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmailAllowed } from "@/lib/admin";

export type CaptureActionState = {
  ok: boolean;
  message: string;
};

const initialCaptureState: CaptureActionState = {
  ok: false,
  message: "",
};

function detectFileType(mime: string) {
  if (mime.startsWith("image/")) return { fileType: "image", suggestedType: "photo" };
  if (mime === "application/pdf") return { fileType: "pdf", suggestedType: "doc" };
  if (mime.startsWith("video/")) return { fileType: "video", suggestedType: "video" };
  if (mime.startsWith("audio/")) return { fileType: "audio", suggestedType: "audio" };
  return { fileType: "other", suggestedType: "doc" };
}

function extractArchivePathFromUrl(fileUrl: string | null) {
  if (!fileUrl) {
    return null;
  }

  const marker = "/storage/v1/object/public/archive-assets/";
  const index = fileUrl.index(marker);

  if (index === -1) {
    return null;
  }

  return fileUrl.slice(index + marker.length);
}

function resolveArchiveAssetType(capture: { suggested_type: string | null; file_type: string | null }) {
  if (capture.suggested_type === "photo" || capture.file_type === "image") {
    return "photo";
  }

  if (capture.file_type === "pdf") {
    return "pdf";
  }

  if (capture.file_type === "audio") {
    return "audio";
  }

  return "document";
}


function getFile(formData: FormData) {
  const file = formData.get("file");
  return file instanceof File && file.size > 0 ? file : null;
}

async function ensureInternalSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email || !(await isAdminEmailAllowed(user.email))) {
    return { supabase, user: null, authError: true as const };
  }

  return { supabase, user, authError: false as const };
}

function redirectToCapture(result: CaptureActionState, itemId?: string) {
  const params = new URLSearchParams();
  params.set("status", result.ok ? "ok" : "error");
  params.set("message", result.message);

  if (itemId) {
    params.set("item", itemId);
  }

  redirect(`/interno/capturar?${params.toString()}`);
}

export async function saveUniversalCapture(
  previousState: CaptureActionState = initialCaptureState,
  formData: FormData,
): Promise<CaptureActionState> {
  void previousState;
  const rawText = formData.get("raw_text")?.toString().trim() || null;
  const file = getFile(formData);

  if (!rawText && !file) {
    return { ok: false, message: "Adicione um texto, link ou arquivo para colar na Inbox." };
  }

  const { supabase, user, authError } = await ensureInternalSession();

  if (authError || !user) {
    return { ok: false, message: "Sua sessao interna expirou. Entre novamente antes de capturar." };
  }

  let fileUrl: string | null = null;
  let fileType: string | null = null;
  let suggestedType: string | null = null;
  let title: string | null = null;
  let uploadedPath: string | null = null;

  if (file) {
    const detected = detectFileType(file.type || "");
    fileType = detected.fileType;
    suggestedType = detected.suggestedType;

    try {
      const uploaded = await uploadArchiveAsset(file, randomUUID());
      fileUrl = uploaded.url;
      uploadedPath = uploaded.path;
      title = file.name;
    } catch (uploadError) {
      console.error("Failed to upload universal capture file", uploadError);
      return { ok: false, message: "Nao foi possivel enviar o arquivo agora. Tente novamente." };
    }
  }

  if (!fileUrl && rawText) {
    suggestedType = rawText.startsWith("http") ? "link" : "post";
    title = rawText.substring(0, 50) + (rawText.length > 50 ? "..." : "");
  }

  const { error } = await supabase.from("universal_captures").insert({
    raw_text: rawText,
    file_url: fileUrl,
    file_type: fileType,
    suggested_type: suggestedType,
    title,
    status: "inbox",
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    console.error("DB Insert error", error);

    if (uploadedPath) {
      await removeArchiveAsset(uploadedPath).catch((cleanupError) => {
        console.error("Failed to remove failed universal capture file", cleanupError);
      });
    }

    return { ok: false, message: `Erro ao salvar na inbox: ${error.message}` };
  }

  revalidatePath("/interno/capturar");
  return { ok: true, message: "Material capturado com sucesso!" };
}

export async function submitUniversalCaptureAction(formData: FormData) {
  const result = await saveUniversalCapture(initialCaptureState, formData);
  redirectToCapture(result);
}

export async function publishCapture(id: string, editorialApproved = false) {
  if (!editorialApproved) {
    return { ok: false, message: "Confirme a revisão editorial antes de publicar." };
  }

  const { supabase, user, authError } = await ensureInternalSession();
  if (authError || !user) {
    return { ok: false, message: "Acesso editorial não autorizado. Entre novamente." };
  }

  const { data: capture, error: readError } = await supabase
    .from("universal_captures")
    .select("id,title,raw_text,file_url,status")
    .eq("id", id)
    .eq("status", "inbox")
    .maybeSingle();
  if (readError || !capture) {
    return { ok: false, message: "Item não encontrado na inbox ou já encaminhado." };
  }

  const title = String(capture.title || "").trim();
  const body = String(capture.raw_text || "").trim();
  // Não criar notícia a partir de nome de arquivo ou texto insuficiente.
  if (title.length < 10 || body.length < 60) {
    return { ok: false, message: "Para publicar, descreva e confira o conteúdo (mínimo de 60 caracteres). Use 'Revisar Depois' para itens incompletos." };
  }

  // Condição no servidor para impedir que dois cliques publiquem o mesmo registro.
  // Na próxima etapa, substituir por transação RPC para recuperação após queda.
  const { data: claimed, error: claimError } = await supabase
    .from("universal_captures")
    .update({ status: "published", updated_by: user.email })
    .eq("id", id)
    .eq("status", "inbox")
    .select("id")
    .maybeSingle();
  if (claimError || !claimed) {
    return { ok: false, message: "Este material já foi processado ou não pôde ser reservado." };
  }

  const slug = `agora-${id.replace(/-/g, "")}`;
  const { error: publicationError } = await supabase.from("editorial_items").insert({
    title,
    slug,
    body,
    excerpt: body.slice(0, 220),
    category: "post",
    cover_image_url: capture.file_url,
    editorial_status: "published",
    review_status: "reviewed",
    sensitivity_check_passed: true,
    fact_check_note: "Conferência editorial confirmada na Captura Universal; revisar evidências e contexto nas atualizações.",
    published: true,
    published_at: new Date().toISOString(),
    published_by: user.email,
    last_reviewed_at: new Date().toISOString(),
    last_reviewed_by: user.email,
  });

  if (publicationError) {
    console.error("Falha na publicação rápida", { code: publicationError.code, id });
    const { error: rollbackError } = await supabase
      .from("universal_captures")
      .update({ status: "inbox", updated_by: user.email })
      .eq("id", id)
      .eq("status", "published");
    if (rollbackError) {
      console.error("Falha ao restaurar item de publicação rápida", { code: rollbackError.code, id });
      return { ok: false, message: "Falha na publicação e na recuperação automática. Verifique o item com a equipe antes de repetir." };
    }
    return { ok: false, message: "Não foi possível publicar. O material retornou para a inbox." };
  }

  revalidatePath("/interno/capturar");
  revalidatePath("/");
  revalidatePath("/agora");
  revalidatePath("/pautas");
  return { ok: true, message: "Publicação criada. Confira a URL pública e o conteúdo." };
}

export async function publishCaptureAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) redirectToCapture({ ok: false, message: "Captura inválida para publicação." });
  const approval = formData.get("confirm_editorial_review") === "yes";
  const result = await publishCapture(id!, approval);
  redirectToCapture(result, id!);
}

export async function archiveCapture(id: string) {
  const { supabase, user, authError } = await ensureInternalSession();

  if (authError || !user) {
    return { ok: false, message: "Sua sessao interna expirou. Entre novamente antes de arquivar." };
  }

  const { data: capture } = await supabase.from("universal_captures").select("*").eq("id", id).single();
  if (!capture) return { ok: false, message: "Captura nao encontrada." };

  const filePath = extractArchivePathFromUrl(capture.file_url);

  if (!capture.file_url || !filePath) {
    return { ok: false, message: "Esse item nao tem arquivo valido para entrar no Acervo." };
  }

  const assetId = randomUUID();
  const assetType = resolveArchiveAssetType(capture);
  const thumbUrl = assetType === "photo" ? capture.file_url : null;
  const thumbPath = assetType === "photo" ? filePath : null;

  const { error: insErr } = await supabase.from("archive_assets").insert({
    id: assetId,
    memory_item_id: null,
    editorial_item_id: null,
    collection_slug: null,
    title: capture.title || "Material Guardado",
    asset_type: assetType,
    file_url: capture.file_url,
    file_path: filePath,
    thumb_url: thumbUrl,
    thumb_path: thumbPath,
    source_label: capture.suggested_type === "photo" ? "Captura universal" : "Inbox de captura",
    source_date_label: "",
    approximate_year: null,
    place_label: null,
    rights_note: "Uso editorial controlado",
    description: capture.raw_text || null,
    public_visibility: false,
    featured: false,
    sort_order: 0,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (insErr) {
    console.error("Erro insert archive_assets", insErr);
    return { ok: false, message: `Erro ao guardar no Acervo: ${insErr.message}` };
  }

  await supabase.from("universal_captures").update({ status: "archived" }).eq("id", id);
  revalidatePath("/interno/capturar");
  revalidatePath("/interno/acervo");
  revalidatePath(`/interno/acervo/${assetId}`);

  return { ok: true, message: "O material entrou no Acervo interno." };
}

export async function archiveCaptureAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) {
    redirectToCapture({ ok: false, message: "Captura invalida para arquivar." });
  }

  const result = await archiveCapture(id!);
  redirectToCapture(result, id!);
}

export async function sendToEnrichment(id: string) {
  const { supabase, user, authError } = await ensureInternalSession();
  if (authError || !user) {
    return { ok: false, message: "Acesso editorial não autorizado." };
  }

  const { data: capture } = await supabase.from("universal_captures").select("*").eq("id", id).single();
  if (!capture) return { ok: false, message: "Captura nao encontrada." };

  let entryType = "document";
  if (capture.suggested_type === "photo" || capture.suggested_type === "image") entryType = "image";
  if (capture.suggested_type === "post" || capture.suggested_type === "link") entryType = "post";

  const { error: insErr } = await supabase.from("editorial_entries").insert({
    title: capture.title || "Captura para Enriquecer",
    entry_type: entryType,
    entry_status: "ready_for_enrichment",
    summary: capture.raw_text,
    file_url: capture.file_url,
    notes: "Vindo da Inbox de Captura Universal",
  });

  if (insErr) {
    console.error("Erro insert editorial_entries", insErr);
    return { ok: false, message: "Erro ao mandar para enriquecimento." };
  }

  await supabase.from("universal_captures").update({ status: "enriched" }).eq("id", id);
  revalidatePath("/interno/capturar");

  return { ok: true, message: "Item na fila de Enriquecimento (/interno/enriquecer)." };
}

export async function sendToEnrichmentAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) {
    redirectToCapture({ ok: false, message: "Captura invalida para enriquecimento." });
  }

  const result = await sendToEnrichment(id!);
  redirectToCapture(result, id!);
}
