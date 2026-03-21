"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteMenu } from "@/components/site-menu";
import { ReadingAssistantTrigger } from "@/components/reading-assistant-trigger";
import { site } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner container">
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
          {site.primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav__link"
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__tools">
          <ReadingAssistantTrigger className="button-secondary site-header__a11y-link" />
          <SiteMenu variant="header" />
        </div>
      </div>
    </header>
  );
}
