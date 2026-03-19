import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function isAdminEmailAllowed(email: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("admin_email_allowlist")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to verify admin email.");
  }

  return Boolean(data);
}
