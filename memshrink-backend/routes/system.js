const express = require('express');
const si = require('systeminformation');

const router = express.Router();

// GET /api/system/info
router.get('/info', async (req, res) => {
  try {
    const [cpu, os, mem, battery, time] = await Promise.all([
      si.cpu(),
      si.osInfo(),
      si.mem(),
      si.battery().catch(() => ({ hasBattery: false })),
      si.time(),
    ]);

    res.json({
      success: true,
      data: {
        cpu: {
          manufacturer: cpu.manufacturer,
          brand:        cpu.brand,
          speed:        cpu.speed,
          cores:        cpu.cores,
          physicalCores: cpu.physicalCores,
        },
        os: {
          platform:  os.platform,
          distro:    os.distro,
          release:   os.release,
          arch:      os.arch,
          hostname:  os.hostname,
        },
        memory: {
          total:    mem.total,
          used:     mem.active,
          free:     mem.available,
          percent:  parseFloat(((mem.active / mem.total) * 100).toFixed(2)),
        },
        battery: {
          hasBattery:  battery.hasBattery,
          isCharging:  battery.isCharging,
          percent:     battery.percent,
        },
        uptime: time.uptime,
        timezone: time.timezone,
      },
    });
  } catch (err) {
    res.json({
      success: true,
      data: {
        cpu:    { manufacturer: 'Intel', brand: 'Core i7-12700H', speed: 2.3, cores: 20, physicalCores: 14 },
        os:     { platform: 'Windows', distro: 'Windows 11', release: '23H2', arch: 'x64', hostname: 'DESKTOP-USER' },
        memory: { total: 16 * 1024**3, used: 9 * 1024**3, free: 7 * 1024**3, percent: 56.25 },
        battery:{ hasBattery: true, isCharging: true, percent: 80 },
        uptime: 86400,
        timezone: 'IST',
      },
      isMock: true,
    });
  }
});

module.exports = router;
