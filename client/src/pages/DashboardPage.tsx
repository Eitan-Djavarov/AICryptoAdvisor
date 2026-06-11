import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHeader from '../components/DashboardHeader';
import MarketDataSection from '../components/MarketDataSection';
import IntelligenceSection from '../components/IntelligenceSection';
import AIBriefingSection from '../components/AIBriefingSection';
import MemeSection from '../components/MemeSection';
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
    navigate('/login', { replace: true });
  };

  if (loading && !dashboard) {
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

  return (
    <DashboardLayout marqueeTickers={marqueeTickers}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-950/15 via-zinc-950 to-zinc-950 text-zinc-100">
        <DashboardHeader
          userName={user?.name}
          profileMeta={profileMeta}
          fearAndGreed={fearAndGreed}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogout={handleLogout}
        />

        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {layoutSections
              .filter((section) => section.visible)
              .map((section) => (
                <section
                  key={section.id}
                  className={getSectionPanelClass(section.width, section.id)}
                >
                  {section.id === 'prices' ? (
                    <MarketDataSection
                      prices={prices}
                      showFiatChange={showFiatChange}
                      onToggleFiatChange={() =>
                        setShowFiatChange((current) => !current)
                      }
                    />
                  ) : null}
                  {section.id === 'news' ? (
                    <IntelligenceSection news={news} />
                  ) : null}
                  {section.id === 'aiInsight' ? (
                    <AIBriefingSection
                      aiInsight={aiInsight}
                      calibratedLabel={profileMeta.calibratedLabel}
                      loading={loading}
                    />
                  ) : null}
                  {section.id === 'meme' ? <MemeSection meme={meme} /> : null}
                </section>
              ))}
          </div>
        </main>

        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSaved={() => {
            setDashboard(null);
            setLoading(true);
            void fetchDashboard();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
