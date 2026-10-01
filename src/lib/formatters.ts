/**
 * Formats a monetary integer in minor currency units (cents) into a human-readable currency string.
 * FinFlow standard: 1050 cents with 'USD' -> "$10.50"
 */
export function formatCurrency(
  amountCents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const decimalAmount = amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(decimalAmount);
}

/**
 * Formats a numerical percentage value with sign and decimal precision.
 * e.g., 8.42 -> "+8.42%" or -4.5 -> "-4.50%"
 */
export function formatPercentageDelta(value: number, decimalPlaces: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimalPlaces)}%`;
}

/**
 * Formats a rate percentage without +/- sign.
 * e.g., 96.82 -> "96.82%"
 */
export function formatRate(value: number, decimalPlaces: number = 2): string {
  return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Formats an ISO 8601 UTC timestamp into a standardized localized date-time string.
 */
export function formatDateTime(
  isoDateString: string,
  locale: string = 'en-US'
): string {
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date) + ' UTC';
}

/**
 * Formats an ISO 8601 string into a short date (e.g. "Nov 1, 2026").
 */
export function formatDate(
  isoDateString: string,
  locale: string = 'en-US'
): string {
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Formats an ISO 8601 string into a relative time description (e.g. "2 hours ago", "just now").
 */
export function formatRelativeTime(isoDateString: string): string {
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(isoDateString);
}
