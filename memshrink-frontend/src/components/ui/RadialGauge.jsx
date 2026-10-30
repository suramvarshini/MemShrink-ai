import { getUsageHex } from '../../utils/format';

/**
 * Circular radial progress indicator
 */
export default function RadialGauge({ percent = 0, size = 140, strokeWidth = 12, label, sublabel }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color = getUsageHex(percent);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-700"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-main" style={{ color }}>{percent.toFixed(0)}%</span>
          {label && <span className="text-xs text-muted mt-0.5">{label}</span>}
        </div>
      </div>
      {sublabel && <p className="text-xs text-muted">{sublabel}</p>}
    </div>
  );
}
