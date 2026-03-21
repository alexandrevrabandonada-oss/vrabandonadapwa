import Link from "next/link";

import { Container } from "@/components/container";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="eyebrow">VR Abandonada</p>
          <p>
            Casa digital para memória, denúncia e organização popular sobre
            Volta Redonda.
          </p>
        </div>

        <nav className="site-footer__quicklinks" aria-label="Atalhos do rodapé">
          {site.footerQuickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="site-footer__quicklink">
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="site-footer__note">
          Projeto em base inicial. Estrutura preparada para Vercel, PWA e
          Supabase.
        </p>
      </Container>
    </footer>
  );
}
