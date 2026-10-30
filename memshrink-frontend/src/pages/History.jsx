import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { memoryAPI, optimizeAPI } from '../services/api';
import { formatBytes, formatTime, formatDate, formatDateTime, getUsageHex } from '../utils/format';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-surface rounded-xl p-3 shadow-lg text-sm">
      <p className="text-muted text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(1)}{p.name.includes('%') ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const [period, setPeriod]   = useState('day');
  const [history, setHistory] = useState([]);
  const [optHist, setOptHist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      memoryAPI.getHistory(period),
      optimizeAPI.getHistory(),
    ]).then(([histRes, optRes]) => {
      if (histRes.status === 'fulfilled') {
        const raw = histRes.value.data.data;
        // Downsample for chart readability
        const step = Math.max(1, Math.floor(raw.length / (period === 'day' ? 24 : 28)));
        setHistory(
          raw
            .filter((_, i) => i % step === 0)
            .map(d => ({
              time:  period === 'day' ? formatTime(d.timestamp) : formatDate(d.timestamp),
              usage: d.usagePercent,
              used:  d.usedMemory,
            }))
        );
      }
      if (optRes.status === 'fulfilled') {
        setOptHist(optRes.value.data.data.slice(0, 20));
      }
    }).finally(() => setLoading(false));
  }, [period]);

  // stats
  const avgUsage = history.length
    ? (history.reduce((s, d) => s + d.usage, 0) / history.length).toFixed(1)
    : '—';
  const maxUsage = history.length
    ? Math.max(...history.map(d => d.usage)).toFixed(1)
    : '—';
  const minUsage = history.length
    ? Math.min(...history.map(d => d.usage)).toFixed(1)
    : '—';

  // bar chart data – optimization savings by session
  const barData = optHist
    .slice(0, 10)
    .map((o, i) => ({
      name: `#${optHist.length - i}`,
      saved: parseFloat((o.memorySaved / 1024 / 1024).toFixed(1)),
    }))
    .reverse();

  return (
    <Layout title="Performance History" subtitle="Memory trends and optimization logs">
      <div className="space-y-5">

        {/* Period toggle */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {[['day','24 Hours'],['week','7 Days']].map(([v,l]) => (
            <button
              key={v}
              onClick={() => setPeriod(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === v ? 'bg-white dark:bg-slate-700 text-main shadow-sm' : 'text-muted hover:text-main'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Average Usage', value: `${avgUsage}%`, icon: TrendingUp, color: '#3b82f6' },
            { label: 'Peak Usage',    value: `${maxUsage}%`, icon: TrendingUp,  color: '#ef4444' },
            { label: 'Minimum Usage', value: `${minUsage}%`, icon: TrendingDown,color: '#22c55e' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} style={{ color }} />
                <p className="text-xs text-muted">{label}</p>
              </div>
              <p className="text-xl font-bold text-main">{loading ? '…' : value}</p>
            </div>
          ))}
        </div>

        {/* Area chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-main mb-4">
            RAM Usage — {period === 'day' ? 'Last 24 Hours' : 'Last 7 Days'}
          </h3>
          {loading ? (
            <div className="h-52 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={75} stroke="#f97316" strokeDasharray="4 4" label={{ value:'Warning', fill:'#f97316', fontSize:10 }} />
                <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 4" label={{ value:'Critical', fill:'#ef4444', fontSize:10 }} />
                <Area type="monotone" dataKey="usage" name="Usage %" stroke="#3b82f6" strokeWidth={2} fill="url(#histGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Optimization bar chart */}
        {barData.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-main mb-4">Optimization Sessions – Memory Saved (MB)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="saved" name="Saved (MB)" fill="#22c55e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Optimization log table */}
        {optHist.length > 0 && (
          <div className="card">
            <div className="px-5 py-3.5 border-b border-surface flex items-center gap-2">
              <Calendar size={15} className="text-muted" />
              <h3 className="font-semibold text-sm text-main">Optimization Log</h3>
            </div>
            <div className="divide-y divide-surface">
              {optHist.map((o, i) => (
                <div key={i} className="px-5 py-3 grid grid-cols-12 gap-2 items-center text-sm">
                  <div className="col-span-5 min-w-0">
                    <p className="font-medium text-main truncate">{o.action}</p>
                    <p className="text-xs text-muted">{formatDateTime(o.timestamp)}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs text-muted">Before → After</p>
                    <p className="text-xs text-main">
                      {formatBytes(o.memoryBefore)} → {formatBytes(o.memoryAfter)}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-green-600 font-semibold text-sm">+{formatBytes(o.memorySaved)}</p>
                    <p className="text-xs text-muted">freed</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`w-2 h-2 rounded-full inline-block ${
                      o.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {optHist.length === 0 && !loading && (
          <div className="card p-8 flex flex-col items-center gap-2 text-muted">
            <Calendar size={32} className="opacity-40" />
            <p className="text-sm">No optimization history yet. Run a simulation from the Optimize page.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
