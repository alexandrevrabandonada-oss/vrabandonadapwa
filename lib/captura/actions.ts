"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveUniversalCapture(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const rawText = formData.get("raw_text")?.toString().trim() || null;
  const file = formData.get("file") as File | null;

  let fileUrl: string | null = null;
  let fileType: string | null = null;
  let suggestedType: string | null = null;
  let title: string | null = null;

  if (file && file.size > 0) {
    // Basic type suggestion based on mime
    const mime = file.type;
    if (mime.startsWith("image/")) {
      fileType = "image";
      suggestedType = "photo";
    } else if (mime === "application/pdf") {
      fileType = "pdf";
      suggestedType = "doc";
    } else if (mime.startsWith("video/")) {
      fileType = "video";
      suggestedType = "video";
    } else if (mime.startsWith("audio/")) {
      fileType = "audio";
      suggestedType = "audio";
    } else {
      fileType = "other";
      suggestedType = "doc";
    }

    // Upload reliable file
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("universal_captures")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error", uploadError);
      return { ok: false, message: "Erro ao fazer upload do arquivo. Tente novamente." };
    }
    
    const { data: publicUrlData } = supabase.storage
      .from("universal_captures")
      .getPublicUrl(fileName);
      
    fileUrl = publicUrlData.publicUrl;
    title = file.name;
  }

  if (!fileUrl && rawText) {
    // If no file but there's a link
    if (rawText.startsWith("http")) {
      suggestedType = "link";
    } else {
      suggestedType = "post";
    }
    
    // Auto title for text
    title = rawText.substring(0, 50) + (rawText.length > 50 ? "..." : "");
  }

  if (!fileUrl && !rawText) {
    return { ok: false, message: "Envie um texto, link ou arquivo para capturar." };
  }

  const { error } = await supabase.from("universal_captures").insert({
    raw_text: rawText,
    file_url: fileUrl,
    file_type: fileType,
    suggested_type: suggestedType,
    title: title,
    status: "inbox"
  });

  if (error) {
    console.error("DB Insert error", error);
    return { ok: false, message: "Erro ao salvar na inbox." };
  }

  revalidatePath("/interno/capturar");
  return { ok: true, message: "Capturado com sucesso!" };
}

export async function publishCapture(id: string) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Get capture
  const { data: capture } = await supabase.from("universal_captures").select("*").eq("id", id).single();
  if (!capture) return { ok: false, message: "Captura não encontrada." };
  
  // 2. Insert into Agora (editorial_items)
  const slug = `agora-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const { error: insErr } = await supabase.from("editorial_items").insert({
    title: capture.title || "Publicação Rápida",
    slug,
    body: capture.raw_text || "",
    excerpt: capture.raw_text ? capture.raw_text.substring(0, 50) : "Publicação direta",
    category: "post",
    cover_image_url: capture.file_url,
    editorial_status: "published",
    published: true,
    published_at: new Date().toISOString()
  });

  if (insErr) {
    console.error("Erro insert editorial_items", insErr);
    return { ok: false, message: "Erro ao publicar peça." };
  }
  
  // 3. Update capture
  await supabase.from("universal_captures").update({ status: "published" }).eq("id", id);
  revalidatePath("/interno/capturar");
  
  return { ok: true, message: "A peça já está viva em Agora." };
}

export async function archiveCapture(id: string) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Get capture
  const { data: capture } = await supabase.from("universal_captures").select("*").eq("id", id).single();
  if (!capture) return { ok: false, message: "Captura não encontrada." };
  
  // 2. Insert into Acervo (memory_items)
  const slug = `acervo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  let memoryType = "document";
  if (capture.suggested_type === "photo") memoryType = "image";
  if (capture.suggested_type === "post") memoryType = "post";

  const { error: insErr } = await supabase.from("memory_items").insert({
    title: capture.title || "Material Guardado",
    slug,
    body: capture.raw_text || "",
    excerpt: capture.raw_text ? capture.raw_text.substring(0, 50) : "Material bruto do Acervo.",
    memory_type: memoryType,
    memory_collection: "acervo-geral",
    period_label: "Sem data",
    cover_image_url: capture.file_url,
    archive_status: "archived"
  });

  if (insErr) {
    console.error("Erro insert memory_items", insErr);
    return { ok: false, message: "Erro ao guardar no Acervo." };
  }
  
  // 3. Update capture
  await supabase.from("universal_captures").update({ status: "archived" }).eq("id", id);
  revalidatePath("/interno/capturar");
  
  return { ok: true, message: "O material está seguro e guardado no Acervo." };
}

export async function sendToEnrichment(id: string) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Get capture
  const { data: capture } = await supabase.from("universal_captures").select("*").eq("id", id).single();
  if (!capture) return { ok: false, message: "Captura não encontrada." };
  
  // 2. Insert into Enrichment Queue (editorial_entries)
  let entryType = "document";
  if (capture.suggested_type === "photo" || capture.suggested_type === "image") entryType = "image";
  if (capture.suggested_type === "post" || capture.suggested_type === "link") entryType = "post";

  const { error: insErr } = await supabase.from("editorial_entries").insert({
    title: capture.title || "Captura para Enriquecer",
    entry_type: entryType,
    entry_status: "ready_for_enrichment",
    summary: capture.raw_text,
    file_url: capture.file_url,
    notes: "Vindo da Inbox de Captura Universal"
  });

  if (insErr) {
    console.error("Erro insert editorial_entries", insErr);
    return { ok: false, message: "Erro ao mandar para enriquecimento." };
  }
  
  // 3. Update capture
  await supabase.from("universal_captures").update({ status: "enriched" }).eq("id", id);
  revalidatePath("/interno/capturar");
  
  return { ok: true, message: "Item na fila de Enriquecimento (/interno/enriquecer)." };
}
