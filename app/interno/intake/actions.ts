"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type IntakeUpdateState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isIntakeStatus(value: string): value is import("@/lib/intake/types").IntakeStatus {
  return ["new", "reviewing", "archived", "published"].includes(value as import("@/lib/intake/types").IntakeStatus);
}

export async function updateIntakeAction(
  _: IntakeUpdateState,
  formData: FormData,
): Promise<IntakeUpdateState> {
  const id = normalize(formData.get("id"));
  const statusValue = normalize(formData.get("status"));
  const internalNotes = normalize(formData.get("internal_notes"));
  const safePublicSummary = normalize(formData.get("safe_public_summary"));
  const isSensitive = formData.get("is_sensitive") === "on";
  const contactAllowed = formData.get("contact_allowed") === "on";

  if (!id || !isIntakeStatus(statusValue)) {
    return {
      ok: false,
      message: "Escolha um status válido antes de salvar a triagem.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/interno/entrar");
  }

  const { error } = await supabase
    .from("intake_submissions")
    .update({
      status: statusValue,
      internal_notes: internalNotes || null,
      safe_public_summary: safePublicSummary || null,
      reviewed_by: user.email || null,
      reviewed_at: new Date().toISOString(),
      is_sensitive: isSensitive,
      contact_allowed: contactAllowed,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update intake submission", error);
    return {
      ok: false,
      message: "Não foi possível salvar a triagem agora.",
    };
  }

  revalidatePath("/interno/intake");
  revalidatePath(`/interno/intake/${id}`);

  return {
    ok: true,
    message: "Triagem atualizada com sucesso.",
  };
}
