export type ReadingTrailKind =
  | "home"
  | "radar"
  | "search"
  | "route"
  | "edition"
  | "campaign"
  | "dossier"
  | "impact"
  | "territory"
  | "actor"
  | "pattern"
  | "memory"
  | "archive"
  | "timeline"
  | "marco"
  | "participation"
  | "method"
  | "page"
  | string;

export type ReadingTrailItem = {
  kind: ReadingTrailKind;
  key: string;
  title: string;
  summary: string;
  href: string;
  label: string;
  visitedAt: string;
};

const STORAGE_KEY = "vr-abandonada:reading-trail";
const TRAIL_CHANGE_EVENT = "vr-abandonada:reading-trail-changed";
const MAX_ITEMS = 8;

const TRAIL_LABELS: Record<string, string> = {
  home: "Início",
  radar: "Radar",
  search: "Busca",
  route: "Rota",
  edition: "Edição",
  campaign: "Campanha",
  dossier: "Dossiê",
  impact: "Impacto",
  territory: "Território",
  actor: "Ator",
  pattern: "Padrão",
  memory: "Memória",
  archive: "Acervo",
  timeline: "Linha do tempo",
  marco: "Marco",
  participation: "Participação",
  method: "Método",
  page: "Página",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage(): ReadingTrailItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ReadingTrailItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.kind && item.key && item.href) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: ReadingTrailItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(TRAIL_CHANGE_EVENT));
}

function normalizeText(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function getReadingTrailItems() {
  return readStorage();
}

export function getReadingTrailKindLabel(kind: string) {
  return TRAIL_LABELS[kind] ?? kind;
}

export function isPublicTrailPath(pathname: string) {
  if (!pathname) return false;
  if (pathname.startsWith("/interno")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/sw.js" || pathname === "/manifest.webmanifest") return false;
  return true;
}

export function deriveTrailKind(pathname: string): ReadingTrailKind {
  if (pathname === "/") return "home";
  if (pathname === "/agora") return "radar";
  if (pathname === "/buscar") return "search";
  if (pathname === "/acompanhar") return "route";
  if (pathname === "/salvos") return "route";
  if (pathname.startsWith("/edicoes")) return "edition";
  if (pathname.startsWith("/campanhas")) return "campaign";
  if (pathname.startsWith("/dossies")) return "dossier";
  if (pathname.startsWith("/impacto")) return "impact";
  if (pathname.startsWith("/territorios")) return "territory";
  if (pathname.startsWith("/atores")) return "actor";
  if (pathname.startsWith("/padroes")) return "pattern";
  if (pathname.startsWith("/memoria")) return "memory";
  if (pathname.startsWith("/acervo")) return "archive";
  if (pathname.startsWith("/linha-do-tempo")) return "timeline";
  if (pathname.startsWith("/participe")) return "participation";
  if (pathname.startsWith("/metodo")) return "method";
  if (pathname.startsWith("/comecar")) return "route";
  return "page";
}

export function deriveTrailLabel(pathname: string) {
  return getReadingTrailKindLabel(deriveTrailKind(pathname));
}

export function buildTrailItem(args: {
  pathname: string;
  title?: string | null;
  description?: string | null;
}) {
  const kind = deriveTrailKind(args.pathname);

  return {
    kind,
    key: args.pathname,
    title: normalizeText(args.title, deriveTrailLabel(args.pathname)),
    summary: normalizeText(args.description, "Retorno editorial do VR Abandonada."),
    href: args.pathname,
    label: deriveTrailLabel(args.pathname),
  } satisfies Omit<ReadingTrailItem, "visitedAt">;
}

export function recordReadingTrail(item: Omit<ReadingTrailItem, "visitedAt">) {
  const next = [
    {
      ...item,
      visitedAt: new Date().toISOString(),
    },
    ...readStorage().filter((entry) => !(entry.kind === item.kind && entry.key === item.key)),
  ].slice(0, MAX_ITEMS);

  writeStorage(next);
  return next;
}

export function clearReadingTrail() {
  writeStorage([]);
}

export function subscribeToReadingTrailChanges(onChange: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener(TRAIL_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(TRAIL_CHANGE_EVENT, handler);
  };
}
