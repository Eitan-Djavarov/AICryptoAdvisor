export interface DashboardErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function DashboardErrorState({
  error,
  onRetry,
}: DashboardErrorStateProps) {
  return (
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
          onClick={onRetry}
          className="btn-primary mt-8 rounded-lg px-6 py-2.5 text-sm font-medium"
        >
          Reconnect Terminal
        </button>
      </div>
    </div>
  );
}
