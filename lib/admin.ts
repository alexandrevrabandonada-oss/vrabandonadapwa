import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function isAdminEmailAllowed(email: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Admin allowlist check is not configured.");
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.rpc("is_admin_email", {
    p_email: email,
  });

  if (error) {
    console.error("Failed to verify admin email.", error);
    return false;
  }

  return Boolean(data);
}
