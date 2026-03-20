const ISRAEL_TZ = 'Asia/Jerusalem';

const israelFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ISRAEL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

/**
 * Get the current date parts in Israel timezone for a given UTC instant.
 */
function getIsraelParts(date: Date) {
    const parts = israelFormatter.formatToParts(date);
    const get = (type: string) => Number(parts.find(p => p.type === type)!.value);
    return {
        year: get('year'),
        month: get('month'),
        day: get('day'),
        hour: get('hour') === 24 ? 0 : get('hour'),
        minute: get('minute'),
        second: get('second'),
    };
}

/**
 * Convert an "HH:mm" string (Israel local time) on a given calendar date
 * to a UTC Date object. Handles DST automatically.
 *
 * @param calendarDate - A Date whose Israel-local date determines the calendar day.
 *                       Typically a date stored with time zeroed out.
 * @param timeStr      - "HH:mm" in Israel local time, e.g. "08:30"
 */
export function israelTimeToUTC(calendarDate: Date, timeStr: string): Date {
    const parts = timeStr.split(':');
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    // Get the Israel-local date for the calendar date
    const israelDate = getIsraelParts(calendarDate);

    // Build an ISO string representing the Israel local time, then use
    // a known offset approach: create a Date at that wall-clock in UTC,
    // then adjust by the difference.
    const wallClockUTC = new Date(Date.UTC(
        israelDate.year, israelDate.month - 1, israelDate.day,
        hours, minutes, 0, 0,
    ));

    // Find what Israel time this UTC instant maps to
    const israelAtWall = getIsraelParts(wallClockUTC);
    const israelMinutes = israelAtWall.hour * 60 + israelAtWall.minute;
    const wallMinutes = hours * 60 + minutes;
    const offsetMinutes = israelMinutes - wallMinutes;

    // Subtract the offset to get the true UTC time
    return new Date(wallClockUTC.getTime() - offsetMinutes * 60_000);
}

/**
 * Check if two dates fall on the same calendar day in Israel timezone.
 */
export function isSameIsraelDay(a: Date, b: Date): boolean {
    const ap = getIsraelParts(a);
    const bp = getIsraelParts(b);
    return ap.year === bp.year && ap.month === bp.month && ap.day === bp.day;
}

/**
 * Get Israel-local hours and minutes for a UTC Date.
 */
export function getIsraelHoursMinutes(date: Date): { hours: number; minutes: number } {
    const p = getIsraelParts(date);
    return { hours: p.hour, minutes: p.minute };
}
