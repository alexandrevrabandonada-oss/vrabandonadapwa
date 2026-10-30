import "server-only";

import { redirect } from "next/navigation";

import { isAdminEmailAllowed } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Toda página e Server Action de Casos/Bairros exige usuário verificado E
 * autorização editorial. Login sozinho não dá acesso a dados internos.
 * A validação de RLS do Supabase permanece obrigatória, independentemente
 * da proteção na aplicação.
 */
export async function requireEditorialAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email || !(await isAdminEmailAllowed(user.email))) {
    redirect("/interno/entrar");
  }
  return { supabase, user };
}
