/** Format bytes into human-readable string */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/** Get colour class based on usage percent */
export function getUsageColor(pct, variant = 'text') {
  const prefix = variant === 'bg' ? 'bg' : variant === 'border' ? 'border' : 'text';
  if (pct >= 90) return `${prefix}-red-500`;
  if (pct >= 75) return `${prefix}-orange-500`;
  if (pct >= 60) return `${prefix}-yellow-500`;
  return `${prefix}-green-500`;
}

/** Get hex colour based on usage percent */
export function getUsageHex(pct) {
  if (pct >= 90) return '#ef4444';
  if (pct >= 75) return '#f97316';
  if (pct >= 60) return '#f59e0b';
  return '#22c55e';
}

/** Format duration (seconds) as "Xd Xh Xm" */
export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return [d && `${d}d`, h && `${h}h`, `${m}m`].filter(Boolean).join(' ');
}

/** Short timestamp formatter */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
export function formatDate(date) {
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
export function formatDateTime(date) {
  return new Date(date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
