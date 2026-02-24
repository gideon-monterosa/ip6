/**
 * Week utility functions for ISO 8601 week calculations.
 * Week starts on Monday 00:00:00 and ends on Sunday 23:59:59.
 */

/** Returns the Monday 00:00 of the ISO week that contains `date`. */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns the Sunday 23:59:59.999 of the same ISO week given a Monday. */
export function getSunday(monday: Date): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Checks whether two dates fall in the same ISO week (same Monday). */
export function isSameWeek(a: Date, b: Date): boolean {
  const ma = getMonday(a);
  const mb = getMonday(b);
  return (
    ma.getFullYear() === mb.getFullYear() &&
    ma.getMonth() === mb.getMonth() &&
    ma.getDate() === mb.getDate()
  );
}

/** Returns true when a given date falls within [weekStart, weekEnd]. */
export function isDateInWeek(
  date: Date | string,
  weekStart: Date,
  weekEnd: Date,
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d >= weekStart && d <= weekEnd;
}

/** Formats a date as "Mon, Feb 2" (short weekday, short month, day). */
function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Formats a week range for display: "Mon, Feb 2 – Sun, Feb 8, 2026". */
export function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const start = formatShortDate(monday);
  const end = sunday.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${start} – ${end}`;
}

/**
 * Returns an array of 7 short day labels for the given week.
 * E.g. ["Mon 2/2", "Tue 2/3", ...]
 */
export function getWeekDayLabels(monday: Date): string[] {
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const month = d.getMonth() + 1;
    const day = d.getDate();
    labels.push(`${weekday} ${month}/${day}`);
  }
  return labels;
}

/**
 * Returns the ISO date string (YYYY-MM-DD) for a Date.
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
