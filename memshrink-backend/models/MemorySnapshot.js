const mongoose = require('mongoose');

const memorySnapshotSchema = new mongoose.Schema(
  {
    totalMemory: { type: Number, required: true },   // bytes
    usedMemory:  { type: Number, required: true },
    freeMemory:  { type: Number, required: true },
    usagePercent:{ type: Number, required: true },
    swapTotal:   { type: Number, default: 0 },
    swapUsed:    { type: Number, default: 0 },
    timestamp:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MemorySnapshot', memorySnapshotSchema);
