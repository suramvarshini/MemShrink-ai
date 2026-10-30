const express = require('express');
const OptimizationLog = require('../models/OptimizationLog');

const router = express.Router();
const dbAvailable = () => require('mongoose').connection.readyState === 1;

// In-memory fallback store
const inMemoryLogs = [];

// Safe recommendations catalogue
const RECOMMENDATIONS = [
  {
    id: 'clear-cache',
    title: 'Clear System Cache',
    description: 'Release cached memory that is no longer actively needed by the OS.',
    estimatedSavings: '200–500 MB',
    riskLevel: 'safe',
    category: 'cache',
  },
  {
    id: 'compress-standby',
    title: 'Compress Standby Memory',
    description: 'Compress memory pages in the standby list to free physical RAM.',
    estimatedSavings: '300–800 MB',
    riskLevel: 'safe',
    category: 'compression',
  },
  {
    id: 'stop-startup-apps',
    title: 'Disable Unnecessary Startup Apps',
    description: 'Prevent resource-heavy apps from auto-starting with Windows.',
    estimatedSavings: '100–400 MB',
    riskLevel: 'safe',
    category: 'startup',
  },
  {
    id: 'browser-tabs',
    title: 'Close Inactive Browser Tabs',
    description: 'Each browser tab can consume 50–200 MB. Closing unused tabs frees memory immediately.',
    estimatedSavings: '150–600 MB',
    riskLevel: 'safe',
    category: 'browser',
  },
  {
    id: 'virtual-memory',
    title: 'Adjust Virtual Memory Settings',
    description: 'Optimize the Windows page file size for better memory management.',
    estimatedSavings: '100–300 MB',
    riskLevel: 'moderate',
    category: 'system',
  },
  {
    id: 'bg-services',
    title: 'Pause Non-Essential Background Services',
    description: 'Temporarily suspend services like indexing and update checks when RAM is critical.',
    estimatedSavings: '50–200 MB',
    riskLevel: 'moderate',
    category: 'services',
  },
];

// GET /api/optimize/recommendations
router.get('/recommendations', (req, res) => {
  res.json({ success: true, data: RECOMMENDATIONS });
});

// POST /api/optimize/simulate  – simulate a specific optimization
router.post('/simulate', async (req, res) => {
  const { recommendationId, currentMemoryBytes } = req.body;
  const rec = RECOMMENDATIONS.find(r => r.id === recommendationId);
  if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found' });

  // Simulate memory saved (randomised within range)
  const savingsMap = {
    'clear-cache':       [200, 500],
    'compress-standby':  [300, 800],
    'stop-startup-apps': [100, 400],
    'browser-tabs':      [150, 600],
    'virtual-memory':    [100, 300],
    'bg-services':       [50,  200],
  };
  const [min, max] = savingsMap[recommendationId] || [50, 200];
  const savedMB  = min + Math.random() * (max - min);
  const savedBytes = Math.round(savedMB * 1024 * 1024);
  const memAfter   = Math.max(0, (currentMemoryBytes || 0) - savedBytes);

  const logEntry = {
    action:       rec.title,
    processName:  rec.category,
    memoryBefore: currentMemoryBytes || 0,
    memoryAfter:  memAfter,
    memorySaved:  savedBytes,
    status:       'success',
    notes:        `Simulated optimization: ${rec.description}`,
    timestamp:    new Date(),
  };

  if (dbAvailable()) {
    try { await OptimizationLog.create(logEntry); } catch (_) {}
  } else {
    inMemoryLogs.unshift(logEntry);
    if (inMemoryLogs.length > 100) inMemoryLogs.pop();
  }

  res.json({
    success: true,
    data: {
      ...logEntry,
      savedMB: parseFloat(savedMB.toFixed(1)),
      recommendation: rec,
    },
  });
});

// GET /api/optimize/history
router.get('/history', async (req, res) => {
  if (dbAvailable()) {
    try {
      const logs = await OptimizationLog.find()
        .sort({ timestamp: -1 })
        .limit(50);
      return res.json({ success: true, data: logs });
    } catch (_) {}
  }
  res.json({ success: true, data: inMemoryLogs.slice(0, 50) });
});

module.exports = router;
