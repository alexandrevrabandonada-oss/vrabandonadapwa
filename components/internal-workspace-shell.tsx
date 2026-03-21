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

const featuredItems: InternalNavItem[] = [
  { href: "/interno/entrada", label: "Entrada" },
  { href: "/interno/enriquecer", label: "Enriquecimento" },
  { href: "/interno/intake", label: "Intake" },
];

const groups: InternalNavGroup[] = [
  {
    title: "Arquivo",
    items: [
      { href: "/interno/acervo", label: "Acervo" },
      { href: "/interno/memoria", label: "Memória" },
      { href: "/interno/dossies", label: "Dossiês" },
      { href: "/interno/edicoes", label: "Edições" },
    ],
  },
  {
    title: "Contexto",
    items: [
      { href: "/interno/campanhas", label: "Campanhas" },
      { href: "/interno/impacto", label: "Impacto" },
      { href: "/interno/eixos", label: "Eixos" },
      { href: "/interno/territorios", label: "Territórios" },
      { href: "/interno/atores", label: "Atores" },
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
    <div className="internal-workspace">
      <section className="internal-workspace__bar">
        <Container className="internal-workspace__bar-inner">
          <div className="internal-workspace__copy">
            <p className="eyebrow">fluxo interno</p>
            <h1>Entrada, fila e transformação num só lugar.</h1>
            <p>
              A porta única vira o primeiro passo; a fila de enriquecimento vira o segundo; o resto fica reduzido ao que realmente ajuda a operar.
            </p>
          </div>

          <div className="internal-workspace__top-actions">
            <Link href="/interno/entrada" className={`internal-workspace__quick-link ${isActive(pathname, "/interno/entrada") ? "internal-workspace__quick-link--active" : ""}`}>
              Entrada
            </Link>
            <Link href="/interno/enriquecer" className={`internal-workspace__quick-link ${isActive(pathname, "/interno/enriquecer") ? "internal-workspace__quick-link--active" : ""}`}>
              Enriquecimento
            </Link>
            <Link href="/interno/intake" className={`internal-workspace__quick-link ${isActive(pathname, "/interno/intake") ? "internal-workspace__quick-link--active" : ""}`}>
              Intake
            </Link>
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
          <nav className="internal-workspace__featured" aria-label="Fluxo principal interno">
            {featuredItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`internal-workspace__featured-link ${isActive(pathname, item.href) ? "internal-workspace__featured-link--active" : ""}`}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="internal-workspace__groups">
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
