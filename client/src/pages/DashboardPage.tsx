import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSections from '../components/DashboardSections';
import SettingsModal from '../components/SettingsModal';
import DashboardSkeleton from '../components/DashboardSkeleton';
import DashboardErrorState from '../components/DashboardErrorState';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    dashboard,
    loading,
    loadingMessage,
    error,
    refresh,
    handleSettingsSaved,
  } = useDashboard();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  if (loading && !dashboard) {
    return (
      <DashboardLayout>
        <DashboardSkeleton message={loadingMessage} />
      </DashboardLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <DashboardLayout>
        <DashboardErrorState error={error} onRetry={() => void refresh()} />
      </DashboardLayout>
    );
  }

  const { prices, news, aiInsight, meme, marqueeTickers, profileMeta, fearAndGreed } =
    dashboard.dashboard;

  return (
    <DashboardLayout marqueeTickers={marqueeTickers}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-950/15 via-zinc-950 to-zinc-950 text-zinc-100">
        <DashboardHeader
          userName={user?.name}
          profileMeta={profileMeta}
          fearAndGreed={fearAndGreed}
          onOpenSettings={handleOpenSettings}
          onLogout={handleLogout}
        />

        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
          <DashboardSections
            layoutSections={dashboard.layoutSections}
            prices={prices}
            news={news}
            aiInsight={aiInsight}
            meme={meme}
            calibratedLabel={profileMeta.calibratedLabel}
            interactions={dashboard.interactions}
          />
        </main>

        <SettingsModal
          isOpen={settingsOpen}
          onClose={handleCloseSettings}
          onSaved={handleSettingsSaved}
        />
      </div>
    </DashboardLayout>
  );
}
