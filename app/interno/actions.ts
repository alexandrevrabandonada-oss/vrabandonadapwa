"use server";

import { redirect } from "next/navigation";

import { isAdminEmailAllowed } from "@/lib/admin";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const siteUrl = getSiteUrl();

export type AdminAccessState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function requestAdminAccessAction(
  _: AdminAccessState,
  formData: FormData,
): Promise<AdminAccessState> {
  const email = normalize(formData.get("email"));

  if (!email || !email.includes("@")) {
    return {
      ok: false,
      message: "Informe um e-mail válido para receber o acesso interno.",
    };
  }

  const allowed = await isAdminEmailAllowed(email);
  if (!allowed) {
    return {
      ok: false,
      message: "Este e-mail ainda não está liberado para o painel interno.",
    };
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/interno/entrada`,
    },
  });

  if (error) {
    console.error("Failed to generate internal access link", error);
    return {
      ok: false,
      message: "Não foi possível gerar o link interno agora. Tente novamente.",
    };
  }

  const actionLink = data?.properties?.action_link;
  if (!actionLink) {
    return {
      ok: false,
      message: "O link interno não pôde ser criado agora.",
    };
  }

  redirect(actionLink);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/interno/entrar");
}

