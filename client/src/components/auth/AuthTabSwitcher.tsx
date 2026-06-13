export type AuthTab = 'login' | 'signup';

export interface AuthTabSwitcherProps {
  activeTab: AuthTab;
  onSelectTab: (tab: AuthTab) => void;
}

export default function AuthTabSwitcher({
  activeTab,
  onSelectTab,
}: AuthTabSwitcherProps) {
  return (
    <div className="grid grid-cols-2 border-b border-zinc-800">
      <button
        type="button"
        onClick={() => onSelectTab('login')}
        className={`btn-interactive px-4 py-4 text-sm font-medium transition-all duration-300 ease-out ${
          activeTab === 'login'
            ? 'border-b border-zinc-100 bg-zinc-900 text-zinc-100'
            : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onSelectTab('signup')}
        className={`btn-interactive px-4 py-4 text-sm font-medium transition-all duration-300 ease-out ${
          activeTab === 'signup'
            ? 'border-b border-zinc-100 bg-zinc-900 text-zinc-100'
            : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
        }`}
      >
        Create Account
      </button>
    </div>
  );
}
