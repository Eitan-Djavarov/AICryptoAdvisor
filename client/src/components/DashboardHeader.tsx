import FearGreedDial from './FearGreedDial';
import type { FearAndGreedIndex, InvestorProfileMeta } from '../types';

export interface DashboardHeaderProps {
  userName?: string;
  profileMeta: InvestorProfileMeta;
  fearAndGreed: FearAndGreedIndex;
  onOpenSettings: () => void;
  onLogout: () => void;
}

function resolveUserInitial(name?: string): string {
  const trimmed = name?.trim();

  if (!trimmed) {
    return 'E';
  }

  return trimmed.charAt(0).toUpperCase();
}

export default function DashboardHeader({
  userName,
  profileMeta,
  fearAndGreed,
  onOpenSettings,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-zinc-800/80 bg-black/80 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-6 py-8 sm:grid-cols-[1fr_auto_1fr] lg:px-8">
        <div className="min-w-0 justify-self-start">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 font-mono text-base font-bold text-zinc-400 shadow-sm"
              aria-hidden="true"
            >
              {resolveUserInitial(userName)}
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
            onClick={onOpenSettings}
            className="btn-interactive flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 sm:text-sm"
            title="Open settings"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="btn-interactive rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 sm:text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
