"use client";

import { useEffect, useMemo, useState } from "react";

import { getFollowKindLabel, isFollowing, subscribeToFollowChanges, toggleFollow } from "@/lib/pwa/follows";

type Props = {
  kind: string;
  keyValue: string;
  title: string;
  summary: string;
  href: string;
  compact?: boolean;
};

export function FollowButton({ kind, keyValue, title, summary, href, compact = false }: Props) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const update = () => setFollowing(isFollowing(kind, keyValue));
    update();

    return subscribeToFollowChanges(update);
  }, [kind, keyValue]);

  const label = useMemo(() => (following ? "Acompanhando" : "Acompanhar"), [following]);

  return (
    <button
      type="button"
      className={compact ? "button-secondary follow-button follow-button--compact" : "button-secondary follow-button"}
      aria-pressed={following}
      aria-label={`${following ? "Deixar de acompanhar" : "Acompanhar"} ${getFollowKindLabel(kind)}`}
      onClick={() => {
        toggleFollow({ kind, key: keyValue, title, summary, href, label: getFollowKindLabel(kind) });
        setFollowing((current) => !current);
      }}
    >
      {label}
    </button>
  );
}

