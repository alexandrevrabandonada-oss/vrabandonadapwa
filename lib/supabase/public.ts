import { createClient } from "@supabase/supabase-js";

function assertConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public client is not configured.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabasePublicClient() {
  const { supabaseUrl, supabaseAnonKey } = assertConfig();
  return createClient(supabaseUrl, supabaseAnonKey);
}
