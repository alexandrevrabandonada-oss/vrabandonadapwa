"use client";

import { useActionState } from "react";

import { saveEditorialEntryAction } from "@/app/interno/entrada/actions";
import { entryTypeConfig } from "@/lib/entrada/navigation";
import { editorialEntryTargetLabels, editorialEntryTypeLabels, type EditorialEntry, type EditorialEntryType } from "@/lib/entrada/types";

type EntryCentralFormState = {
  ok: boolean;
  message: string;
};

type Props = {
  entryType: EditorialEntryType;
  entry?: EditorialEntry | null;
};

const initialState: EntryCentralFormState = { ok: false, message: "" };

function pickFirst(value: string | null, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function getActionLabel(entryType: EditorialEntryType, saveMode: string, editing: boolean) {
  const config = entryTypeConfig[entryType];

  if (saveMode === "primary") {
    if (!editing) {
      return config.actionPrimary;
    }

    if (entryType === "post") {
      return "Salvar e publicar em Agora";
    }

    return "Salvar e guardar no Acervo";
  }

  if (saveMode === "secondary") {
    return editing ? "Salvar e deixar para depois" : config.actionSecondary;
  }

  return editing ? "Salvar e enriquecer depois" : config.actionTertiary;
}

export function EntryCentralForm({ entryType, entry }: Props) {
  const [state, formAction, pending] = useActionState(saveEditorialEntryAction, initialState);
  const config = entryTypeConfig[entryType];
  const isEditing = Boolean(entry);

  return (
    <form className="intake-form entry-central-form" action={formAction} encType="multipart/form-data">
      <input type="hidden" name="id" value={entry?.id ?? ""} />
      <input type="hidden" name="entry_type" value={entryType} />

      <article className="support-box intake-form__quick">
        <p className="eyebrow">etapa 1</p>
        <h3>{isEditing ? `Revisar ${editorialEntryTypeLabels[entryType]}` : editorialEntryTypeLabels[entryType]}</h3>
        <p>{config.quickLead}</p>
        <div className="stack-actions">
          <span className="pwa-install-status">{isEditing ? "Salve o mínimo e enriqueça depois." : "Guarde o mínimo e siga."}</span>
        </div>
      </article>

      <div className="grid-2">
        <label className="field">
          <span>Título curto</span>
          <input name="title" type="text" placeholder="Uma linha direta" minLength={4} defaultValue={pickFirst(entry?.title ?? null, "")} required />
        </label>

        <label className="field">
          <span>Resumo curto</span>
          <textarea name="summary" rows={3} placeholder="O mínimo para entender o que é" defaultValue={pickFirst(entry?.summary ?? null, "")} />
        </label>
      </div>

      {entryType === "post" ? (
        <div className="grid-2">
          <label className="field">
            <span>Imagem opcional</span>
            <input name="asset_file" type="file" accept={config.accept} />
          </label>

          <label className="field">
            <span>Território / lugar</span>
            <input name="territory_label" type="text" placeholder="CSN e entorno" defaultValue={pickFirst(entry?.territory_label ?? null, "")} />
          </label>
        </div>
      ) : null}

      {entryType === "document" ? (
        <>
          <div className="grid-2">
            <label className="field">
              <span>Arquivo</span>
              <input name="asset_file" type="file" accept={config.accept} required={!entry?.file_url} />
            </label>

            <label className="field">
              <span>Autor / fonte</span>
              <input name="source_label" type="text" placeholder="Instituição, autor ou origem" defaultValue={pickFirst(entry?.source_label ?? null, "")} />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Ano</span>
              <input name="year_label" type="text" placeholder="2024 ou aprox. 2024" defaultValue={pickFirst(entry?.year_label ?? null, "")} />
            </label>

            <label className="field">
              <span>Território / lugar</span>
              <input name="territory_label" type="text" placeholder="CSN e entorno" defaultValue={pickFirst(entry?.territory_label ?? null, "")} />
            </label>
          </div>


        </>
      ) : null}

      {entryType === "image" ? (
        <>
          <div className="grid-2">
            <label className="field">
              <span>Imagem</span>
              <input name="asset_file" type="file" accept={config.accept} required={!entry?.file_url} />
            </label>

            <label className="field">
              <span>Data / ano</span>
              <input name="year_label" type="text" placeholder="1998 ou aprox. 1998" defaultValue={pickFirst(entry?.year_label ?? null, "")} />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Lugar</span>
              <input name="place_label" type="text" placeholder="Vila Santa Cecília" defaultValue={pickFirst(entry?.place_label ?? null, "")} />
            </label>

            <label className="field">
              <span>Fonte / origem</span>
              <input name="source_label" type="text" placeholder="Arquivo pessoal, jornal, instituição" defaultValue={pickFirst(entry?.source_label ?? null, "")} />
            </label>
          </div>

          <label className="field">
            <span>Território / lugar</span>
            <input name="territory_label" type="text" placeholder="Cidade operária" defaultValue={pickFirst(entry?.territory_label ?? null, "")} />
          </label>
        </>
      ) : null}

      <div className="grid-2">
        <label className="field">
          <span>Ator / instituição</span>
          <input name="actor_label" type="text" placeholder="Empresa, órgão, hospital, escola" defaultValue={pickFirst(entry?.actor_label ?? null, "")} />
        </label>

        <label className="field">
          <span>Eixo / tema</span>
          <input name="axis_label" type="text" placeholder="Poluição e CSN" defaultValue={pickFirst(entry?.axis_label ?? null, "")} />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Observação curta</span>
          <textarea name="notes" rows={3} placeholder="O que ainda falta decidir ou ligar depois" defaultValue={pickFirst(entry?.notes ?? null, "")} />
        </label>

        <div className="support-box">
          <p className="eyebrow">etapa 2</p>
          <p>
            Depois de guardar, este item pode virar acervo, memória, dossiê, campanha, impacto ou edição sem travar a entrada.
          </p>
          <p className="form-status">
            {entry?.target_surface ? `Destino sugerido: ${editorialEntryTargetLabels[entry.target_surface]}` : "Destino sugerido: decidir depois."}
          </p>
        </div>
      </div>

      {entry?.file_url ? (
        <div className="support-box">
          <p className="eyebrow">arquivo atual</p>
          <p>{entry.file_name || "Arquivo carregado"}</p>
          <a href={entry.file_url} className="button-secondary" target="_blank" rel="noreferrer">
            Abrir arquivo
          </a>
        </div>
      ) : null}

      <div className="stack-actions">
        <button className="button" type="submit" name="save_mode" value="primary" disabled={pending}>
          {pending ? "Salvando..." : getActionLabel(entryType, "primary", isEditing)}
        </button>
        <button className="button-secondary" type="submit" name="save_mode" value="secondary" disabled={pending}>
          {getActionLabel(entryType, "secondary", isEditing)}
        </button>
        <button className="button-secondary" type="submit" name="save_mode" value="tertiary" disabled={pending}>
          {getActionLabel(entryType, "tertiary", isEditing)}
        </button>
      </div>

      <p className={`form-status ${state.ok ? "form-status--ok" : ""}`} aria-live="polite">
        {state.message || "Primeiro guarda, depois aprofunda."}
      </p>
    </form>
  );
}


