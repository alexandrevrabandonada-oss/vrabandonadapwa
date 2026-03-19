import Link from "next/link";

import { Container } from "@/components/container";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link href="/" className="brand" aria-label={site.name}>
          <span className="brand__mark">VR</span>
          <span className="brand__text">
            <strong>{site.name}</strong>
            <small>{site.shortDescription}</small>
          </span>
        </Link>

        <nav className="nav" aria-label="Navegação principal">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav__link">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
