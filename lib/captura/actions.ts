"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  // Bloqueio preventivo: o bucket legado de anexos está marcado como público.
  // Não aceitar novo arquivo sensível antes da migração e dos testes do bucket privado.
  if (file) {
    return { ok: false, message: "Anexos estão temporariamente desativados para proteger as fontes. Cole apenas texto sem dados pessoais; o armazenamento privado está em implantação." };
  }
  if (!rawText) {
    return { ok: false, message: "Adicione uma anotação para guardar na Inbox." };
  }

  const { supabase, user, authError } = await ensureInternalSession();

  if (authError || !user) {
    return { ok: false, message: "Sua sessao interna expirou. Entre novamente antes de capturar." };
  }

  // Somente notas textuais não sensíveis por enquanto; anexos exigem armazenamento privado.
  const title = rawText!.substring(0, 80);
  const suggestedType = rawText!.startsWith("http") ? "link" : "post";

  const { error } = await supabase.from("universal_captures").insert({
    raw_text: rawText,
    file_url: null,
    file_type: null,
    suggested_type: suggestedType,
    title,
    status: "inbox",
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    console.error("Falha ao guardar nota de captura", { code: error.code });
    return { ok: false, message: "Não foi possível guardar a nota. Tente novamente." };
  }

  revalidatePath("/interno/capturar");
  return { ok: true, message: "Material capturado com sucesso!" };
}

export async function submitUniversalCaptureAction(formData: FormData) {
  const result = await saveUniversalCapture(initialCaptureState, formData);
  redirectToCapture(result);
}

export async function publishCapture(id: string, editorialApproved = false) {
  // Publicação rápida depende de revisão E2E do banco e do fluxo de auditoria.
  // Padrão seguro: desativada até habilitação explícita após implantação da RPC.
  if (process.env.VR_ENABLE_FAST_PUBLISH !== "true") {
    return { ok: false, message: "Publicação direta em revisão técnica. Encaminhe para enriquecimento e aprovação editorial." };
  }
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

  if (capture.file_url) {
    return { ok: false, message: "Capturas com arquivos legados precisam de revisão e proteção de acesso antes de qualquer publicação." };
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
    cover_image_url: null,
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
  // O arquivo de destino legado usa um bucket público, mesmo quando public_visibility=false.
  // Desativado até existir um bucket privado com URLs assinadas e permissões verificadas.
  void id;
  return { ok: false, message: "Arquivamento de anexos suspenso até implantar o armazenamento privado." };
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
