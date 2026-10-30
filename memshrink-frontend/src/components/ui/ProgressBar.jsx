import { getUsageHex } from '../../utils/format';

export default function ProgressBar({ percent = 0, height = 8, animated = true, showLabel = false, color }) {
  const barColor = color || getUsageHex(percent);
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-muted">Usage</span>
          <span className="text-xs font-semibold" style={{ color: barColor }}>{percent.toFixed(1)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700"
        style={{ height }}
      >
        <div
          className="rounded-full"
          style={{
            width: `${Math.min(100, percent)}%`,
            height: '100%',
            background: barColor,
            transition: animated ? 'width 0.8s cubic-bezier(0.4,0,0.2,1)' : undefined,
          }}
        />
      </div>
    </div>
  );
}
