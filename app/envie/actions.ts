"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type SubmissionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitIntakeAction(
  _: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const category = normalize(formData.get("category"));
  const title = normalize(formData.get("title"));
  const location = normalize(formData.get("location"));
  const details = normalize(formData.get("details"));
  const contact = normalize(formData.get("contact"));
  const anonymous = normalize(formData.get("anonymous")) === "on";

  if (!category || !title || !details) {
    return {
      ok: false,
      message: "Preencha categoria, título e relato antes de enviar.",
    };
  }

  if (title.length < 6 || details.length < 20) {
    return {
      ok: false,
      message: "O relato precisa ter mais contexto para ser útil na apuração.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("intake_submissions").insert({
    category,
    title,
    location: location || null,
    details,
    contact: anonymous ? null : contact || null,
    anonymous,
    status: "new",
  });

  if (error) {
    console.error("Failed to insert intake submission", error);
    return {
      ok: false,
      message: "Não foi possível registrar o envio agora. Tente novamente.",
    };
  }

  revalidatePath("/envie");

  return {
    ok: true,
    message: "Envio registrado. O material entrou na fila editorial inicial.",
  };
}

