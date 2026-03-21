import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WeeklyFocus = {
  id: string;
  focus_key: string;
  custom_text: string | null;
  entity_type: string | null;
  entity_id: string | null;
};

export type WeeklyBoardItem = {
  id: string;
  entity_type: string;
  entity_id: string;
  board_column: string;
  notes: string | null;
};

export async function getWeeklyFocusDict() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("weekly_focus").select("*");

  if (error || !data) {
    console.error("Failed to fetch weekly_focus", error);
    return {};
  }

  const dict: Record<string, WeeklyFocus> = {};
  for (const row of data) {
    dict[row.focus_key] = row as WeeklyFocus;
  }
  return dict;
}

export async function getWeeklyBoardItems() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("weekly_board_items").select("*");

  if (error || !data) {
    console.error("Failed to fetch weekly_board_items", error);
    return [];
  }

  return data as WeeklyBoardItem[];
}
