import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MemoryProvider } from './context/MemoryContext';
import { AlertProvider } from './context/AlertContext';

import DashboardPage from './pages/Dashboard';
import AnalyzerPage  from './pages/Analyzer';
import OptimizePage  from './pages/Optimize';
import HistoryPage   from './pages/History';
import AlertsPage    from './pages/Alerts';
import SettingsPage  from './pages/Settings';

export default function App() {
  // Load saved refresh interval from settings
  const savedSettings = (() => {
    try { return JSON.parse(localStorage.getItem('memshrink-settings') || '{}'); }
    catch { return {}; }
  })();
  const refreshInterval = (savedSettings.refreshInterval ?? 10) * 1000;

  return (
    <ThemeProvider>
      <MemoryProvider refreshInterval={refreshInterval}>
        <AlertProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"         element={<DashboardPage />} />
              <Route path="/analyzer" element={<AnalyzerPage />} />
              <Route path="/optimize" element={<OptimizePage />} />
              <Route path="/history"  element={<HistoryPage />} />
              <Route path="/alerts"   element={<AlertsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </BrowserRouter>
        </AlertProvider>
      </MemoryProvider>
    </ThemeProvider>
  );
}
