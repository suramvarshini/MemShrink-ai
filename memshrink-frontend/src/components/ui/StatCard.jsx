export default function StatCard({ icon, label, value, sub, accent = '#3b82f6', trend }) {
  return (
    <div className="card p-5 animate-slideIn">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
          style={{ background: accent }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend > 0
              ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-main">{value}</p>
      <p className="text-sm text-muted mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted mt-1 border-t border-surface pt-1">{sub}</p>}
    </div>
  );
}
