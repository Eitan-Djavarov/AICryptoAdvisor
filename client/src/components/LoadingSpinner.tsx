interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4 border',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-2',
};

export default function LoadingSpinner({
  label,
  size = 'md',
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div
        className={`animate-spin rounded-full border-zinc-800 border-t-zinc-400 ${sizeClasses[size]}`}
      />
      {label ? (
        <p className="max-w-xs text-sm font-medium text-zinc-400 sm:max-w-md sm:text-base">
          {label}
        </p>
      ) : null}
    </div>
  );
}
