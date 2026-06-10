import type { ContentType } from '../constants/domain';

export const DASHBOARD_SECTION_IDS = [
  'prices',
  'news',
  'aiInsight',
  'meme',
] as const;

export type DashboardSectionId = (typeof DASHBOARD_SECTION_IDS)[number];
export type DashboardLayoutWidth = 'full' | 'half';

export interface DashboardLayoutSection {
  id: DashboardSectionId;
  visible: boolean;
  width: DashboardLayoutWidth;
}

const CONTENT_TYPE_TO_SECTION: Record<ContentType, DashboardSectionId> = {
  'Coin Prices': 'prices',
  'Market News': 'news',
  'AI Insights': 'aiInsight',
  Fun: 'meme',
};

function resolveSectionWidth(
  visibleIndex: number,
  visibleCount: number
): DashboardLayoutWidth {
  if (visibleCount === 1) {
    return 'full';
  }

  if (visibleCount % 2 === 1 && visibleIndex === visibleCount - 1) {
    return 'full';
  }

  return 'half';
}

export function computeDashboardLayoutSections(
  contentTypes: ContentType[]
): DashboardLayoutSection[] {
  const enabledSections = new Set(
    contentTypes.map((type) => CONTENT_TYPE_TO_SECTION[type])
  );

  const visibleIds = DASHBOARD_SECTION_IDS.filter((id) =>
    enabledSections.has(id)
  );
  const visibleCount = visibleIds.length;
  const visibleIndexById = new Map(
    visibleIds.map((id, index) => [id, index] as const)
  );

  return DASHBOARD_SECTION_IDS.map((id) => {
    const visible = enabledSections.has(id);

    if (!visible) {
      return { id, visible: false, width: 'half' as const };
    }

    const visibleIndex = visibleIndexById.get(id) ?? 0;

    return {
      id,
      visible: true,
      width: resolveSectionWidth(visibleIndex, visibleCount),
    };
  });
}
