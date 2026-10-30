import { Sun, Moon, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMemory } from '../../context/MemoryContext';

export default function Topbar({ title, subtitle }) {
  const { isDark, toggle } = useTheme();
  const { refresh, loading, isConnected } = useMemory();

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-surface px-6 py-3 flex items-center justify-between">
      {/* Title area (left-padded on mobile for burger menu) */}
      <div className="pl-10 lg:pl-0">
        <h2 className="font-semibold text-base text-main leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Connection indicator */}
        <div
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium
            ${isConnected
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}
        >
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span className="hidden sm:inline">{isConnected ? 'Live' : 'Demo'}</span>
        </div>

        {/* Refresh */}
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw size={16} className={`text-muted ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark
            ? <Sun size={16} className="text-yellow-500" />
            : <Moon size={16} className="text-muted" />
          }
        </button>
      </div>
    </header>
  );
}
