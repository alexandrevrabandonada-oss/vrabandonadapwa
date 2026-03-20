export function getSharePackIndexPath() {
  return "/compartilhar";
}

export function getSharePackPagePath(contentType: string, contentKey: string) {
  return `/compartilhar/${contentType}/${contentKey}`;
}

export function getSharePackOpenGraphImagePath(contentType: string, contentKey: string) {
  return `/compartilhar/${contentType}/${contentKey}/opengraph-image`;
}
