"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getInternalArchiveCollectionById } from "@/lib/archive/collections";

export type ArchiveCollectionActionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/interno/entrar");
  }

  return { supabase, user };
}

function revalidateCollection(slug: string) {
  revalidatePath("/acervo");
  revalidatePath(`/acervo/colecoes/${slug}`);
  revalidatePath("/interno/acervo/colecoes");
  revalidatePath("/interno/acervo");
}

export async function saveArchiveCollectionAction(
  _: ArchiveCollectionActionState,
  formData: FormData,
): Promise<ArchiveCollectionActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const coverImageUrl = normalize(formData.get("cover_image_url"));
  const publicVisibility = toBool(formData.get("public_visibility"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase, user } = await ensureAdmin();

  if (!title) {
    return { ok: false, message: "Título é obrigatório." };
  }

  if (!slugInput && !currentId) {
    return { ok: false, message: "Slug é obrigatório na criação." };
  }

  if (currentId) {
    const current = await getInternalArchiveCollectionById(currentId);
    if (!current) {
      return { ok: false, message: "Coleção não encontrada." };
    }

    const nextSlug = current.slug;
    const { error } = await supabase
      .from("archive_collections")
      .update({
        title,
        excerpt: excerpt || null,
        description: description || null,
        cover_image_url: coverImageUrl || null,
        public_visibility: publicVisibility,
        featured,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
        updated_by: user.email || null,
      })
      .eq("id", currentId);

    if (error) {
      return { ok: false, message: "Não foi possível salvar a coleção." };
    }

    revalidateCollection(nextSlug);
    revalidatePath(`/interno/acervo/colecoes/${currentId}`);

    return { ok: true, message: "Coleção atualizada." };
  }

  const slug = slugify(slugInput || title);
  if (!slug) {
    return { ok: false, message: "Slug inválido." };
  }

  const { error } = await supabase.from("archive_collections").insert({
    title,
    slug,
    excerpt: excerpt || null,
    description: description || null,
    cover_image_url: coverImageUrl || null,
    public_visibility: publicVisibility,
    featured,
    sort_order: sortOrder,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar a coleção." };
  }

  revalidateCollection(slug);

  return { ok: true, message: "Coleção criada." };
}
