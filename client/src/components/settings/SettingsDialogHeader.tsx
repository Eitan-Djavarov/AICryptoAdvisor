export interface SettingsDialogHeaderProps {
  onClose: () => void;
}

export default function SettingsDialogHeader({
  onClose,
}: SettingsDialogHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-5 sm:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Preferences
        </p>
        <h2
          id="settings-title"
          className="mt-1 text-xl font-semibold tracking-tight text-zinc-50"
        >
          Dashboard Settings
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn-interactive rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200"
      >
        Close
      </button>
    </div>
  );
}
