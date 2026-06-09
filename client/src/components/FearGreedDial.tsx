import type { FearAndGreedIndex, FearGreedColorType } from '../types';

const COLOR_TYPE_FILL_CLASS: Record<FearGreedColorType, string> = {
  fear: 'fill-rose-400',
  neutral: 'fill-amber-400',
  greed: 'fill-emerald-400',
};

const COLOR_TYPE_TEXT_CLASS: Record<FearGreedColorType, string> = {
  fear: 'text-rose-400',
  neutral: 'text-amber-400',
  greed: 'text-emerald-400',
};

const COLOR_TYPE_NEEDLE_CLASS: Record<FearGreedColorType, string> = {
  fear: 'stroke-rose-500',
  neutral: 'stroke-amber-500',
  greed: 'stroke-emerald-500',
};

const GAUGE_ARC_PATH = 'M 24 100 A 76 76 0 0 1 176 100';
const GAUGE_PIVOT = '100 100';

interface FearGreedDialProps {
  fearAndGreed?: FearAndGreedIndex | null;
}

export default function FearGreedDial({ fearAndGreed }: FearGreedDialProps) {
  const value = fearAndGreed?.value;
  const classification = fearAndGreed?.classification;
  const colorType = fearAndGreed?.colorType;
  const hasData = typeof value === 'number' && colorType;

  const needleClass = hasData
    ? COLOR_TYPE_NEEDLE_CLASS[colorType]
    : 'stroke-zinc-600';
  const scoreFillClass = hasData
    ? COLOR_TYPE_FILL_CLASS[colorType]
    : 'fill-zinc-500';
  const classificationTextClass = hasData
    ? COLOR_TYPE_TEXT_CLASS[colorType]
    : 'text-zinc-500';

  return (
    <div
      className="mx-auto flex w-[200px] flex-col items-center"
      aria-label={
        hasData && classification
          ? `Market sentiment ${value} ${classification}`
          : 'Market sentiment loading'
      }
    >
      <svg
        viewBox="0 0 200 120"
        className="h-auto w-full max-w-[200px]"
        role="img"
        aria-hidden={!hasData}
      >
        <defs>
          <linearGradient
            id="fearGreedArcGradient"
            x1="24"
            y1="100"
            x2="176"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="35%" stopColor="#f97316" />
            <stop offset="65%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <path
          d={GAUGE_ARC_PATH}
          fill="none"
          stroke="url(#fearGreedArcGradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <g
          transform={
            hasData
              ? `rotate(${(value / 100) * 180 - 90}, ${GAUGE_PIVOT})`
              : `rotate(-90, ${GAUGE_PIVOT})`
          }
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            className={`${needleClass} transition-[stroke] duration-500 ease-out`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <text
            x="100"
            y="8"
            textAnchor="middle"
            className={`font-mono text-[11px] font-bold text-center ${scoreFillClass}`}
          >
            {hasData ? value : '—'}
          </text>
        </g>

        <circle
          cx="100"
          cy="100"
          r="4"
          className="fill-zinc-900 stroke-zinc-700"
          strokeWidth="1.5"
        />
      </svg>

      <p
        className={`mt-3 block text-center font-mono text-[11px] font-bold uppercase tracking-widest ${classificationTextClass}`}
      >
        {hasData && classification ? classification : '—'}
      </p>
    </div>
  );
}
