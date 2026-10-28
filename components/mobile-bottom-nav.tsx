"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/lib/site";
import { SiteMenu } from "@/components/site-menu";

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

function NavIcon({ href }: { href: string }) {
  if (href === "/") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>
    </svg>
  );
  if (href === "/noticias") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/>
    </svg>
  );
  if (href === "/agora") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 11h16M4 16h10M4 21h7"/>
      <path d="m17 16 2 2 3-4"/>
    </svg>
  );
  if (href === "/dossies") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-bottom-nav vr2-bottom-nav" aria-label="Navegação móvel">
      {site.mobileNav.map((item) => (
        <Link key={item.href} href={item.href} className="mobile-bottom-nav__link vr2-bottom-nav__link"
          aria-current={isActive(pathname, item.href) ? "page" : undefined}>
          <NavIcon href={item.href} />
          <span>{item.label}</span>
        </Link>
      ))}
      <SiteMenu variant="mobile" />
    </nav>
  );
}
