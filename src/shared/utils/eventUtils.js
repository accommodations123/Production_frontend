// Event date/expiration utilities.
// Rules: prefer end_date+end_time, fall back to start_date+start_time,
// treat date-only as end-of-day, event expired when now > resolved end.

// Helpers
// Build a Date from a date string and optional time string (null if unparseable).
const buildDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null

    try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return null

        if (timeStr) {
            const parts = timeStr.split(':').map(Number)
            const [h = 23, m = 59, s = 59] = parts
            if (!isNaN(h) && !isNaN(m)) {
                date.setHours(h, m, isNaN(s) ? 59 : s, 0)
            }
        } else {
            // No time → assume end of the day
            date.setHours(23, 59, 59, 999)
        }

        return date
    } catch {
        return null
    }
}

// Public API

// Resolve the effective end-time of an event from either API shape.
export const getEventEndDate = (event) => {
    if (!event) return null

    // Prefer explicit end date/time
    const endDate = event.end_date ?? event.endDate
    const endTime = event.end_time ?? event.endTime

    const resolved = buildDateTime(endDate, endTime)
    if (resolved) return resolved

    // Fall back to start date
    const startDate = event.start_date ?? event.date
    const startTime = event.start_time ?? event.time

    return buildDateTime(startDate, startTime)
}

export const isEventExpired = (event) => {
    const end = getEventEndDate(event)
    if (!end) return false // can't determine → treat as active
    return Date.now() > end.getTime()
}

export const partitionEvents = (events = []) => {
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

export const filterUpcomingEvents = (events = []) =>
    events.filter((e) => !isEventExpired(e))

export const getEventStatus = (event) => {
    if (isEventExpired(event)) return "expired"

    // Check if happening now: start_date/time ≤ now ≤ end
    const startDate = event.start_date ?? event.date
    const startTime = event.start_time ?? event.time
    const start = buildDateTime(startDate, startTime)

    if (start && Date.now() >= start.getTime()) return "happening-now"

    return "upcoming"
}
