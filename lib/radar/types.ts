export const radarSections = ["what_changed", "in_course", "hot_fronts", "archive_present", "calls"] as const;
export type RadarSection = (typeof radarSections)[number];

export const radarSourceTypes = ["dossier-update", "dossier", "theme-hub", "editorial", "memory", "archive", "campaign"] as const;
export type RadarSourceType = (typeof radarSourceTypes)[number];

export type RadarItem = {
  id: string;
  section: RadarSection;
  sourceType: RadarSourceType;
  title: string;
  excerpt: string | null;
  href: string;
  primaryLabel: string;
  secondaryLabel: string | null;
  dateLabel: string | null;
  coverImageUrl: string | null;
  coverVariant: string | null;
  featured: boolean;
  sortDate: string;
  sortOrder: number;
  actionLabel: string;
};

export type RadarSectionMap = Record<RadarSection, RadarItem[]>;

export type RadarPageData = {
  spotlight: RadarItem | null;
  sections: RadarSectionMap;
  counts: {
    updates: number;
    dossiers: number;
    hubs: number;
    archive: number;
    calls: number;
  };
};

