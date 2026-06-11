import type { DashboardLayoutWidth, DashboardSectionId } from '../types';

const PREMIUM_PANEL_BASE =
  'rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.02)]';

const COMPACT_MARKET_SECTIONS: DashboardSectionId[] = ['prices', 'news'];

export function getSectionPanelClass(
  width: DashboardLayoutWidth,
  sectionId: DashboardSectionId
): string {
  const isCompact = COMPACT_MARKET_SECTIONS.includes(sectionId);
  const padding = isCompact ? 'p-4 lg:p-5' : 'p-6 lg:p-8';
  const panelClass = `${PREMIUM_PANEL_BASE} ${padding}`;

  return width === 'full' ? `${panelClass} lg:col-span-2` : panelClass;
}
