/**
 * Event date/expiration utilities.
 *
 * Centralises all "is this event over?" logic so every component
 * uses the same source of truth.
 *
 * Rules:
 *   1. Use `end_date` + `end_time` when available.
 *   2. Fall back to `start_date`/`date` + `start_time`/`time`.
 *   3. If only a date exists (no time), assume end-of-day (23:59:59).
 *   4. An event is "expired" when `now > resolvedEndDateTime`.
 */

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Build a Date from a date string and an optional time string.
 * Returns `null` when `dateStr` is falsy or unparseable.
 */
const buildDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null

    try {
        if (dateStr instanceof Date) {
            return isNaN(dateStr.getTime()) ? null : dateStr
        }

        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return null

        if (timeStr) {
            const cleanTime = typeof timeStr === 'string' ? timeStr.replace(/[^\d:]/g, '') : ''
            const parts = cleanTime.split(':').map(Number)
            const [h = 23, m = 59, s = 59] = parts
            if (!isNaN(h) && !isNaN(m)) {
                date.setHours(h, m, isNaN(s) ? 59 : s, 0)
            }
        } else if (typeof dateStr === 'string' && !dateStr.includes('T') && !dateStr.includes(':')) {
            // Only a date string with no time component (e.g., "2026-08-20") → assume end of the day
            date.setHours(23, 59, 59, 999)
        }

        return date
    } catch {
        return null
    }
}

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

/**
 * Resolve the effective end-time of an event.
 * Accepts both raw API shapes and the UI-mapped shapes used in
 * components (camelCase vs snake_case).
 *
 * @param {object} event
 * @returns {Date|null}
 */
export const getEventEndDate = (event) => {
    if (!event) return null

    // Prefer explicit end date/time
    const endDate = event.end_date ?? event.endDate
    const endTime = event.end_time ?? event.endTime

    const resolved = buildDateTime(endDate, endTime)
    if (resolved) return resolved

    // Fall back to start date
    const startDate = event.start_date ?? event.date ?? event.event_date
    const startTime = event.start_time ?? event.time

    return buildDateTime(startDate, startTime)
}

/**
 * Is the event's period already over?
 *
 * @param {object} event
 * @returns {boolean}  `true` when the event has ended.
 */
export const isEventExpired = (event) => {
    const end = getEventEndDate(event)
    if (!end) return false // can't determine → treat as active
    return Date.now() > end.getTime()
}

/**
 * Partition an array of events into `{ upcoming, expired }`.
 *
 * @param {object[]} events
 * @returns {{ upcoming: object[], expired: object[] }}
 */
export const partitionEvents = (events = []) => {
    if (!Array.isArray(events)) return { upcoming: [], expired: [] }
    const upcoming = []
    const expired = []

    for (const event of events) {
        if (isEventExpired(event)) {
            expired.push(event)
        } else {
            upcoming.push(event)
        }
    }

    return { upcoming, expired }
}

/**
 * Filter an array to only upcoming (non-expired) events.
 *
 * @param {object[]} events
 * @returns {object[]}
 */
export const filterUpcomingEvents = (events = []) => {
    if (!Array.isArray(events)) return []
    return events.filter((e) => !isEventExpired(e))
}

/**
 * Human-readable status label for an event.
 *
 * @param {object} event
 * @returns {"expired" | "happening-now" | "upcoming"}
 */
export const getEventStatus = (event) => {
    if (isEventExpired(event)) return "expired"

    // Check if happening now: start_date/time ≤ now ≤ end
    const startDate = event.start_date ?? event.date ?? event.event_date
    const startTime = event.start_time ?? event.time
    const start = buildDateTime(startDate, startTime)

    if (start && Date.now() >= start.getTime()) return "happening-now"

    return "upcoming"
}
