import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, MapPin } from "lucide-react"

export const EventCard = React.memo(function EventCard({ event }) {
    return (
        <Link to={`/events/${event.id}`}>
            <motion.div
                whileHover={{ y: -5 }}
                className="w-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
                <div className="h-40 overflow-hidden relative">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-900 shadow-sm">
                        {event.price}
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>
                    <div className="space-y-1.5 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-accent" />
                            {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-accent" />
                            {event.location}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
})
