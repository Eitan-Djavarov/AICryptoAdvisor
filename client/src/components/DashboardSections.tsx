import { memo } from 'react';
import { getSectionPanelClass } from '../utils/dashboardLayout';
import MarketDataSection from './MarketDataSection';
import IntelligenceSection from './IntelligenceSection';
import AIBriefingSection from './AIBriefingSection';
import MemeSection from './MemeSection';
import type {
  AIInsightResult,
  CoinPriceData,
  CryptoMemeResult,
  CryptoNewsItem,
  DashboardLayoutSection,
} from '../types';

export interface DashboardSectionsProps {
  layoutSections: DashboardLayoutSection[];
  prices: CoinPriceData[];
  news: CryptoNewsItem[];
  aiInsight: AIInsightResult;
  meme: CryptoMemeResult;
  calibratedLabel: string;
}

function DashboardSections({
  layoutSections,
  prices,
  news,
  aiInsight,
  meme,
  calibratedLabel,
}: DashboardSectionsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      {layoutSections
        .filter((section) => section.visible)
        .map((section) => (
          <section
            key={section.id}
            className={getSectionPanelClass(section.width, section.id)}
          >
            {section.id === 'prices' ? (
              <MarketDataSection prices={prices} />
            ) : null}
            {section.id === 'news' ? (
              <IntelligenceSection news={news} />
            ) : null}
            {section.id === 'aiInsight' ? (
              <AIBriefingSection
                aiInsight={aiInsight}
                calibratedLabel={calibratedLabel}
              />
            ) : null}
            {section.id === 'meme' ? <MemeSection meme={meme} /> : null}
          </section>
        ))}
    </div>
  );
}

export default memo(DashboardSections);
