import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugifyEditorialValue } from "@/lib/editorial/utils";

export function normalizeMemoryCollectionSlug(value: string) {
  return slugifyEditorialValue(value).replace(/^memoria-/, "");
}

export async function upsertMemoryCollection(input: {
  slug: string;
  title: string;
  description?: string | null;
  displayOrder?: number | null;
  featured?: boolean | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("memory_collections").upsert(
    {
      slug: input.slug,
      title: input.title,
      description: input.description ?? "",
      display_order: input.displayOrder ?? 0,
      featured: input.featured ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );

  if (error) {
    throw error;
  }
}
