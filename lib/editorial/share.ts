export function getHomeOpenGraphImagePath() {
  return "/opengraph-image";
}

export function getEditorialOpenGraphImagePath(slug: string) {
  return `/pautas/${slug}/opengraph-image`;
}

export function getSeriesOpenGraphImagePath(slug: string) {
  return `/series/${slug}/opengraph-image`;
}
