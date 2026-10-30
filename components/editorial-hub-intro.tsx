import Link from "next/link";

type HubDestination = {
  href: string;
  label: string;
};

type EditorialHubIntroProps = {
  kicker: string;
  title: string;
  description: string;
  navigationLabel: string;
  links: HubDestination[];
};

/**
 * Cabeçalho editorial único para índices de leitura.
 * Navegação com links reais e âncoras, sem estados interativos simulados.
 */
export function EditorialHubIntro({
  kicker,
  title,
  description,
  navigationLabel,
  links,
}: EditorialHubIntroProps) {
  return (
    <header className="vr6-hub__head">
      <p className="vr6-eyebrow">{kicker}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {links.length > 0 ? (
        <nav className="vr6-hub__jump" aria-label={navigationLabel}>
          {links.map((item) =>
            item.href.startsWith("#") ? (
              <a href={item.href} key={item.href}>{item.label}</a>
            ) : (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ),
          )}
        </nav>
      ) : null}
    </header>
  );
}
