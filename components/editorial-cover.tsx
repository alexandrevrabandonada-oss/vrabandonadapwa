/* eslint-disable @next/next/no-img-element */
import type { EditorialCoverVariant } from "@/lib/editorial/types";

type Props = {
  title: string;
  primaryTag?: string | null;
  seriesTitle?: string | null;
  coverImageUrl?: string | null;
  coverVariant?: EditorialCoverVariant | string | null;
  compact?: boolean;
};

function getVariantClass(coverVariant?: EditorialCoverVariant | string | null) {
  return `editorial-cover--${coverVariant || "concrete"}`;
}

export function EditorialCover({
  title,
  primaryTag,
  seriesTitle,
  coverImageUrl,
  coverVariant,
  compact = false,
}: Props) {
  return (
    <div className={`editorial-cover ${compact ? "editorial-cover--compact" : ""} ${getVariantClass(coverVariant)}`}>
      {coverImageUrl ? (
        <img className="editorial-cover__image" src={coverImageUrl} alt={title} />
      ) : (
        <>
          <div className="editorial-cover__glow" />
          <div className="editorial-cover__copy">
            <span>{primaryTag || "arquivo vivo"}</span>
            <strong>{seriesTitle || "VR Abandonada"}</strong>
          </div>
        </>
      )}
    </div>
  );
}
