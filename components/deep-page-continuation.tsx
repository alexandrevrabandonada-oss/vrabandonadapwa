import Link from "next/link";

type DeepPageContinuationAction = {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
  ariaLabel?: string;
};

type DeepPageContinuationProps = {
  eyebrow: string;
  title: string;
  lead: string;
  actions: DeepPageContinuationAction[];
  className?: string;
};

export function DeepPageContinuation({ eyebrow, title, lead, actions, className }: DeepPageContinuationProps) {
  return (
    <section className={`section deep-continuation ${className ?? ""}`.trim()}>
      <div className="grid-2">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <p className="section__lead">{lead}</p>
      </div>

      <div className="deep-continuation__actions">
        {actions.map((action) => (
          <Link
            key={`${action.href}-${action.label}`}
            href={action.href}
            className={action.tone === "primary" ? "button" : "button-secondary"}
            aria-label={action.ariaLabel || action.label}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
