import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a UTC ISO string to a datetime-local input value in local timezone.
 * e.g. "2026-03-18T08:30:00.000Z" → "2026-03-18T10:30" (if browser is in Israel, UTC+2)
 */
export function utcToDatetimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert a datetime-local input value (local timezone) to a UTC ISO string.
 * e.g. "2026-03-18T10:30" → "2026-03-18T08:30:00.000Z" (if browser is in Israel, UTC+2)
 */
export function datetimeLocalToUTC(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}
