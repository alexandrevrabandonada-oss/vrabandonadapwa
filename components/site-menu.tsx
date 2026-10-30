"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    dialog?.querySelector<HTMLButtonElement>(".site-menu__close")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => element.getClientRects().length > 0);
      if (!focusables.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
      else trigger?.focus();
    };
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
        ref={triggerRef}
        className={triggerClassName}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={variant === "mobile" ? "Menu — abrir menu principal" : "Explorar — abrir menu principal"}
        onClick={() => setOpen(true)}
      >
        {variant === "mobile" ? <span className="vr2-menu-icon" aria-hidden="true">☰</span> : null}
        <span>{variant === "mobile" ? "Menu" : "Explorar"}</span>
      </button>

      {open ? (
        <div className="site-menu__overlay" role="presentation" onClick={() => setOpen(false)}>
          <aside
            id={panelId}
            ref={dialogRef}
            tabIndex={-1}
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
                            className={
                              group.title === "Uso diário" && item.href === "/agora"
                                ? "site-menu__link site-menu__link--featured"
                                : "site-menu__link"
                            }
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


