import { CONTENT_TYPE_OPTIONS } from '../../constants/onboarding';
import type { ContentType } from '../../types';
import FieldError from './FieldError';

export interface LayoutTabProps {
  selectedContentTypes: ContentType[];
  onToggleContentType: (value: ContentType) => void;
  contentTypesError?: string;
}

export default function LayoutTab({
  selectedContentTypes,
  onToggleContentType,
  contentTypesError,
}: LayoutTabProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Content
      </p>
      <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-100">
        Content preferences
      </h3>
      <p className="mt-2 text-sm text-zinc-500">
        Choose what appears on your personalized dashboard.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {CONTENT_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedContentTypes.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggleContentType(option.value)}
              className={`card-interactive flex items-start gap-3 rounded-lg border p-4 text-left ${
                isSelected
                  ? 'glass-panel-selected'
                  : 'border-zinc-800 bg-zinc-950'
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] transition-all duration-300 ease-out ${
                  isSelected
                    ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                    : 'border-zinc-700 text-transparent'
                }`}
              >
                ✓
              </span>
              <span>
                <p className="text-sm font-medium tracking-tight text-zinc-100">
                  {option.title}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {option.description}
                </p>
              </span>
            </button>
          );
        })}
      </div>
      <FieldError message={contentTypesError} />
    </section>
  );
}
