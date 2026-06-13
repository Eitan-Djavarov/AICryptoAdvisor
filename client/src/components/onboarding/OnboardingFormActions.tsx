export interface OnboardingFormActionsProps {
  error?: string;
  submitting: boolean;
}

export default function OnboardingFormActions({
  error,
  submitting,
}: OnboardingFormActionsProps) {
  return (
    <>
      {error ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="btn-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-medium"
      >
        {submitting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/30 border-t-zinc-950" />
            Saving preferences...
          </>
        ) : (
          'Launch Dashboard'
        )}
      </button>
    </>
  );
}
