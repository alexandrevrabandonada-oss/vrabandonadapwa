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

        <div className="site-footer__groups" aria-label="Mapa rápido do site">
          {site.footerGroups.map((group) => (
            <section key={group.title} className="site-footer__group">
              <p className="site-footer__group-title">{group.title}</p>
              <nav aria-label={group.title}>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </section>
          ))}
        </div>

        <p className="site-footer__note">
          Projeto em base inicial. Estrutura preparada para Vercel, PWA e
          Supabase.
        </p>
      </Container>
    </footer>
  );
}
