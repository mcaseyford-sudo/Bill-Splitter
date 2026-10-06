// All money in this app is integer cents. These helpers convert to and from
// what people type and see, without ever doing floating-point dollar math.

export function formatCents(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString('en-US');
  const rest = String(abs % 100).padStart(2, '0');
  return `${sign}$${dollars}.${rest}`;
}

// 1234 -> "12.34", null -> ""
export function centsToInput(cents) {
  if (cents == null) return '';
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

// Reads a non-negative number with up to 2 decimals, scaled by 100.
// "12.5" -> 1250, "$1,000" -> 100000, "" -> 0, "abc" -> null (invalid).
function parseHundredths(text) {
  const cleaned = String(text).replace(/[$,%\s]/g, '');
  if (cleaned === '') return 0;
  const match = cleaned.match(/^(\d*)(?:\.(\d{0,2}))?$/);
  if (!match || (match[1] === '' && !match[2])) return null;
  return Number(match[1] || '0') * 100 + Number((match[2] || '').padEnd(2, '0'));
}

// Dollars typed by a person -> cents.
export const parseDollarsToCents = parseHundredths;

// Percent typed by a person -> basis points (18.5% -> 1850).
export const parsePercentToBasisPoints = parseHundredths;

// Percentage of an amount, rounded to the nearest cent.
export function percentOf(cents, basisPoints) {
  return Math.round((cents * basisPoints) / 10000);
}
