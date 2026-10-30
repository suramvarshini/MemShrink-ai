const express = require('express');
const Alert = require('../models/Alert');

const router = express.Router();
const dbAvailable = () => require('mongoose').connection.readyState === 1;

// In-memory fallback
const inMemoryAlerts = [];

// Helper: create an alert (DB or memory)
async function createAlert(data) {
  if (dbAvailable()) {
    return Alert.create(data);
  }
  const alert = { ...data, _id: Date.now().toString(), createdAt: new Date() };
  inMemoryAlerts.unshift(alert);
  if (inMemoryAlerts.length > 200) inMemoryAlerts.pop();
  return alert;
}

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    if (dbAvailable()) {
      const alerts = await Alert.find().sort({ timestamp: -1 }).limit(50);
      return res.json({ success: true, data: alerts });
    }
    res.json({ success: true, data: inMemoryAlerts.slice(0, 50) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/alerts/check  – called by frontend with current usage %
router.post('/check', async (req, res) => {
  const { usagePercent, settings } = req.body;
  const thresholds = settings || { warning: 75, critical: 90 };
  const newAlerts = [];

  if (usagePercent >= thresholds.critical) {
    newAlerts.push(await createAlert({
      type: 'critical',
      message: `Critical! RAM usage is at ${usagePercent.toFixed(1)}%. Immediate optimization recommended.`,
      threshold: thresholds.critical,
      currentUsage: usagePercent,
    }));
  } else if (usagePercent >= thresholds.warning) {
    newAlerts.push(await createAlert({
      type: 'warning',
      message: `RAM usage is high at ${usagePercent.toFixed(1)}%. Consider freeing some memory.`,
      threshold: thresholds.warning,
      currentUsage: usagePercent,
    }));
  }

  res.json({ success: true, alerts: newAlerts });
});

// PATCH /api/alerts/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    if (dbAvailable()) {
      const alert = await Alert.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
      return res.json({ success: true, data: alert });
    }
    const alert = inMemoryAlerts.find(a => a._id === req.params.id);
    if (alert) alert.read = true;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/alerts/read-all
router.patch('/read-all', async (req, res) => {
  try {
    if (dbAvailable()) {
      await Alert.updateMany({}, { read: true });
      return res.json({ success: true });
    }
    inMemoryAlerts.forEach(a => (a.read = true));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
