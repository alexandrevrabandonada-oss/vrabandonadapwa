"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteMenu } from "@/components/site-menu";
import { ReadingAssistantTrigger } from "@/components/reading-assistant-trigger";
import { site } from "@/lib/site";

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header vr2-header">
      <div className="site-header__inner container vr2-header__inner">
        <Link href="/" className="vr2-brand">
          <span className="vr2-brand__mark">VR</span>
          <span className="vr2-brand__name">
            <strong>ABANDONADA</strong>
            <small>VOLTA REDONDA · RJ</small>
          </span>
        </Link>

        <nav className="nav vr2-desktop-nav" aria-label="Navegação principal">
          {site.primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className="nav__link vr2-desktop-nav__link"
              aria-current={isActive(pathname, item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__tools vr2-header__tools">
          <Link href="/buscar" className="vr4-header-search" aria-label="Buscar no VR Abandonada">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg>
          </Link>
          <ReadingAssistantTrigger className="vr2-header__listen" />
          <SiteMenu variant="header" />
        </div>
      </div>
    </header>
  );
}
