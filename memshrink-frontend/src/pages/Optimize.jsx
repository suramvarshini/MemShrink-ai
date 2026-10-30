import { useState, useEffect } from 'react';
import { CheckCircle, Zap, AlertTriangle, Loader, ChevronRight, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { useMemory } from '../context/MemoryContext';
import { optimizeAPI } from '../services/api';
import { formatBytes } from '../utils/format';

const CATEGORY_ICONS = {
  cache:       '🗑️',
  compression: '🗜️',
  startup:     '🚀',
  browser:     '🌐',
  system:      '⚙️',
  services:    '🔧',
};

function SimulationModal({ rec, stats, onClose, onConfirm }) {
  const [running, setRunning] = useState(false);
  const [result, setResult]   = useState(null);

  const run = async () => {
    setRunning(true);
    try {
      const res = await optimizeAPI.simulate({
        recommendationId: rec.id,
        currentMemoryBytes: stats?.usedMemory ?? 0,
      });
      setResult(res.data.data);
    } catch {
      setResult({ error: true });
    }
    setRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-surface rounded-2xl shadow-2xl w-full max-w-md animate-slideIn">
        <div className="flex items-center justify-between p-5 border-b border-surface">
          <h3 className="font-semibold text-main">{rec.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} className="text-muted" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">{rec.description}</p>

          {/* Before */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-muted mb-2 font-medium uppercase">Before</p>
            <p className="text-lg font-bold text-main">{formatBytes(stats?.usedMemory ?? 0)}</p>
            <p className="text-xs text-muted">Used memory</p>
            <ProgressBar percent={stats?.usagePercent ?? 0} className="mt-2" />
          </div>

          {result && !result.error && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-xs text-green-700 dark:text-green-400 mb-2 font-medium uppercase">After (Simulated)</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatBytes(result.memoryAfter)}</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                💾 Saved ~{result.savedMB} MB
              </p>
            </div>
          )}

          {result?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
              Simulation failed. Backend may be offline.
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex gap-2 text-sm text-yellow-700 dark:text-yellow-300">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <span>MemShrink never terminates processes automatically. This is a safe simulation only.</span>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-surface flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-muted border border-surface hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          {!result ? (
            <button
              onClick={run}
              disabled={running}
              className="px-4 py-2 rounded-xl text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {running && <Loader size={14} className="animate-spin" />}
              {running ? 'Simulating…' : 'Run Simulation'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OptimizePage() {
  const { stats, loading } = useMemory();
  const [recs, setRecs]           = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [selected, setSelected]   = useState(null);
  const [history, setHistory]     = useState([]);

  useEffect(() => {
    optimizeAPI.getRecommendations()
      .then(r => setRecs(r.data.data))
      .catch(() => {
        setRecs([
          { id:'clear-cache',      title:'Clear System Cache',          description:'Release cached memory no longer needed by the OS.',                  estimatedSavings:'200–500 MB', riskLevel:'safe',     category:'cache' },
          { id:'compress-standby', title:'Compress Standby Memory',     description:'Compress memory pages in standby to free physical RAM.',             estimatedSavings:'300–800 MB', riskLevel:'safe',     category:'compression' },
          { id:'stop-startup-apps',title:'Disable Startup Apps',        description:'Prevent resource-heavy apps from auto-starting with the system.',    estimatedSavings:'100–400 MB', riskLevel:'safe',     category:'startup' },
          { id:'browser-tabs',     title:'Close Inactive Browser Tabs', description:'Each browser tab can consume 50–200 MB of memory.',                  estimatedSavings:'150–600 MB', riskLevel:'safe',     category:'browser' },
          { id:'virtual-memory',   title:'Adjust Virtual Memory',       description:'Optimize the page file size for better memory management.',          estimatedSavings:'100–300 MB', riskLevel:'moderate', category:'system' },
          { id:'bg-services',      title:'Pause Background Services',   description:'Suspend non-essential services like indexing when RAM is critical.',  estimatedSavings:'50–200 MB',  riskLevel:'moderate', category:'services' },
        ]);
      })
      .finally(() => setLoadingRecs(false));

    optimizeAPI.getHistory()
      .then(r => setHistory(r.data.data.slice(0, 5)))
      .catch(() => {});
  }, []);

  const onSimDone = () => {
    setSelected(null);
    optimizeAPI.getHistory()
      .then(r => setHistory(r.data.data.slice(0, 5)))
      .catch(() => {});
  };

  const totalSaved = history.reduce((acc, h) => acc + (h.memorySaved || 0), 0);

  return (
    <Layout title="Memory Optimization" subtitle="Safe recommendations to free up RAM">
      <div className="space-y-5">

        {/* Summary strip */}
        {history.length > 0 && (
          <div className="card p-4 flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-muted">Total sessions optimized</p>
              <p className="text-xl font-bold text-main">{history.length}</p>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-xs text-muted">Memory recovered</p>
              <p className="text-xl font-bold text-green-600">{formatBytes(totalSaved)}</p>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-xs text-muted">Current usage</p>
              <p className="text-xl font-bold text-main">{stats?.usagePercent?.toFixed(1) ?? '—'}%</p>
            </div>
          </div>
        )}

        {/* Recommendation grid */}
        <div>
          <h3 className="font-semibold text-sm text-main mb-3">Optimization Recommendations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingRecs ? (
              [1,2,3].map(i => (
                <div key={i} className="card p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                </div>
              ))
            ) : recs.map(rec => (
              <div key={rec.id} className="card p-5 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelected(rec)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_ICONS[rec.category] || '🔧'}</span>
                    <Badge label={rec.riskLevel} variant={rec.riskLevel === 'safe' ? 'success' : 'warning'} />
                  </div>
                  <ChevronRight size={16} className="text-muted group-hover:text-main transition-colors group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h4 className="font-semibold text-sm text-main mb-1">{rec.title}</h4>
                <p className="text-xs text-muted mb-3 leading-relaxed">{rec.description}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap size={12} className="text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Est. savings: {rec.estimatedSavings}</span>
                </div>
                <button className="mt-3 w-full py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  Simulate Optimization
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <div className="card">
            <div className="px-5 py-3.5 border-b border-surface">
              <h3 className="font-semibold text-sm text-main">Recent Optimization History</h3>
            </div>
            <div className="divide-y divide-surface">
              {history.map((h, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-main truncate">{h.action}</p>
                    <p className="text-xs text-muted">{new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-green-600">+{formatBytes(h.memorySaved)}</p>
                    <p className="text-xs text-muted">saved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety notice */}
        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Safety First:</span> MemShrink never terminates processes without your explicit confirmation.
            All optimizations shown here are safe, reversible actions.
          </p>
        </div>
      </div>

      {/* Modal */}
      {selected && <SimulationModal rec={selected} stats={stats} onClose={onSimDone} />}
    </Layout>
  );
}
