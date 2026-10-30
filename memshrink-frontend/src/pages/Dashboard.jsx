import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { MemoryStick, Cpu, HardDrive, Activity, Zap, AlertTriangle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import RadialGauge from '../components/ui/RadialGauge';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useMemory } from '../context/MemoryContext';
import { useAlerts } from '../context/AlertContext';
import { memoryAPI } from '../services/api';
import { formatBytes, formatUptime, formatTime, getUsageHex } from '../utils/format';

// custom tooltip for area chart
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-surface rounded-xl p-3 shadow-lg text-sm">
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className="font-semibold text-main">{payload[0]?.value?.toFixed(1)}% used</p>
    </div>
  );
}

export default function DashboardPage() {
  const { stats, systemInfo, loading } = useMemory();
  const { checkAlerts } = useAlerts();
  const [history, setHistory] = useState([]);
  const [histPeriod, setHistPeriod] = useState('day');

  // fetch sparkline history
  useEffect(() => {
    memoryAPI.getHistory(histPeriod)
      .then(r => {
        const raw = r.data.data;
        const step = Math.max(1, Math.floor(raw.length / 24));
        setHistory(
          raw
            .filter((_, i) => i % step === 0)
            .map(d => ({
              time: formatTime(d.timestamp),
              value: d.usagePercent,
            }))
        );
      })
      .catch(() => {
        // generate inline mock
        const pts = 24;
        const now = Date.now();
        setHistory(
          Array.from({ length: pts }, (_, i) => {
            const t = new Date(now - (pts - 1 - i) * 3600000);
            const v = 55 + 15 * Math.sin((i / pts) * Math.PI * 2) + (Math.random() - 0.5) * 8;
            return { time: formatTime(t), value: parseFloat(v.toFixed(1)) };
          })
        );
      });
  }, [histPeriod]);

  // check alerts whenever stats change
  useEffect(() => {
    if (stats) checkAlerts(stats.usagePercent);
  }, [stats, checkAlerts]);

  const pct        = stats?.usagePercent ?? 0;
  const used       = stats?.usedMemory   ?? 0;
  const free       = stats?.freeMemory   ?? 0;
  const total      = stats?.totalMemory  ?? 1;
  const swapPct    = stats?.swapTotal ? (stats.swapUsed / stats.swapTotal) * 100 : 0;

  const pieData = [
    { name: 'Used',      value: used },
    { name: 'Available', value: free },
  ];
  const PIE_COLORS = [getUsageHex(pct), '#e2e8f0'];

  // status label
  const statusLabel = pct >= 90 ? '🔴 Critical' : pct >= 75 ? '🟠 High' : pct >= 60 ? '🟡 Moderate' : '🟢 Good';

  return (
    <Layout title="Dashboard" subtitle="Real-time memory overview">
      <div className="space-y-6">

        {/* Mock data notice */}
        {stats?.isMock && (
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
            <AlertTriangle size={16} />
            <span>Backend offline – showing simulated data. Start the backend server for live readings.</span>
          </div>
        )}

        {/* Row 1: gauges + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Radial gauge */}
          <div className="card p-6 flex flex-col items-center gap-3 lg:col-span-1">
            {loading ? (
              <div className="h-40 w-40 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : (
              <>
                <RadialGauge percent={pct} size={148} label="RAM" sublabel={statusLabel} />
                <p className="text-xs text-muted text-center">
                  {formatBytes(used)} / {formatBytes(total)}
                </p>
              </>
            )}
          </div>

          {/* Stat cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              [1,2,3].map(i => <SkeletonCard key={i} />)
            ) : (
              <>
                <StatCard
                  icon={<MemoryStick size={18} />}
                  label="Total RAM"
                  value={formatBytes(total)}
                  sub={systemInfo?.cpu?.brand || 'System Memory'}
                  accent="#3b82f6"
                />
                <StatCard
                  icon={<Activity size={18} />}
                  label="Used Memory"
                  value={formatBytes(used)}
                  sub={`${pct.toFixed(1)}% utilised`}
                  accent={getUsageHex(pct)}
                />
                <StatCard
                  icon={<HardDrive size={18} />}
                  label="Free Memory"
                  value={formatBytes(free)}
                  sub={`${(100 - pct).toFixed(1)}% available`}
                  accent="#22c55e"
                />
              </>
            )}
          </div>
        </div>

        {/* Row 2: Chart + Pie + Swap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-main">Memory Usage Trend</h3>
                <p className="text-xs text-muted">Last {histPeriod === 'day' ? '24 hours' : '7 days'}</p>
              </div>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {['day', 'week'].map(p => (
                  <button
                    key={p}
                    onClick={() => setHistPeriod(p)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      histPeriod === p
                        ? 'bg-white dark:bg-slate-700 text-main shadow-sm'
                        : 'text-muted hover:text-main'
                    }`}
                  >
                    {p === 'day' ? '24H' : '7D'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={getUsageHex(pct)} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getUsageHex(pct)} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" stroke={getUsageHex(pct)} strokeWidth={2} fill="url(#ramGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card p-5 flex flex-col">
            <h3 className="font-semibold text-sm text-main mb-1">Memory Distribution</h3>
            <p className="text-xs text-muted mb-4">Used vs Available</p>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatBytes(v)} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(val) => <span className="text-xs text-muted">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Swap + Uptime + System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Swap */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                <HardDrive size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-main">Swap / Page File</p>
                <p className="text-xs text-muted">Virtual memory usage</p>
              </div>
            </div>
            <ProgressBar percent={swapPct} showLabel color="#a855f7" />
            <div className="flex justify-between mt-2 text-xs text-muted">
              <span>Used: {formatBytes(stats?.swapUsed ?? 0)}</span>
              <span>Total: {formatBytes(stats?.swapTotal ?? 0)}</span>
            </div>
          </div>

          {/* System uptime */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Cpu size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-main">CPU Info</p>
                <p className="text-xs text-muted">{systemInfo?.os?.distro || 'Windows'}</p>
              </div>
            </div>
            <p className="text-xl font-bold text-main">{systemInfo?.cpu?.cores ?? '—'}</p>
            <p className="text-xs text-muted">Logical cores</p>
            <p className="text-xs text-muted mt-1 truncate">{systemInfo?.cpu?.brand || 'Detecting…'}</p>
          </div>

          {/* Performance status */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <Zap size={16} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-main">Performance</p>
                <p className="text-xs text-muted">System health</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Memory', pct },
                { label: 'Swap',   pct: swapPct },
              ].map(({ label, pct: p }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>{label}</span>
                    <span style={{ color: getUsageHex(p) }}>{p.toFixed(1)}%</span>
                  </div>
                  <ProgressBar percent={p} height={6} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs font-medium" style={{ color: getUsageHex(pct) }}>
              {statusLabel}
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
