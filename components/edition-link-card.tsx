import Link from "next/link";

import { getEditionLinkRoleLabel, getEditionLinkTypeLabel } from "@/lib/editions/navigation";
import type { EditorialEditionResolvedLink } from "@/lib/editions/types";
import { saveEditionLinkAction } from "@/app/interno/edicoes/actions";

async function deleteEditionLinkAction(formData: FormData) {
  "use server";
  await saveEditionLinkAction({ ok: true, message: "" }, formData);
}

type Props = {
  link: EditorialEditionResolvedLink;
  compact?: boolean;
  removable?: boolean;
  editionId?: string;
  editionSlug?: string;
};

export function EditionLinkCard({ link, compact = false, removable = false, editionId, editionSlug }: Props) {
  return (
    <article className={`card place-hub-link-card ${compact ? "place-hub-link-card--compact" : ""}`.trim()}>
      <div className="meta-row">
        <span>{getEditionLinkRoleLabel(link.link_role)}</span>
        <span>{getEditionLinkTypeLabel(link.link_type)}</span>
      </div>
      <h3>{link.title}</h3>
      <p>{link.excerpt || link.note || "Sem resumo."}</p>
      <div className="stack-actions">
        <Link href={link.href} className="button-secondary">
          Abrir
        </Link>
        {removable && editionId ? (
          <form action={deleteEditionLinkAction}>
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={link.id} />
            <input type="hidden" name="edition_id" value={editionId} />
            <input type="hidden" name="edition_slug" value={editionSlug ?? ""} />
            <button className="button-secondary" type="submit">
              Remover
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
