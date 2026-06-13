import FieldError from '../settings/FieldError';
import { CONTENT_TYPE_OPTIONS } from '../../constants/onboarding';
import type { ContentType } from '../../types';

export interface OnboardingContentSectionProps {
  selectedContentTypes: ContentType[];
  onToggleContentType: (contentType: ContentType) => void;
  contentTypesError?: string;
}

export default function OnboardingContentSection({
  selectedContentTypes,
  onToggleContentType,
  contentTypesError,
}: OnboardingContentSectionProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Step 3
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
        What content do you want to see?
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        Choose the data lanes for your dashboard.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CONTENT_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedContentTypes.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggleContentType(option.value)}
              className={`card-interactive flex items-start gap-3 rounded-lg border p-5 text-left ${
                isSelected
                  ? 'glass-panel-selected'
                  : 'border-zinc-800 bg-zinc-950'
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] transition-all duration-300 ease-out ${
                  isSelected
                    ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                    : 'border-zinc-700 bg-transparent text-transparent'
                }`}
              >
                ✓
              </span>
              <span>
                <p className="font-medium tracking-tight text-zinc-100">
                  {option.title}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{option.description}</p>
              </span>
            </button>
          );
        })}
      </div>
      <FieldError message={contentTypesError} />
    </section>
  );
}
