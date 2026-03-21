"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { submitIntakeAction } from "@/app/envie/actions";

const initialState = {
  ok: false,
  message: "",
};

function pickFirst(value: string | null, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function IntakeForm() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(submitIntakeAction, initialState);

  const isQuick = searchParams.get("modo") === "rapido";
  const category = searchParams.get("categoria");
  const title = searchParams.get("titulo");
  const location = searchParams.get("local");
  const details = searchParams.get("detalhes");
  const contact = searchParams.get("contato");
  const anonymous = searchParams.get("anonimo") !== "false";

  return (
    <form className="intake-form" action={formAction}>
      {isQuick ? (
        <article className="support-box intake-form__quick">
          <p className="eyebrow">envio rápido</p>
          <h3>Vi algo agora? Preencha o mínimo.</h3>
          <p>Categoria, título e relato curto já abrem o caminho.</p>
          <div className="stack-actions">
            <a href="#intake-details" className="button-secondary">
              Ir direto ao relato
            </a>
          </div>
        </article>
      ) : null}

      <div className="grid-2">
        <label className="field">
          <span>Categoria</span>
          <select name="category" defaultValue={category || (isQuick ? "denuncia" : "")} required>
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
            defaultValue={pickFirst(title, isQuick ? "Vi algo agora" : "")}
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
            defaultValue={pickFirst(location, "")}
          />
        </label>

        <label className="field">
          <span>Contato opcional</span>
          <input
            name="contact"
            type="text"
            placeholder="Telefone, e-mail ou nenhum"
            maxLength={140}
            defaultValue={pickFirst(contact, "")}
          />
        </label>
      </div>

      <label className="field" id="intake-details">
        <span>Relato</span>
        <textarea
          name="details"
          rows={7}
          placeholder="Conte o fato com contexto útil: o que aconteceu, quando, onde e por que importa."
          minLength={20}
          defaultValue={pickFirst(details, isQuick ? "" : "")}
          required
        />
      </label>

      <label className="check">
        <input name="anonymous" type="checkbox" defaultChecked={anonymous} />
        <span>Quero enviar de forma anônima</span>
      </label>

      <div className="stack-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Enviando..." : isQuick ? "Mandar pista" : "Registrar"}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || (isQuick ? "Pista rápida com cuidado editorial." : "Seu material entra numa fila editorial inicial.")}
      </p>
    </form>
  );
}
