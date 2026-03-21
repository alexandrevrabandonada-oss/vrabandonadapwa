"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { getReadingTrailItems, subscribeToReadingTrailChanges } from "@/lib/pwa/reading-trail";

type ReadingTrailQuickLinkProps = {
  className?: string;
};

export function ReadingTrailQuickLink({ className = "button-secondary site-header__continue-link" }: ReadingTrailQuickLinkProps) {
  const pathname = usePathname();
  const [href, setHref] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const items = getReadingTrailItems();
      const current = items.find((item) => item.href !== pathname) ?? null;

      setHref(current?.href ?? null);
      setLabel(current?.title ?? null);
    };

    sync();
    return subscribeToReadingTrailChanges(sync);
  }, [pathname]);

  if (!href || !label) {
    return null;
  }

  return (
    <Link href={href} className={className} aria-label={`Continuar leitura em ${label}`}>
      Continuar
    </Link>
  );
}
