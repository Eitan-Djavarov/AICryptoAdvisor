export default function AuthPageHeader() {
  return (
    <div className="mb-10 text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
        <span className="text-lg font-semibold tracking-tight text-zinc-300">
          ₿
        </span>
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        AI Crypto Advisor
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
        Sign in to your terminal
      </h1>
      <p className="mt-3 text-sm text-zinc-500">
        Institutional-grade crypto intelligence
      </p>
    </div>
  );
}
