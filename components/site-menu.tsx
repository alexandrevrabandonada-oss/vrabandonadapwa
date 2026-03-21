"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { PwaInstallButton } from "@/components/pwa-install-button";
import { ReadingAssistantTrigger } from "@/components/reading-assistant-trigger";
import { ReadingTrailQuickLink } from "@/components/reading-trail-quick-link";
import { site, type SiteGroup } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteMenu({ variant = "header" }: { variant?: "header" | "mobile" }) {
  const pathname = usePathname();
  const panelId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const triggerClassName = useMemo(() => {
    return variant === "mobile"
      ? "button-secondary site-menu__trigger site-menu__trigger--mobile"
      : "button-secondary site-menu__trigger";
  }, [variant]);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Abrir menu principal"
        onClick={() => setOpen(true)}
      >
        Menu
      </button>

      {open ? (
        <div className="site-menu__overlay" role="presentation" onClick={() => setOpen(false)}>
          <aside
            id={panelId}
            className="site-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="site-menu__header">
              <div>
                <p className="eyebrow">mapa do site</p>
                <h2 id={`${panelId}-title`}>Navegação agrupada</h2>
              </div>
              <button type="button" className="button-secondary site-menu__close" onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            <div className="site-menu__groups">
              {site.menuGroups.map((group: SiteGroup, index) => (
                <section key={group.title} className={`site-menu__group ${index === 0 ? "site-menu__group--featured" : ""}`}>
                  <h3>{group.title}</h3>
                  <nav aria-label={group.title}>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={isActive(pathname, item.href) ? "page" : undefined}
                            onClick={() => setOpen(false)}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </section>
              ))}
            </div>

            <div className="site-menu__utilities">
              <div className="site-menu__utility-card">
                <p className="eyebrow">retorno</p>
                <ReadingTrailQuickLink className="button-secondary site-menu__utility-action" />
              </div>
              <div className="site-menu__utility-card">
                <p className="eyebrow">acessibilidade</p>
                <ReadingAssistantTrigger className="button-secondary site-menu__utility-action" />
              </div>
              <div className="site-menu__utility-card">
                <p className="eyebrow">instalação</p>
                <PwaInstallButton />
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

