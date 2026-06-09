import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import FearGreedDial from '../components/FearGreedDial';
import FeedbackButtons from '../components/FeedbackButtons';
import MemeCard from '../components/MemeCard';
import SettingsModal from '../components/SettingsModal';
import DashboardSkeleton, { LOADING_MESSAGES } from '../components/DashboardSkeleton';
import type {
  ApiErrorResponse,
  DashboardLayoutWidth,
  DashboardResponse,
  DashboardSectionId,
} from '../types';

const DASHBOARD_POLL_INTERVAL_MS = 30_000;

const PREMIUM_PANEL_BASE =
  'rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.02)]';

const COMPACT_MARKET_SECTIONS: DashboardSectionId[] = ['prices', 'news'];

function getSectionPanelClass(
  width: DashboardLayoutWidth,
  sectionId: DashboardSectionId
): string {
  const isCompact = COMPACT_MARKET_SECTIONS.includes(sectionId);
  const padding = isCompact ? 'p-4 lg:p-5' : 'p-6 lg:p-8';
  const panelClass = `${PREMIUM_PANEL_BASE} ${padding}`;

  return width === 'full' ? `${panelClass} lg:col-span-2` : panelClass;
}

function SparklesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-zinc-400"
      aria-hidden="true"
    >
      <path d="M12 2l1.2 4.2L17.5 7.5 13.2 8.7 12 13l-1.2-4.3L6.5 7.5l4.3-1.3L12 2zm7 9l.8 2.8L22.5 15l-2.7.8L19 18.5l-.8-2.7L15.5 15l2.7-.8L19 11zm-14 1l.6 2.1L8 15.2l-2.4.7L5 18l-.6-2.1L2 15.2l2.4-.7L5 12z" />
    </svg>
  );
}

function resolveUserInitial(name?: string): string {
  const trimmed = name?.trim();

  if (!trimmed) {
    return 'E';
  }

  return trimmed.charAt(0).toUpperCase();
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showFiatChange, setShowFiatChange] = useState(false);

  useEffect(() => {
    if (!loading) return;

    const interval = window.setInterval(() => {
      setLoadingMessageIndex(
        (current) => (current + 1) % LOADING_MESSAGES.length
      );
    }, 1400);

    return () => window.clearInterval(interval);
  }, [loading]);

  const fetchDashboard = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      if (!silent) {
        setLoading(true);
        setError('');
      }

      try {
        const { data } = await api.get<DashboardResponse>('/dashboard');
        setDashboard(data);

        if (silent) {
          setError('');
        }
      } catch (fetchError) {
        if (silent) {
          return;
        }

        const responseMessage = (
          fetchError as { response?: { data?: ApiErrorResponse } }
        ).response?.data?.message;

        setError(
          typeof responseMessage === 'string'
            ? responseMessage
            : 'The terminal glitched. Give it another shot.'
        );

        if (
          typeof fetchError === 'object' &&
          fetchError !== null &&
          'response' in fetchError &&
          (fetchError as { response?: { status?: number } }).response?.status ===
            400
        ) {
          navigate('/onboarding');
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void fetchDashboard({ silent: true });
    }, DASHBOARD_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loading, fetchDashboard]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton
          message={LOADING_MESSAGES[loadingMessageIndex] ?? LOADING_MESSAGES[0]}
        />
      </DashboardLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
          <div className="glass-panel max-w-md rounded-xl p-8 text-center">
            <p className="text-lg font-semibold tracking-tight text-zinc-100">
              Signal lost
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              {error || 'Dashboard unavailable right now.'}
            </p>
            <button
              type="button"
              onClick={() => void fetchDashboard()}
              className="btn-primary mt-8 rounded-lg px-6 py-2.5 text-sm font-medium"
            >
              Reconnect Terminal
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { prices, news, aiInsight, meme, marqueeTickers, profileMeta, fearAndGreed } =
    dashboard.dashboard;
  const layoutSections = dashboard.layoutSections;

  const renderDashboardSection = (section: DashboardSectionId) => {
    switch (section) {
      case 'prices':
        return (
          <>
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Market Data
              </p>
              <h2 className="mt-1.5 flex items-center text-base font-semibold tracking-tight sm:text-lg">
                <span
                  className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                Live Tickers
              </h2>
              <p className="mt-1.5 text-xs text-zinc-500">
                Your watchlist, priced in real time
              </p>
            </div>

            {prices.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950 px-4 py-6 text-center text-sm text-zinc-600">
                No tickers yet — the market&apos;s taking a coffee break.
              </p>
            ) : (
              <div className="space-y-2">
                {prices.map((coin) => (
                  <div
                    key={`${coin.symbol}-${coin.name}`}
                    className="card-interactive flex items-center justify-start gap-x-6 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
                  >
                    <div className="min-w-[4.5rem] shrink-0">
                      <p className="font-semibold tracking-tight text-zinc-100">
                        {coin.symbol}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">{coin.name}</p>
                    </div>

                    <div className="shrink-0">
                      <p className="font-mono text-sm font-medium tracking-tight text-zinc-100">
                        {coin.formattedCurrentPrice}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        MCap {coin.formattedMarketCap}
                      </p>
                    </div>

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFiatChange((current) => !current)}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-medium tracking-tight transition-colors duration-200 ${
                          coin.isPriceChangePositive
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/15'
                        }`}
                        title="Toggle between percent and fiat change"
                      >
                        {showFiatChange ? coin.priceChangeFiat : coin.priceChangePercent}
                      </button>
                      <FeedbackButtons
                        section="coin_prices"
                        contentId={coin.symbol}
                        variant="compact"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );

      case 'news':
        return (
          <>
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Intelligence
              </p>
              <h2 className="mt-1.5 text-base font-semibold tracking-tight sm:text-lg">
                Market Pulse
              </h2>
              <p className="mt-1.5 text-xs text-zinc-500">
                Headlines tuned to your stack
              </p>
            </div>

            {news.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950 px-4 py-6 text-center text-sm text-zinc-600">
                Quiet news day. Enable &quot;Market News&quot; in preferences for
                headlines.
              </p>
            ) : (
              <ul className="news-scroll scrollbar-thin space-y-2 pr-1">
                {news.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group card-interactive block px-4 py-3.5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm font-medium leading-snug tracking-tight text-zinc-200 transition group-hover:text-zinc-50 sm:text-base">
                          {item.title}
                        </h3>
                        <span className="shrink-0 text-xs text-zinc-600 transition group-hover:text-zinc-400">
                          Read →
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                        {item.summary}
                      </p>
                    </a>

                    <div className="flex items-center justify-between gap-3 px-4 pb-3">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-600">
                        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-medium tracking-tight text-zinc-400">
                          {item.sourceLabel}
                        </span>
                        <span className="tracking-tight text-zinc-500">
                          {item.formattedTime}
                        </span>
                        {item.currencies && item.currencies.length > 0 ? (
                          <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-zinc-500">
                            {item.currencies.join(', ')}
                          </span>
                        ) : null}
                        {item.feedSource === 'fallback' ? (
                          <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-zinc-500">
                            cached
                          </span>
                        ) : null}
                      </div>
                      <FeedbackButtons
                        section="market_news"
                        contentId={item.id}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        );

      case 'aiInsight':
        return (
          <>
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <SparklesIcon />
                AI Briefing
              </div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                Daily Alpha Brief
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                {profileMeta.calibratedLabel}
              </p>
            </div>

            <div className="relative rounded-lg border border-zinc-800 bg-zinc-950/60 px-5 py-5">
              <p className="text-base leading-relaxed text-zinc-300">
                {aiInsight.insight}
              </p>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
                  <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1">
                    {aiInsight.model}
                  </span>
                  <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1">
                    {aiInsight.source === 'fallback' ? 'cached brief' : 'live brief'}
                  </span>
                </div>
                <FeedbackButtons
                  section="ai_insight"
                  contentId={aiInsight.contentId}
                />
              </div>
            </div>
          </>
        );

      case 'meme':
        return (
          <>
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Culture
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                Market Sentiment
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Curated community perspective
              </p>
            </div>

            <MemeCard
              id={meme.id}
              url={meme.url}
              title={meme.title}
              source={meme.source}
              fallbackQuote={meme.fallbackQuote}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout marqueeTickers={marqueeTickers}>
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-950/15 via-zinc-950 to-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-black/80 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-6 py-8 sm:grid-cols-[1fr_auto_1fr] lg:px-8">
          <div className="min-w-0 justify-self-start">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 font-mono text-base font-bold text-zinc-400 shadow-sm"
                aria-hidden="true"
              >
                {resolveUserInitial(user?.name)}
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {profileMeta.welcomeMessage}
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
              {profileMeta.terminalTitle}
            </h1>
            <span className="mt-3 inline-flex rounded-md border border-emerald-500/20 bg-zinc-900/60 px-3 py-1 text-xs font-medium tracking-wide text-emerald-400/90 backdrop-blur-sm">
              {profileMeta.calibratedLabel}
            </span>
          </div>

          <div className="mx-auto justify-self-center sm:col-start-2">
            <FearGreedDial fearAndGreed={fearAndGreed} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:col-start-3 sm:justify-self-end sm:justify-end">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="btn-interactive flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 sm:text-sm"
              title="Open settings"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-interactive rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {layoutSections
            .filter((section) => section.visible)
            .map((section) => (
              <section
                key={section.id}
                className={getSectionPanelClass(section.width, section.id)}
              >
                {renderDashboardSection(section.id)}
              </section>
            ))}
        </div>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => {
          void fetchDashboard();
        }}
      />
    </div>
    </DashboardLayout>
  );
}
