import { createContext, useContext, useState, useCallback } from 'react';
import { alertsAPI } from '../services/api';

const AlertContext = createContext();

const inMemoryAlerts = [];
let alertCounter = 1;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addLocalAlert = useCallback((type, message) => {
    const a = { _id: `local-${alertCounter++}`, type, message, read: false, timestamp: new Date() };
    setAlerts(prev => {
      const next = [a, ...prev].slice(0, 50);
      setUnreadCount(next.filter(x => !x.read).length);
      return next;
    });
  }, []);

  const checkAlerts = useCallback(async (usagePercent, settings) => {
    try {
      const res = await alertsAPI.checkAlerts({ usagePercent, settings });
      if (res.data.alerts.length > 0) {
        setAlerts(prev => {
          const next = [...res.data.alerts, ...prev].slice(0, 50);
          setUnreadCount(next.filter(x => !x.read).length);
          return next;
        });
      }
    } catch {
      // backend offline – local alert
      if (usagePercent >= (settings?.critical ?? 90)) {
        addLocalAlert('critical', `Critical! RAM at ${usagePercent.toFixed(1)}%`);
      } else if (usagePercent >= (settings?.warning ?? 75)) {
        addLocalAlert('warning', `High RAM usage: ${usagePercent.toFixed(1)}%`);
      }
    }
  }, [addLocalAlert]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await alertsAPI.getAlerts();
      setAlerts(res.data.data);
      setUnreadCount(res.data.data.filter(a => !a.read).length);
    } catch { /* ignore */ }
  }, []);

  const markRead = useCallback(async (id) => {
    try { await alertsAPI.markRead(id); } catch { /* ignore */ }
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, read: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    try { await alertsAPI.markAllRead(); } catch { /* ignore */ }
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, checkAlerts, fetchAlerts, markRead, markAllRead, addLocalAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => useContext(AlertContext);
