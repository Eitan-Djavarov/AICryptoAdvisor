const LOADING_MESSAGES = [
  'Consulting market intelligence...',
  'Syncing live market feeds...',
  'Curating headlines for your watchlist...',
  'Preparing dashboard modules...',
] as const;

interface DashboardSkeletonProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export default function DashboardSkeleton({
  message = LOADING_MESSAGES[0],
  showProgress = false,
  progress = 0,
}: DashboardSkeletonProps) {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="skeleton-shimmer h-3 w-28 rounded" />
            <div className="skeleton-shimmer h-8 w-52 rounded-lg" />
          </div>
          <div className="skeleton-shimmer h-10 w-36 rounded-lg" />
        </div>

        <div className="mb-10 flex flex-col items-center gap-5 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-500" />
          <p className="text-sm font-medium text-zinc-400 sm:text-base">{message}</p>
          {showProgress ? (
            <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-zinc-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="glass-panel rounded-xl p-6 lg:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-3 w-24 rounded" />
                  <div className="skeleton-shimmer h-5 w-40 rounded-lg" />
                  <div className="skeleton-shimmer h-3 w-56 rounded" />
                </div>
                <div className="skeleton-shimmer h-8 w-24 rounded-lg" />
              </div>
              <div className="space-y-3">
                <div className="skeleton-shimmer h-14 w-full rounded-lg" />
                <div className="skeleton-shimmer h-14 w-full rounded-lg" />
                <div className="skeleton-shimmer h-14 w-[80%] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { LOADING_MESSAGES };
