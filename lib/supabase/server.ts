import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase/client";

export function createSupabaseServerClient() {
  const { url, serviceRoleKey } = getSupabaseConfig();

  if (!serviceRoleKey) {
    throw new Error("Supabase server client is not configured.");
  }

  return createClient(url, serviceRoleKey);
}
