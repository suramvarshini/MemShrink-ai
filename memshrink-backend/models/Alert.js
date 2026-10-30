const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type:       { type: String, enum: ['warning', 'critical', 'info'], default: 'warning' },
    message:    { type: String, required: true },
    threshold:  { type: Number },      // % that triggered the alert
    currentUsage:{ type: Number },     // % at alert time
    read:       { type: Boolean, default: false },
    timestamp:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
