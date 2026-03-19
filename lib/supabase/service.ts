import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertConfig() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase service client is not configured.");
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

export function createSupabaseServiceClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = assertConfig();
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
