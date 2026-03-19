export function slugifyEditorialValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "pauta";
}

export function buildEditorialSlug(title: string, suffix: string) {
  return `${slugifyEditorialValue(title)}-${suffix.toLowerCase()}`;
}
