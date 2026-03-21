"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/lib/site";
import { SiteMenu } from "@/components/site-menu";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação móvel">
      {site.mobileNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="mobile-bottom-nav__link"
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
        >
          <span>{item.label}</span>
        </Link>
      ))}
      <SiteMenu variant="mobile" />
    </nav>
  );
}
