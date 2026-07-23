type ClarityGaugeProps = {
  /** 0..100, or null for a "not started" state */
  value: number | null;
};

export default function ClarityGauge({ value }: ClarityGaugeProps) {
  const r = 80;
  const c = 2 * Math.PI * r;
  const shown = value ?? 0;
  const offset = c * (1 - shown / 100);

  return (
    <div className="relative mx-auto h-[190px] w-[190px]">
      <svg width="190" height="190" viewBox="0 0 190 190" className="-rotate-90">
        <circle cx="95" cy="95" r={r} fill="none" stroke="#eef2f7" strokeWidth="14" />
        {value !== null && (
          <circle
            cx="95"
            cy="95"
            r={r}
            fill="none"
            stroke="url(#clarityGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        )}
        <defs>
          <linearGradient id="clarityGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#20ad68" />
            <stop offset="1" stopColor="#52719f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {value === null ? (
          <>
            <span className="font-display text-2xl text-[#52719f]">New</span>
            <span className="text-xs font-semibold text-gray-400">practice to begin</span>
          </>
        ) : (
          <>
            <span className="text-[42px] font-bold tracking-tight text-[#17223b]">{value}</span>
            <span className="text-xs font-semibold text-gray-400">/ 100 clarity</span>
          </>
        )}
      </div>
    </div>
  );
}
