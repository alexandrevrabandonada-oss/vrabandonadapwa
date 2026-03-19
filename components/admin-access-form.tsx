"use client";

import { useActionState } from "react";

import { requestAdminAccessAction } from "@/app/interno/actions";

const initialState = { ok: false, message: "" };

export function AdminAccessForm() {
  const [state, formAction, pending] = useActionState(
    requestAdminAccessAction,
    initialState,
  );

  return (
    <form className="intake-form" action={formAction}>
      <label className="field">
        <span>E-mail autorizado</span>
        <input
          name="email"
          type="email"
          placeholder="voce@dominio.com"
          autoComplete="email"
          required
        />
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Enviando link..." : "Enviar link"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`}>
        {state.message || "O acesso é individual e serve apenas para triagem editorial."}
      </p>
    </form>
  );
}
