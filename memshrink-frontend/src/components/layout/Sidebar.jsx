import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, Zap, BarChart3,
  Bell, Settings, Menu, X, Gauge,
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';

const NAV_ITEMS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyzer',  icon: Cpu,             label: 'Analyzer' },
  { to: '/optimize',  icon: Zap,             label: 'Optimize' },
  { to: '/history',   icon: BarChart3,       label: 'History' },
  { to: '/alerts',    icon: Bell,            label: 'Alerts' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useAlerts();

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-surface rounded-xl p-2 shadow-md"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <X size={20} className="text-main" /> : <Menu size={20} className="text-main" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        w-64 bg-card border-r border-surface
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-surface">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <Gauge size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-main leading-tight">MemShrink</h1>
              <p className="text-xs text-muted">Memory Optimizer</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 relative
                ${isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-muted hover:bg-slate-50 hover:text-main dark:hover:bg-slate-800'
                }
              `}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {label === 'Alerts' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface">
          <p className="text-xs text-muted">MemShrink v1.0.0</p>
          <p className="text-xs text-muted">© 2025 Smart Memory OS</p>
        </div>
      </aside>
    </>
  );
}
