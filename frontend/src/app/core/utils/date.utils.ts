/**
 * Parses a date string (YYYY-MM-DD HH:mm:ss or ISO) strictly as local time.
 * This avoids the browser's default behavior of interpreting strings with 'T' as UTC.
 */
export function parseLocal(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return new Date();

  // Replace T with space and split to get parts (handling potential milliseconds/timezones by taking only the main part)
  const cleaned = dateStr.replace('T', ' ').split('.')[0];
  const [datePart, timePart] = cleaned.split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  
  if (timePart) {
    const [hh, mm, ss] = timePart.split(':').map(Number);
    // new Date(y, m-1, d, h, m, s) is always local time
    return new Date(y, m - 1, d, hh, mm, ss || 0);
  }
  
  return new Date(y, m - 1, d, 0, 0, 0);
}
