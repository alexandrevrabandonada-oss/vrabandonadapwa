import Link from "next/link";

import { editorialEntryTypeLabels, type EditorialEntryType } from "@/lib/entrada/types";
import type { EntryTypeConfig } from "@/lib/entrada/navigation";

function pickTagList(values: string[]) {
  return values.slice(0, 3);
}

type Props = {
  entryType: EditorialEntryType;
  config: EntryTypeConfig;
  href: string;
  count?: number;
  active?: boolean;
};

export function EntryCentralTypeCard({ entryType, config, href, count = 0, active = false }: Props) {
  return (
    <article className={`card entry-central-type-card ${active ? "entry-central-type-card--active" : ""}`.trim()}>
      <p className="eyebrow">entrada rápida</p>
      <h3>{editorialEntryTypeLabels[entryType]}</h3>
      <p>{config.description}</p>
      <div className="tag-row">
        {pickTagList(config.examples).map((example) => (
          <span key={example} className="tag-row__item">
            {example}
          </span>
        ))}
      </div>
      <p className="entry-central-type-card__count">{count} item{count === 1 ? "" : "s"} nesta porta.</p>
      <div className="stack-actions">
        <Link href={href} className="button">
          {config.actionPrimary}
        </Link>
      </div>
    </article>
  );
}
