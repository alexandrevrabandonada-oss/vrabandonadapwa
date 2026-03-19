import type { ReactNode } from "react";

type PageHeroProps = {
  kicker: string;
  title: string;
  lead: string;
  children?: ReactNode;
};

export function PageHero({ kicker, title, lead, children }: PageHeroProps) {
  return (
    <section className="hero">
      <p className="eyebrow">{kicker}</p>
      <h1 className="hero__title">{title}</h1>
      <p className="hero__lead">{lead}</p>
      {children ? <div className="hero__actions">{children}</div> : null}
    </section>
  );
}
