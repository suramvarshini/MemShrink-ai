const mongoose = require('mongoose');

const optimizationLogSchema = new mongoose.Schema(
  {
    action:         { type: String, required: true },
    processName:    { type: String },
    memoryBefore:   { type: Number },   // bytes
    memoryAfter:    { type: Number },
    memorySaved:    { type: Number },
    status:         { type: String, enum: ['success', 'failed', 'skipped'], default: 'success' },
    notes:          { type: String },
    timestamp:      { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OptimizationLog', optimizationLogSchema);
