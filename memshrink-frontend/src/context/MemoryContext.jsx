import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { memoryAPI, systemAPI } from '../services/api';

const MemoryContext = createContext();

function generateMockStats() {
  const total = 16 * 1024 ** 3;
  const pct = 55 + Math.random() * 20;
  const used = Math.round(total * pct / 100);
  return {
    totalMemory: total, usedMemory: used,
    freeMemory: total - used, usagePercent: parseFloat(pct.toFixed(2)),
    swapTotal: 8 * 1024 ** 3, swapUsed: Math.round(2 * 1024 ** 3 * Math.random()),
    timestamp: new Date(), isMock: true,
  };
}

function generateMockProcesses(total) {
  const apps = [
    { name: 'Google Chrome', base: 0.18 },
    { name: 'VS Code', base: 0.12 },
    { name: 'Node.js', base: 0.06 },
    { name: 'MongoDB', base: 0.05 },
    { name: 'Slack', base: 0.07 },
    { name: 'Discord', base: 0.06 },
    { name: 'Spotify', base: 0.04 },
    { name: 'Windows Explorer', base: 0.03 },
    { name: 'Antivirus', base: 0.04 },
    { name: 'OneDrive', base: 0.02 },
    { name: 'Microsoft Teams', base: 0.05 },
    { name: 'Zoom', base: 0.04 },
    { name: 'Adobe Reader', base: 0.03 },
    { name: 'System Idle', base: 0.02 },
    { name: 'Task Manager', base: 0.01 },
  ];
  return apps.map((a, i) => {
    const jitter = (Math.random() - 0.5) * 0.02;
    const pct = Math.max(0.005, a.base + jitter);
    const mem = Math.round(total * pct);
    return {
      pid: 1000 + i * 47, name: a.name,
      memoryUsage: mem, memoryPercent: parseFloat((pct * 100).toFixed(2)),
      status: 'running', isHighUsage: pct >= 0.08,
    };
  }).sort((a, b) => b.memoryUsage - a.memoryUsage);
}

export function MemoryProvider({ children, refreshInterval = 10000 }) {
  const [stats, setStats]         = useState(null);
  const [processes, setProcesses] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, procsRes] = await Promise.allSettled([
        memoryAPI.getStats(),
        memoryAPI.getProcesses(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data);
        setIsConnected(true);
        setError(null);
      } else throw new Error('stats failed');

      if (procsRes.status === 'fulfilled') {
        setProcesses(procsRes.value.data.data);
      }
    } catch {
      setIsConnected(false);
      // use mock data
      const mock = generateMockStats();
      setStats(mock);
      setProcesses(generateMockProcesses(mock.totalMemory));
      setError('Backend offline – showing simulated data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await systemAPI.getInfo();
      setSystemInfo(res.data.data);
    } catch {
      setSystemInfo({
        cpu: { brand: 'Intel Core i7-12700H', cores: 20, speed: 2.3 },
        os:  { platform: 'Windows', distro: 'Windows 11', release: '23H2', hostname: 'DESKTOP-USER' },
        memory: { total: 16 * 1024 ** 3 },
        uptime: 86400,
      });
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchSystemInfo();
  }, [fetchAll, fetchSystemInfo]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll, refreshInterval]);

  const refresh = () => { setLoading(true); fetchAll(); };

  return (
    <MemoryContext.Provider value={{ stats, processes, systemInfo, loading, error, isConnected, refresh }}>
      {children}
    </MemoryContext.Provider>
  );
}

export const useMemory = () => useContext(MemoryContext);
