import React, { memo, useMemo } from "react"
import { Clock } from "lucide-react"

export const ScheduleTab = memo(({ event, visibleSections }) => {
    const scheduleItems = useMemo(() => {
        if (!event?.schedule || !Array.isArray(event.schedule)) return []
        return event.schedule
    }, [event])

    if (scheduleItems.length === 0) {
        return <div id="schedule" className="text-center py-12 text-gray-500">No schedule published yet.</div>
    }

    return (
        <div id="schedule" className="space-y-6 md:space-y-8">
            <section
                className={`bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl p-6 md:p-8 animate-section transition-all duration-700 ${visibleSections.has('schedule') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                        <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Event Schedule</h2>
                        <p className="text-gray-500 text-sm mt-1">Plan your day with our detailed timeline</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {scheduleItems.map((item, idx) => (
                        <div
                            key={idx}
                            className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100 ${idx !== 0 ? 'mt-6' : ''}`}
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="text-center">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: item.color || 'var(--accent)' }}
                                    >
                                        <span className="text-xs font-bold">{item.time}</span>
                                        <span className="text-2xl mt-1">
                                            {item.icon === 'coffee' ? '☕' :
                                                item.icon === 'mic' ? '🎤' :
                                                    item.icon === 'rocket' ? '🚀' : '📚'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{item.duration}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
})
ScheduleTab.displayName = "ScheduleTab"
