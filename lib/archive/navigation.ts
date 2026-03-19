import type { ArchiveAsset } from "@/lib/archive/types";

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
