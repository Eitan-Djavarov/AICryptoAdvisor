export function displayFormattedValue(value: string): string {
  if (!value || value === '--' || value.includes('NaN')) {
    return '—';
  }

  return value;
}
