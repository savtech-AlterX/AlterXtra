export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));

  const units: [number, string][] = [
    [60, 's'],
    [60, 'm'],
    [24, 'h'],
    [7, 'd'],
    [4.345, 'w'],
    [12, 'mo'],
    [Number.POSITIVE_INFINITY, 'y'],
  ];

  let value = seconds;
  for (const [divisor, label] of units) {
    if (value < divisor) return `${Math.max(1, Math.floor(value))}${label}`;
    value = value / divisor;
  }
  return `${Math.floor(value)}y`;
}
