const express = require('express');
const si = require('systeminformation');
const MemorySnapshot = require('../models/MemorySnapshot');

const router = express.Router();
const dbAvailable = () => require('mongoose').connection.readyState === 1;

// ── Helper: generate realistic mock processes ─────────────────────────────────
function generateMockProcesses(totalMemBytes) {
  const apps = [
    { name: 'Google Chrome',   base: 0.18 },
    { name: 'VS Code',         base: 0.12 },
    { name: 'Node.js',         base: 0.06 },
    { name: 'MongoDB',         base: 0.05 },
    { name: 'Slack',           base: 0.07 },
    { name: 'Discord',         base: 0.06 },
    { name: 'Spotify',         base: 0.04 },
    { name: 'Windows Explorer',base: 0.03 },
    { name: 'Antivirus',       base: 0.04 },
    { name: 'OneDrive',        base: 0.02 },
    { name: 'Teams',           base: 0.05 },
    { name: 'Zoom',            base: 0.04 },
    { name: 'Adobe Reader',    base: 0.03 },
    { name: 'System Idle',     base: 0.02 },
    { name: 'Task Manager',    base: 0.01 },
  ];
  return apps.map((a, i) => {
    const jitter = (Math.random() - 0.5) * 0.02;
    const pct = Math.max(0.005, a.base + jitter);
    const mem = Math.round(totalMemBytes * pct);
    return {
      pid: 1000 + i * 47,
      name: a.name,
      memoryUsage: mem,
      memoryPercent: parseFloat((pct * 100).toFixed(2)),
      status: 'running',
      isHighUsage: pct >= 0.08,
    };
  }).sort((a, b) => b.memoryUsage - a.memoryUsage);
}

// GET /api/memory/stats  – current RAM stats
router.get('/stats', async (req, res) => {
  try {
    const mem = await si.mem();
    const snapshot = {
      totalMemory:  mem.total,
      usedMemory:   mem.active,
      freeMemory:   mem.available,
      usagePercent: parseFloat(((mem.active / mem.total) * 100).toFixed(2)),
      swapTotal:    mem.swaptotal,
      swapUsed:     mem.swapused,
      timestamp:    new Date(),
    };

    // persist if DB is up
    if (dbAvailable()) {
      try { await MemorySnapshot.create(snapshot); } catch (_) {}
    }

    res.json({ success: true, data: snapshot });
  } catch (err) {
    // fallback mock data
    const totalMemory = 16 * 1024 * 1024 * 1024; // 16 GB
    const usagePercent = 55 + Math.random() * 20;
    const usedMemory = Math.round(totalMemory * usagePercent / 100);
    res.json({
      success: true,
      data: {
        totalMemory,
        usedMemory,
        freeMemory: totalMemory - usedMemory,
        usagePercent: parseFloat(usagePercent.toFixed(2)),
        swapTotal: 8 * 1024 * 1024 * 1024,
        swapUsed: Math.round(2 * 1024 * 1024 * 1024 * Math.random()),
        timestamp: new Date(),
        isMock: true,
      },
    });
  }
});

// GET /api/memory/processes  – per-process memory list
router.get('/processes', async (req, res) => {
  try {
    const [mem, procs] = await Promise.all([si.mem(), si.processes()]);
    const list = procs.list
      .map(p => ({
        pid:            p.pid,
        name:           p.name,
        memoryUsage:    Math.round((p.memRss || 0) * 1024),
        memoryPercent:  parseFloat(((p.mem || 0)).toFixed(2)),
        status:         p.state || 'running',
        isHighUsage:    (p.mem || 0) >= 5,
      }))
      .sort((a, b) => b.memoryUsage - a.memoryUsage)
      .slice(0, 20);

    res.json({ success: true, data: list });
  } catch (err) {
    // fallback
    const totalMemory = 16 * 1024 * 1024 * 1024;
    res.json({
      success: true,
      data: generateMockProcesses(totalMemory),
      isMock: true,
    });
  }
});

// GET /api/memory/history?period=day|week
router.get('/history', async (req, res) => {
  const period = req.query.period || 'day';
  const hours  = period === 'week' ? 168 : 24;

  if (dbAvailable()) {
    try {
      const since = new Date(Date.now() - hours * 3600 * 1000);
      const records = await MemorySnapshot.find({ timestamp: { $gte: since } })
        .sort({ timestamp: 1 })
        .select('usagePercent usedMemory totalMemory timestamp -_id');
      if (records.length > 0) return res.json({ success: true, data: records });
    } catch (_) {}
  }

  // generate synthetic history
  const points = hours === 24 ? 48 : 84;
  const now = Date.now();
  const step = (hours * 3600 * 1000) / points;
  const data = Array.from({ length: points }, (_, i) => {
    const t = new Date(now - (points - 1 - i) * step);
    const base = 60 + 15 * Math.sin((i / points) * Math.PI * 2);
    const noise = (Math.random() - 0.5) * 8;
    const pct = Math.min(95, Math.max(20, base + noise));
    return {
      timestamp: t,
      usagePercent: parseFloat(pct.toFixed(2)),
      usedMemory:   Math.round(16 * 1024 * 1024 * 1024 * pct / 100),
      totalMemory:  16 * 1024 * 1024 * 1024,
    };
  });
  res.json({ success: true, data, isMock: true });
});

module.exports = router;
