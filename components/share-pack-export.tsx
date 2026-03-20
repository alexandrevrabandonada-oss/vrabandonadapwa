/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { getSharePackCardDownloadPath, getSharePackCardImagePath, getSharePackFormatLabel } from "@/lib/share-packs/navigation";
import type { SharePackResolved } from "@/lib/share-packs/types";

type Props = {
  pack: SharePackResolved;
  contentHref: string;
};

export function SharePackExportPanel({ pack, contentHref }: Props) {
  const squarePreview = getSharePackCardImagePath(pack.content_type, pack.content_key, "square");
  const verticalPreview = getSharePackCardImagePath(pack.content_type, pack.content_key, "vertical");
  const squareDownload = getSharePackCardDownloadPath(pack.content_type, pack.content_key, "square");
  const verticalDownload = getSharePackCardDownloadPath(pack.content_type, pack.content_key, "vertical");

  return (
    <section className="section">
      <div className="grid-2">
        <div>
          <p className="eyebrow">cards exportáveis</p>
          <h2>Pronto para Instagram, WhatsApp e compartilhamento direto.</h2>
        </div>
        <p className="section__lead">
          O pack pode sair do site em dois formatos. O {getSharePackFormatLabel(pack.preferred_format)} segue como prioridade editorial, mas o outro formato continua disponível.
        </p>
      </div>

      <div className="grid-2">
        <article className="support-box share-export-card">
          <p className="eyebrow">card quadrado</p>
          <a href={squarePreview} target="_blank" rel="noreferrer" className="share-export-card__preview-link">
            <img className="share-export-card__image" src={squarePreview} alt={`Prévia quadrada de ${pack.title}`} />
          </a>
          <div className="stack-actions">
            <a href={squareDownload} download className="button-secondary">
              Baixar card 1:1
            </a>
            <Link href={squarePreview} className="button-secondary" target="_blank">
              Abrir imagem
            </Link>
          </div>
        </article>

        <article className="support-box share-export-card">
          <p className="eyebrow">card vertical</p>
          <a href={verticalPreview} target="_blank" rel="noreferrer" className="share-export-card__preview-link">
            <img className="share-export-card__image share-export-card__image--vertical" src={verticalPreview} alt={`Prévia vertical de ${pack.title}`} />
          </a>
          <div className="stack-actions">
            <a href={verticalDownload} download className="button-secondary">
              Baixar card vertical
            </a>
            <Link href={verticalPreview} className="button-secondary" target="_blank">
              Abrir imagem
            </Link>
          </div>
        </article>
      </div>

      <div className="stack-actions">
        <Link href={contentHref} className="button-secondary">
          Voltar ao conteúdo
        </Link>
      </div>
    </section>
  );
}
