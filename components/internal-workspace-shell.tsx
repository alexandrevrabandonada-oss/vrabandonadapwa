"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";

type InternalNavItem = {
  href: string;
  label: string;
};

type InternalNavGroup = {
  title: string;
  items: InternalNavItem[];
};

const operatorItems: InternalNavItem[] = [
  { href: "/interno/entrada", label: "Entrada" },
  { href: "/interno/enriquecer", label: "Enriquecer" },
  { href: "/interno/intake", label: "Intake" },
  { href: "/interno/editorial", label: "Editorial" },
];

const groups: InternalNavGroup[] = [
  {
    title: "Arquivo",
    items: [
      { href: "/interno/acervo", label: "Acervo" },
      { href: "/interno/memoria", label: "Memória" },
      { href: "/interno/edicoes", label: "Edições" },
    ],
  },
  {
    title: "Frentes",
    items: [
      { href: "/interno/dossies", label: "Dossiês" },
      { href: "/interno/campanhas", label: "Campanhas" },
      { href: "/interno/impacto", label: "Impacto" },
    ],
  },
  {
    title: "Contexto",
    items: [
      { href: "/interno/territorios", label: "Territórios" },
      { href: "/interno/atores", label: "Atores" },
      { href: "/interno/eixos", label: "Eixos" },
      { href: "/interno/cronologia/marcos", label: "Marcos" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isLoginRoute(pathname: string) {
  return pathname === "/interno/entrar";
}

export function InternalWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isLoginRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="internal-workspace internal-workspace--operator">
      <section className="internal-workspace__bar">
        <Container className="internal-workspace__bar-inner">
          <div className="internal-workspace__copy">
            <p className="eyebrow">modo operador</p>
            <h1>Cockpit interno.</h1>
            <p>Entrada curta, fila viva e transformação rápida. O resto fica fora da primeira dobra.</p>
          </div>

          <div className="internal-workspace__top-actions">
            <span className="internal-workspace__status">Operação ativa</span>
            <form action={signOutAction}>
              <button type="submit" className="button-secondary internal-workspace__signout">
                Sair
              </button>
            </form>
          </div>
        </Container>
      </section>

      <section className="internal-workspace__nav-shell">
        <Container className="internal-workspace__nav-inner">
          <nav className="internal-workspace__primary" aria-label="Navegação interna principal">
            {operatorItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`internal-workspace__primary-link ${isActive(pathname, item.href) ? "internal-workspace__primary-link--active" : ""}`}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="internal-workspace__groups" aria-label="Núcleos internos">
            {groups.map((group) => (
              <section key={group.title} className="internal-workspace__group">
                <p className="eyebrow">{group.title}</p>
                <nav aria-label={group.title}>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`internal-workspace__link ${isActive(pathname, item.href) ? "internal-workspace__link--active" : ""}`}
                          aria-current={isActive(pathname, item.href) ? "page" : undefined}
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
        </Container>
      </section>

      {children}
    </div>
  );
}
