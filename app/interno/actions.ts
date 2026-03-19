"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { isAdminEmailAllowed } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      message: "Supabase não configurado para envio do link interno.",
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/interno/intake`,
    },
  });

  if (error) {
    console.error("Failed to send admin magic link", error);
    return {
      ok: false,
      message: "Não foi possível enviar o link agora. Tente novamente.",
    };
  }

  return {
    ok: true,
    message: "Link de acesso enviado. Verifique sua caixa de entrada.",
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/interno/entrar");
}

