export type SavedReadKind =
  | "edition"
  | "campaign"
  | "dossier"
  | "impact"
  | "pauta"
  | "memory"
  | "territory"
  | "actor"
  | "pattern"
  | "radar"
  | "page"
  | "series"
  | "collection"
  | "archive"
  | "route"
  | "participation"
  | string;

export type SavedRead = {
  kind: SavedReadKind;
  key: string;
  title: string;
  summary: string;
  href: string;
  label: string;
  savedAt: string;
};

const STORAGE_KEY = "vr-abandonada:saved-reads";

export const savedReadKindLabels: Record<string, string> = {
  edition: "Edição",
  campaign: "Campanha",
  dossier: "Dossiê",
  impact: "Impacto",
  pauta: "Pauta",
  memory: "Memória",
  territory: "Território",
  actor: "Ator",
  pattern: "Padrão",
  radar: "Radar",
  page: "Página",
  series: "Série",
  collection: "Coleção",
  archive: "Acervo",
  route: "Rota",
  participation: "Participação",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage(): SavedRead[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SavedRead[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.kind && item.key && item.href) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: SavedRead[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getSavedReads() {
  return readStorage();
}

export function getSavedReadLabel(kind: string) {
  return savedReadKindLabels[kind] ?? kind;
}

export function isSavedRead(kind: string, key: string) {
  return readStorage().some((item) => item.kind === kind && item.key === key);
}

export function saveRead(item: Omit<SavedRead, "savedAt">) {
  const next = [
    {
      ...item,
      savedAt: new Date().toISOString(),
    },
    ...readStorage().filter((entry) => !(entry.kind === item.kind && entry.key === item.key)),
  ];

  writeStorage(next);
  return next;
}

export function removeRead(kind: string, key: string) {
  const next = readStorage().filter((item) => !(item.kind === kind && item.key === key));
  writeStorage(next);
  return next;
}

export function toggleRead(item: Omit<SavedRead, "savedAt">) {
  if (isSavedRead(item.kind, item.key)) {
    return removeRead(item.kind, item.key);
  }

  return saveRead(item);
}

export function clearSavedReads() {
  writeStorage([]);
}
