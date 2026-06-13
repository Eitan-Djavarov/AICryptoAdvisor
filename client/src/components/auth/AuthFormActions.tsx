import type { AuthTab } from './AuthTabSwitcher';

export interface AuthFormActionsProps {
  activeTab: AuthTab;
  loading: boolean;
  error?: string;
}

export default function AuthFormActions({
  activeTab,
  loading,
  error,
}: AuthFormActionsProps) {
  return (
    <>
      {error ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/30 border-t-zinc-950" />
            Please wait...
          </>
        ) : activeTab === 'login' ? (
          'Enter Terminal'
        ) : (
          'Create Account'
        )}
      </button>
    </>
  );
}
