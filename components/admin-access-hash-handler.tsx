"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminAccessHashHandler() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? new URLSearchParams(window.location.hash.slice(1))
      : null;

    const accessToken = hash?.get("access_token") ?? "";
    const refreshToken = hash?.get("refresh_token") ?? "";

    if (!accessToken || !refreshToken) {
      return;
    }

    let cancelled = false;

    async function finishSignIn() {
      setMessage("Abrindo painel interno...");

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Failed to persist internal auth session", error);
        setMessage("Nao foi possivel concluir o acesso. Tente novamente.");
        return;
      }

      window.history.replaceState({}, document.title, "/interno/entrar");
      window.location.replace("/interno/entrada");
    }

    void finishSignIn();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!message) {
    return null;
  }

  return <p className="form-status form-status--ok">{message}</p>;
}
