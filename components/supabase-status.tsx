"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SupabaseStatus() {
  const [label, setLabel] = useState("Supabase pronto para conectar");

  useEffect(() => {
    try {
      createSupabaseBrowserClient();
      setLabel("Supabase browser client ativo");
    } catch {
      setLabel("Supabase ainda não configurado");
    }
  }, []);

  return <span className="pill">{label}</span>;
}
