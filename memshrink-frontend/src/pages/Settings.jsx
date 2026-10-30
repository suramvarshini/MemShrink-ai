import { useState, useEffect } from 'react';
import { Save, Monitor, Bell, RefreshCw, Info, Moon, Sun } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useTheme } from '../context/ThemeContext';

const STORAGE_KEY = 'memshrink-settings';

const DEFAULT_SETTINGS = {
  warningThreshold:  75,
  criticalThreshold: 90,
  refreshInterval:   10,
  showNotifications: true,
  autoDetect:        true,
  compactView:       false,
};

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function Slider({ min, max, step = 1, value, onChange, unit = '' }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500 h-2 rounded-full cursor-pointer"
      />
      <span className="text-sm font-semibold text-main w-16 text-right">
        {value}{unit}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { isDark, toggle } = useTheme();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setSettings({ ...DEFAULT_SETTINGS, ...stored });
    } catch { /* ignore */ }
  }, []);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Layout title="Settings" subtitle="Customize MemShrink preferences">
      <div className="max-w-2xl space-y-5">

        {/* Appearance */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-blue-500" />
            <h3 className="font-semibold text-sm text-main">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-main">Dark Mode</p>
                <p className="text-xs text-muted">Switch between light and dark theme</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun size={14} className="text-yellow-500" />
                <Toggle checked={isDark} onChange={toggle} />
                <Moon size={14} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-main">Compact View</p>
                <p className="text-xs text-muted">Show more information in less space</p>
              </div>
              <Toggle checked={settings.compactView} onChange={v => update('compactView', v)} />
            </div>
          </div>
        </div>

        {/* Monitoring */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={16} className="text-green-500" />
            <h3 className="font-semibold text-sm text-main">Monitoring</h3>
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-main mb-1">Refresh Interval</p>
              <p className="text-xs text-muted mb-3">How often to update memory readings</p>
              <Slider min={5} max={60} step={5} value={settings.refreshInterval} onChange={v => update('refreshInterval', v)} unit="s" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-main">Auto-detect Processes</p>
                <p className="text-xs text-muted">Automatically fetch running process list</p>
              </div>
              <Toggle checked={settings.autoDetect} onChange={v => update('autoDetect', v)} />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-orange-500" />
            <h3 className="font-semibold text-sm text-main">Alert Thresholds</h3>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium text-main">Warning Threshold</p>
                <span className="text-xs font-semibold text-yellow-600">{settings.warningThreshold}%</span>
              </div>
              <p className="text-xs text-muted mb-3">Show a warning when RAM usage exceeds this</p>
              <Slider min={50} max={85} step={5} value={settings.warningThreshold} onChange={v => update('warningThreshold', v)} unit="%" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium text-main">Critical Threshold</p>
                <span className="text-xs font-semibold text-red-600">{settings.criticalThreshold}%</span>
              </div>
              <p className="text-xs text-muted mb-3">Show a critical alert at this usage level</p>
              <Slider min={70} max={99} step={5} value={settings.criticalThreshold} onChange={v => update('criticalThreshold', Math.max(settings.warningThreshold + 5, v))} unit="%" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-main">Desktop Notifications</p>
                <p className="text-xs text-muted">Browser notification when thresholds are crossed</p>
              </div>
              <Toggle checked={settings.showNotifications} onChange={v => update('showNotifications', v)} />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-muted" />
            <h3 className="font-semibold text-sm text-main">About MemShrink</h3>
          </div>
          <div className="space-y-1 text-xs text-muted">
            <p>Version: 1.0.0</p>
            <p>Frontend: React.js + Recharts + Tailwind CSS</p>
            <p>Backend: Node.js + Express + MongoDB</p>
            <p>System info: systeminformation library</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={save}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-surface text-muted hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </Layout>
  );
}
