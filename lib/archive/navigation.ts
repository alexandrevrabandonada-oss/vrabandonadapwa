import type { ArchiveAsset } from "@/lib/archive/types";

export const archiveAssetTypeLabels: Record<string, string> = {
  photo: "Fotografias",
  scan: "Scans",
  newspaper: "Recortes de jornal",
  document: "Documentos",
  pdf: "PDFs",
  audio: "Áudios",
  other: "Outros materiais",
};

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getArchiveAssetTypeLabel(assetType: string) {
  return archiveAssetTypeLabels[assetType] ?? titleCase(assetType);
}

export function getArchiveAssetPeriodLabel(asset: ArchiveAsset) {
  if (asset.source_date_label) {
    return asset.source_date_label;
  }

  if (asset.approximate_year) {
    return `c. ${asset.approximate_year}`;
  }

  return "data aberta";
}

export function getArchiveAssetContextLabel(asset: ArchiveAsset) {
  return asset.source_label || asset.rights_note || "Arquivo vivo";
}

export function isArchiveVisualAsset(asset: ArchiveAsset) {
  return asset.asset_type === "photo" || asset.asset_type === "scan" || asset.asset_type === "newspaper" || Boolean(asset.thumb_url);
}

export function getArchiveAssetDisplayUrl(asset: ArchiveAsset) {
  return asset.thumb_url || asset.file_url;
}

export function getArchiveAssetLinkLabel(asset: ArchiveAsset) {
  return asset.public_visibility ? "Ver fonte pública" : "Abrir no interno";
}

export function countLinkedArchiveAssets(assets: ArchiveAsset[], memoryItemId: string) {
  return assets.filter((asset) => asset.memory_item_id === memoryItemId).length;
}

export function getArchiveAssetNearbyItems(asset: ArchiveAsset, items: ArchiveAsset[]) {
  return items
    .filter((candidate) => candidate.id !== asset.id)
    .filter((candidate) => {
      if (asset.memory_item_id && candidate.memory_item_id === asset.memory_item_id) {
        return true;
      }

      if (asset.editorial_item_id && candidate.editorial_item_id === asset.editorial_item_id) {
        return true;
      }

      if (asset.collection_slug && candidate.collection_slug === asset.collection_slug) {
        return true;
      }

      if (asset.asset_type === candidate.asset_type) {
        return true;
      }

      if (asset.place_label && candidate.place_label && asset.place_label === candidate.place_label) {
        return true;
      }

      return false;
    })
    .sort((a, b) => {
      if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
        return Number(b.featured) - Number(a.featured);
      }

      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 4);
}

export function getArchiveFilterOptions(items: ArchiveAsset[]) {
  const types = Array.from(new Set(items.map((item) => item.asset_type))).sort();
  const years = Array.from(new Set(items.map((item) => item.approximate_year).filter((value): value is number => typeof value === "number"))).sort((a, b) => b - a);
  const places = Array.from(new Set(items.map((item) => item.place_label).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b));
  const memoryIds = Array.from(new Set(items.map((item) => item.memory_item_id).filter((value): value is string => Boolean(value))));

  return { types, years, places, memoryIds };
}
