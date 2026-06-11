import { INVESTOR_TYPE_OPTIONS } from '../../constants/onboarding';
import type { InvestorType } from '../../types';
import FieldError from './FieldError';

export interface RiskProfileTabProps {
  investorType: InvestorType | null;
  onInvestorTypeChange: (value: InvestorType) => void;
  investorTypeError?: string;
}

export default function RiskProfileTab({
  investorType,
  onInvestorTypeChange,
  investorTypeError,
}: RiskProfileTabProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Risk Profile
      </p>
      <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-100">
        Investment risk profile
      </h3>
      <p className="mt-2 text-sm text-zinc-500">
        Shapes the tone of your AI market briefings.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {INVESTOR_TYPE_OPTIONS.map((option) => {
          const isSelected = investorType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onInvestorTypeChange(option.value)}
              className={`card-interactive rounded-lg border p-4 text-left ${
                isSelected
                  ? 'glass-panel-selected'
                  : 'border-zinc-800 bg-zinc-950'
              }`}
            >
              <p className="text-sm font-medium tracking-tight text-zinc-100">
                {option.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
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
