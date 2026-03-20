export type FollowKind =
  | "hub"
  | "territory"
  | "actor"
  | "dossier"
  | "campaign"
  | "edition"
  | "pattern"
  | "impact"
  | "page"
  | string;

export type FollowItem = {
  kind: FollowKind;
  key: string;
  title: string;
  summary: string;
  href: string;
  label: string;
  followedAt: string;
};

const STORAGE_KEY = "vr-abandonada:follows";
const FOLLOW_CHANGE_EVENT = "vr-abandonada:follows-changed";

export const followKindLabels: Record<string, string> = {
  hub: "Eixo",
  territory: "Território",
  actor: "Ator",
  dossier: "Dossiê",
  campaign: "Campanha",
  edition: "Edição",
  pattern: "Padrão",
  impact: "Impacto",
  page: "Página",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage(): FollowItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as FollowItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.kind && item.key && item.href) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: FollowItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(FOLLOW_CHANGE_EVENT));
}

export function getFollowItems() {
  return readStorage();
}

export function getFollowKindLabel(kind: string) {
  return followKindLabels[kind] ?? kind;
}

export function isFollowing(kind: string, key: string) {
  return readStorage().some((item) => item.kind === kind && item.key === key);
}

export function follow(item: Omit<FollowItem, "followedAt">) {
  const next = [
    {
      ...item,
      followedAt: new Date().toISOString(),
    },
    ...readStorage().filter((entry) => !(entry.kind === item.kind && entry.key === item.key)),
  ];

  writeStorage(next);
  return next;
}

export function unfollow(kind: string, key: string) {
  const next = readStorage().filter((item) => !(item.kind === kind && item.key === key));
  writeStorage(next);
  return next;
}

export function toggleFollow(item: Omit<FollowItem, "followedAt">) {
  if (isFollowing(item.kind, item.key)) {
    return unfollow(item.kind, item.key);
  }

  return follow(item);
}

export function clearFollows() {
  writeStorage([]);
}

export function subscribeToFollowChanges(onChange: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener(FOLLOW_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(FOLLOW_CHANGE_EVENT, handler);
  };
}
