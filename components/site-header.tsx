"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { ReadingTrailQuickLink } from "@/components/reading-trail-quick-link";
import { site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link href="/" className="brand" aria-label={site.name}>
          <Image
            src="/brand/vr-abandonada-logo.svg"
            alt=""
            aria-hidden="true"
            className="brand__logo"
            width={960}
            height={260}
            priority
          />
        </Link>

        <nav className="nav" aria-label="Navegação principal">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav__link" aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__tools">
          <ReadingTrailQuickLink />
          <Link href="/buscar" className="button-secondary site-header__search-link">
            Buscar
          </Link>
          <PwaInstallButton />
        </div>
      </Container>
    </header>
  );
}
