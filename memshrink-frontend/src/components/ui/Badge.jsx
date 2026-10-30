export default function Badge({ label, variant = 'info' }) {
  const styles = {
    info:     'bg-blue-50  text-blue-700  dark:bg-blue-900/30  dark:text-blue-300',
    success:  'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning:  'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    danger:   'bg-red-50   text-red-700   dark:bg-red-900/30   dark:text-red-300',
    neutral:  'bg-slate-100 text-slate-600 dark:bg-slate-700   dark:text-slate-300',
    safe:     'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    moderate: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[variant] || styles.neutral}`}>
      {label}
    </span>
  );
}
