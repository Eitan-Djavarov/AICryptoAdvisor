import FieldError from './FieldError';

export interface OperatorTabProps {
  operatorName: string;
  onOperatorNameChange: (value: string) => void;
  nameError?: string;
}

function resolveOperatorInitial(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'E';
  }

  return trimmed.charAt(0).toUpperCase();
}

export default function OperatorTab({
  operatorName,
  onOperatorNameChange,
  nameError,
}: OperatorTabProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Operator
      </p>
      <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-100">
        Display name
      </h3>
      <p className="mt-2 text-sm text-zinc-500">
        Shown in your personalized terminal welcome message.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 font-mono text-base font-bold text-zinc-400 shadow-sm"
          aria-hidden="true"
        >
          {resolveOperatorInitial(operatorName)}
        </div>
        <input
          id="settings-operator-name"
          type="text"
          value={operatorName}
          onChange={(event) => onOperatorNameChange(event.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
          autoComplete="name"
        />
      </div>
      <FieldError message={nameError} />
    </section>
  );
}
