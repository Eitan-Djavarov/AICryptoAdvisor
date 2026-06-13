import FieldError from '../settings/FieldError';

export interface OnboardingOperatorSectionProps {
  operatorName: string;
  onOperatorNameChange: (value: string) => void;
  nameError?: string;
}

export default function OnboardingOperatorSection({
  operatorName,
  onOperatorNameChange,
  nameError,
}: OnboardingOperatorSectionProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Operator
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
        What should we call you?
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        This name appears in your terminal welcome message.
      </p>
      <input
        id="onboarding-operator-name"
        type="text"
        value={operatorName}
        onChange={(event) => onOperatorNameChange(event.target.value)}
        className="mt-6 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
        autoComplete="name"
      />
      <FieldError message={nameError} />
    </section>
  );
}
