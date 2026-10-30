import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCheck, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAlerts } from '../context/AlertContext';
import { formatDateTime } from '../utils/format';

const ICON_MAP = {
  critical: { icon: AlertCircle, bg: 'bg-red-50 dark:bg-red-900/20',    border: 'border-red-200 dark:border-red-800',    text: 'text-red-600 dark:text-red-400',    label: 'Critical' },
  warning:  { icon: AlertTriangle, bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', label: 'Warning' },
  info:     { icon: Info, bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-800',    text: 'text-blue-600 dark:text-blue-400',    label: 'Info' },
};

export default function AlertsPage() {
  const { alerts, unreadCount, fetchAlerts, markRead, markAllRead } = useAlerts();
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const filtered = alerts.filter(a => {
    if (filter === 'unread') return !a.read;
    if (filter === 'critical') return a.type === 'critical';
    return true;
  });

  return (
    <Layout title="Smart Alerts" subtitle="Memory usage notifications and warnings">
      <div className="space-y-4">

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[['all','All'],['unread','Unread'],['critical','Critical']].map(([v,l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === v ? 'bg-white dark:bg-slate-700 text-main shadow-sm' : 'text-muted hover:text-main'
                }`}
              >
                {l}
                {v === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <CheckCheck size={13} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Alert list */}
        {filtered.length === 0 ? (
          <div className="card p-12 flex flex-col items-center gap-3 text-muted">
            <BellOff size={36} className="opacity-30" />
            <p className="text-sm">No alerts to display</p>
            <p className="text-xs text-center max-w-xs">
              Alerts appear here when your RAM usage crosses the warning or critical thresholds.
              Thresholds can be configured in Settings.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((alert) => {
              const cfg = ICON_MAP[alert.type] || ICON_MAP.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={alert._id}
                  className={`card p-4 flex items-start gap-3 border ${cfg.border} ${cfg.bg} ${
                    !alert.read ? 'shadow-sm' : 'opacity-70'
                  } transition-opacity`}
                >
                  <Icon size={16} className={`${cfg.text} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                      {!alert.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-main">{alert.message}</p>
                    <p className="text-xs text-muted mt-1">{formatDateTime(alert.timestamp || alert.createdAt)}</p>
                  </div>
                  {!alert.read && (
                    <button
                      onClick={() => markRead(alert._id)}
                      className="text-xs text-muted hover:text-main transition-colors flex-shrink-0"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Alert settings hint */}
        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          <Bell size={15} className="mt-0.5 flex-shrink-0" />
          <span>
            Alert thresholds are configurable in <strong>Settings</strong>.
            Default: warning at 75% and critical at 90% RAM usage.
          </span>
        </div>
      </div>
    </Layout>
  );
}
