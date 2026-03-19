"use client";

import { useActionState } from "react";

import { submitIntakeAction } from "@/app/envie/actions";

const initialState = {
  ok: false,
  message: "",
};

export function IntakeForm() {
  const [state, formAction, pending] = useActionState(
    submitIntakeAction,
    initialState,
  );

  return (
    <form className="intake-form" action={formAction}>
      <div className="grid-2">
        <label className="field">
          <span>Categoria</span>
          <select name="category" defaultValue="" required>
            <option value="" disabled>
              Selecione
            </option>
            <option value="denuncia">Denúncia</option>
            <option value="memoria">Memória</option>
            <option value="pauta">Pauta</option>
            <option value="apoio">Apoio</option>
          </select>
        </label>

        <label className="field">
          <span>Título curto</span>
          <input
            name="title"
            type="text"
            placeholder="Resumo do caso ou material"
            minLength={6}
            maxLength={120}
            required
          />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Local</span>
          <input
            name="location"
            type="text"
            placeholder="Bairro, rua, equipamento ou referência"
            maxLength={140}
          />
        </label>

        <label className="field">
          <span>Contato opcional</span>
          <input
            name="contact"
            type="text"
            placeholder="Telefone, e-mail ou nenhum"
            maxLength={140}
          />
        </label>
      </div>

      <label className="field">
        <span>Relato</span>
        <textarea
          name="details"
          rows={7}
          placeholder="Conte o fato com o máximo de contexto útil: o que aconteceu, quando, onde e por que importa."
          minLength={20}
          required
        />
      </label>

      <label className="check">
        <input name="anonymous" type="checkbox" />
        <span>Quero enviar de forma anônima</span>
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Registrar envio"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`}>
        {state.message || "Seu material entra numa fila editorial inicial."}
      </p>
    </form>
  );
}
