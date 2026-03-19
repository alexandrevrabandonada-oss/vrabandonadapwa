import { createClient } from "@supabase/supabase-js";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase browser client is not configured.");
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
}

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
}
