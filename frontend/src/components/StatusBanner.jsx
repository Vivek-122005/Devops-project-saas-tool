export function StatusBanner({ message, tone = 'info' }) {
  if (!message) {
    return null;
  }

  return <div className={`status-banner status-banner--${tone}`}>{message}</div>;
}
