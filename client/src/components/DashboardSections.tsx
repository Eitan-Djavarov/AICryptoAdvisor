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
  FeedbackType,
} from '../types';

export interface DashboardSectionsProps {
  layoutSections: DashboardLayoutSection[];
  prices: CoinPriceData[];
  news: CryptoNewsItem[];
  aiInsight: AIInsightResult;
  meme: CryptoMemeResult;
  calibratedLabel: string;
  interactions: Record<string, FeedbackType>;
}

function DashboardSections({
  layoutSections,
  prices,
  news,
  aiInsight,
  meme,
  calibratedLabel,
  interactions,
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
              <MarketDataSection prices={prices} interactions={interactions} />
            ) : null}
            {section.id === 'news' ? (
              <IntelligenceSection news={news} interactions={interactions} />
            ) : null}
            {section.id === 'aiInsight' ? (
              <AIBriefingSection
                aiInsight={aiInsight}
                calibratedLabel={calibratedLabel}
                interactions={interactions}
              />
            ) : null}
            {section.id === 'meme' ? (
              <MemeSection meme={meme} interactions={interactions} />
            ) : null}
          </section>
        ))}
    </div>
  );
}

export default memo(DashboardSections);
