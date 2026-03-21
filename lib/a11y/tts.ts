export type ReadingAssistantSection = {
  element: HTMLElement;
  title: string;
  text: string;
};

const SECTION_SELECTORS = [
  "section",
  "article",
  ".hero",
  ".section",
  ".card",
  ".entry",
  ".quote",
  ".support-box",
  ".search-toolbar",
  ".search-empty",
  ".search-highlight-section",
  ".search-bridge-section",
  ".search-discovery-section",
  ".search-results-section",
  ".reading-trail-section",
  ".follow-watchlist-section",
  ".follow-watchlist-empty",
  ".follow-watchlist-summary",
  ".edition-primary-piece",
  ".campaign-primary-piece",
  ".impact-primary-piece",
  ".dossier-primary-piece",
  ".place-hub-primary-piece",
  ".actor-hub-primary-piece",
  ".pattern-read-primary-piece",
  ".timeline-highlight-primary-piece",
  ".entry-route-card",
  ".participation-path-card",
].join(", ");

const EXCLUDED_SELECTORS = [
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "nav",
  "header",
  "footer",
  "svg",
  "img",
  "script",
  "style",
  "noscript",
  "[aria-hidden='true']",
  "[data-skip-tts='true']",
].join(", ");

function normalizeText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function limitText(value: string, max = 1200) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}

function removeExcludedNodes(root: HTMLElement) {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(EXCLUDED_SELECTORS).forEach((node) => node.remove());
  return clone;
}

function extractTitle(element: HTMLElement) {
  const heading = element.querySelector("h1, h2, h3, h4, [data-reading-title]") as HTMLElement | null;
  if (heading?.textContent) {
    return normalizeText(heading.textContent);
  }

  const strong = element.querySelector("strong") as HTMLElement | null;
  if (strong?.textContent) {
    return normalizeText(strong.textContent);
  }

  const text = normalizeText(element.textContent || "");
  return text.slice(0, 80) || "Seção da página";
}

function extractText(element: HTMLElement) {
  const clone = removeExcludedNodes(element);
  const text = normalizeText(clone.textContent || "");
  return limitText(text);
}

export function collectReadingAssistantSections(root: HTMLElement): ReadingAssistantSection[] {
  const candidates = Array.from(root.querySelectorAll(SECTION_SELECTORS));
  const unique = new Set<HTMLElement>();

  candidates.forEach((candidate) => {
    if (!(candidate instanceof HTMLElement)) return;
    const text = extractText(candidate);
    const title = extractTitle(candidate);
    if (!text || text.length < 45) return;
    if (!title) return;
    unique.add(candidate);
  });

  return Array.from(unique).map((element) => ({
    element,
    title: extractTitle(element),
    text: extractText(element),
  }));
}

export function isA11yPublicPath(pathname: string | null) {
  if (!pathname) return false;
  return !pathname.startsWith("/interno") && !pathname.startsWith("/auth") && !pathname.startsWith("/api");
}

export function getReadingAssistantStorageKey(pathname: string) {
  return `vr-a11y-reading:${pathname}`;
}

export function getLowVisionStorageKey() {
  return "vr-a11y-low-vision";
}

export function getReadingAssistantOpenKey() {
  return "vr-a11y-assistant-open";
}

export function getReadingAssistantRateKey() {
  return "vr-a11y-reading-rate";
}
