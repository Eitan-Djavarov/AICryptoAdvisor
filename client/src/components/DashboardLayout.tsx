import type { ReactNode } from 'react';
import TickerMarquee from './TickerMarquee';
import { FALLBACK_MARQUEE_TICKERS } from '../constants/marquee';
import type { CoinPriceData } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  marqueeTickers?: CoinPriceData[];
}

export default function DashboardLayout({
  children,
  marqueeTickers = FALLBACK_MARQUEE_TICKERS,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen pb-10">
      {children}
      <TickerMarquee tickers={marqueeTickers} />
    </div>
  );
}
