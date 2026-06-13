import FieldError from '../settings/FieldError';
import { INVESTOR_TYPE_OPTIONS } from '../../constants/onboarding';
import type { InvestorType } from '../../types';

export interface OnboardingInvestorSectionProps {
  investorType: InvestorType | null;
  onSelectInvestorType: (type: InvestorType) => void;
  investorTypeError?: string;
}

export default function OnboardingInvestorSection({
  investorType,
  onSelectInvestorType,
  investorTypeError,
}: OnboardingInvestorSectionProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Step 2
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
        What kind of investor are you?
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        This shapes your AI briefing tone and risk framing.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {INVESTOR_TYPE_OPTIONS.map((option) => {
          const isSelected = investorType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectInvestorType(option.value)}
              className={`card-interactive rounded-lg border p-5 text-left ${
                isSelected
                  ? 'glass-panel-selected'
                  : 'border-zinc-800 bg-zinc-950'
              }`}
            >
              <p className="font-medium tracking-tight text-zinc-100">
                {option.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
      <FieldError message={investorTypeError} />
    </section>
  );
}
