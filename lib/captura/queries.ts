import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UniversalCapture = {
  id: string;
  title: string | null;
  raw_text: string | null;
  file_url: string | null;
  file_type: string | null;
  suggested_type: string | null;
  status: "inbox" | "archived" | "published" | "enriched" | "discarded";
  created_at: string;
  updated_at: string;
};

export async function getUniversalInboxItems() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("universal_captures")
    .select("*")
    .eq("status", "inbox")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch inbox items", error);
    return [];
  }

  return data as UniversalCapture[];
}
