export interface SettingsFooterProps {
  error: string;
  successMessage: string;
  submitting: boolean;
  onCancel: () => void;
}

export default function SettingsFooter({
  error,
  successMessage,
  submitting,
  onCancel,
}: SettingsFooterProps) {
  return (
    <>
      {error ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
          {successMessage}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="btn-interactive rounded-lg border border-zinc-800 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary rounded-lg px-6 py-2.5 text-sm font-medium"
        >
          {submitting ? 'Saving changes...' : 'Save Changes'}
        </button>
      </div>
    </>
  );
}
