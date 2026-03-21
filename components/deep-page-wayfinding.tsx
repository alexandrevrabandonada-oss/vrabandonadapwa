import Link from "next/link";

type DeepPageWayfindingAction = {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
  ariaLabel?: string;
};

type DeepPageWayfindingProps = {
  parentHref: string;
  parentLabel: string;
  currentLabel: string;
  actions?: DeepPageWayfindingAction[];
};

export function DeepPageWayfinding({ parentHref, parentLabel, currentLabel, actions = [] }: DeepPageWayfindingProps) {
  return (
    <nav className="deep-wayfinding" aria-label={`Navegação de ${currentLabel}`}>
      <div className="deep-wayfinding__context">
        <p className="eyebrow">{currentLabel}</p>
        <Link href={parentHref} className="deep-wayfinding__back" aria-label={`Voltar para ${parentLabel}`}>
          Voltar para {parentLabel}
        </Link>
      </div>

      {actions.length ? (
        <div className="deep-wayfinding__actions">
          {actions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className={action.tone === "primary" ? "button" : "button-secondary"}
              aria-label={action.ariaLabel || `${action.label} em ${currentLabel}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
