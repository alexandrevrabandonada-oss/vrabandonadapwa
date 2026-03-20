import Link from "next/link";

import { ShareTools } from "@/components/share-tools";

type Props = {
  title: string;
  summary: string;
  caption: string;
  shareHref: string;
  contentHref: string;
  titleLabel?: string;
};

export function SharePanel({ title, summary, caption, shareHref, contentHref, titleLabel = "compartilhar esta leitura" }: Props) {
  return (
    <article className="support-box share-panel">
      <p className="eyebrow">{titleLabel}</p>
      <p className="share-panel__summary">{summary}</p>
      <div className="stack-actions">
        <Link href={shareHref} className="button">
          Abrir pacote
        </Link>
        <Link href={contentHref} className="button-secondary">
          Abrir conteúdo
        </Link>
      </div>
      <ShareTools title={title} summary={summary} caption={caption} url={shareHref} />
    </article>
  );
}
