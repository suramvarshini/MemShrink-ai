import { useState, useMemo } from 'react';
import { Search, AlertCircle, ArrowUpDown, Cpu } from 'lucide-react';
import Layout from '../components/layout/Layout';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useMemory } from '../context/MemoryContext';
import { formatBytes, getUsageHex } from '../utils/format';

// App icon placeholder colour
function AppIcon({ name }) {
  const colours = ['#3b82f6','#22c55e','#f59e0b','#ec4899','#f97316','#8b5cf6','#14b8a6','#ef4444'];
  const idx = name.charCodeAt(0) % colours.length;
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ background: colours[idx] }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AnalyzerPage() {
  const { processes, stats, loading } = useMemory();
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState('memoryUsage');
  const [order, setOrder]   = useState('desc');
  const [filter, setFilter] = useState('all');

  const sorted = useMemo(() => {
    let list = [...processes];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'high') list = list.filter(p => p.isHighUsage);
    list.sort((a, b) => order === 'desc' ? b[sort] - a[sort] : a[sort] - b[sort]);
    return list;
  }, [processes, search, sort, order, filter]);

  const toggleSort = (col) => {
    if (sort === col) setOrder(o => o === 'desc' ? 'asc' : 'desc');
    else { setSort(col); setOrder('desc'); }
  };

  const totalUsed = stats?.usedMemory ?? 1;

  return (
    <Layout title="Memory Analyzer" subtitle="Identify memory-heavy applications">
      <div className="space-y-4">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search processes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface bg-card text-sm text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[['all','All'],['high','High Usage']].map(([v,l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === v ? 'bg-white dark:bg-slate-700 text-main shadow-sm' : 'text-muted hover:text-main'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* High-usage callout */}
        {!loading && sorted.filter(p => p.isHighUsage).length > 0 && (
          <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-orange-700 dark:text-orange-300">
              <span className="font-semibold">{sorted.filter(p => p.isHighUsage).length} processes</span> are consuming unusually high memory.
              Consider closing unused applications.
            </p>
          </div>
        )}

        {/* Table header */}
        <div className="card overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-surface bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-muted uppercase tracking-wide">
            <div className="col-span-5">Application</div>
            <div className="col-span-3">
              <button className="flex items-center gap-1 hover:text-main transition-colors" onClick={() => toggleSort('memoryUsage')}>
                Memory <ArrowUpDown size={11} />
              </button>
            </div>
            <div className="col-span-3">
              <button className="flex items-center gap-1 hover:text-main transition-colors" onClick={() => toggleSort('memoryPercent')}>
                % Usage <ArrowUpDown size={11} />
              </button>
            </div>
            <div className="col-span-1">Status</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-surface">
            {loading ? (
              [1,2,3,4,5].map(i => (
                <div key={i} className="px-4 py-3 animate-pulse flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : sorted.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2 text-muted">
                <Cpu size={32} className="opacity-40" />
                <p className="text-sm">No processes found</p>
              </div>
            ) : (
              sorted.map(proc => (
                <div
                  key={proc.pid}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    proc.isHighUsage ? 'border-l-2 border-orange-400' : ''
                  }`}
                >
                  {/* Name */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <AppIcon name={proc.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-main truncate">{proc.name}</p>
                      <p className="text-xs text-muted">PID {proc.pid}</p>
                    </div>
                    {proc.isHighUsage && (
                      <Badge label="High" variant="warning" />
                    )}
                  </div>
                  {/* Memory */}
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-main">{formatBytes(proc.memoryUsage)}</p>
                    <div className="mt-1">
                      <ProgressBar
                        percent={(proc.memoryUsage / totalUsed) * 100}
                        height={4}
                        color={getUsageHex(proc.memoryPercent)}
                      />
                    </div>
                  </div>
                  {/* Percent */}
                  <div className="col-span-3">
                    <p className="text-sm font-semibold" style={{ color: getUsageHex(proc.memoryPercent) }}>
                      {proc.memoryPercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted">of RAM</p>
                  </div>
                  {/* Status */}
                  <div className="col-span-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" title="Running" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {!loading && (
          <p className="text-xs text-muted text-right">
            Showing {sorted.length} of {processes.length} processes
          </p>
        )}
      </div>
    </Layout>
  );
}
