"use client"
import React from "react"
import { Bell, Star, Info, Home, CheckCircle, Trash2, Clock } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { markAllAsRead, clearNotifications, markAsRead } from "@/store/slices/notificationSlice"
import { useTimeAgo } from "../../hooks/useTimeAgo"

const getIcon = (notif) => {
  switch (notif.entityType) {
    case "EVENT":
      return { icon: Star, color: "text-amber-500", bg: "bg-amber-50" }
    case "PROPERTY":
      return { icon: Home, color: "text-blue-500", bg: "bg-blue-50" }
    case "HOST":
      return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" }
    default:
      return { icon: Info, color: "text-rose-500", bg: "bg-rose-50" }
  }
}

const NotificationItem = ({ notif, onRead }) => {
  const { icon: Icon, color, bg } = getIcon(notif)
  const dateSource = notif.createdAt || notif.created_at
  const timeAgo = useTimeAgo(dateSource)

  return (
    <div
      onClick={onRead}
      className={`flex gap-4 p-6 rounded-3xl border cursor-pointer ${
        notif.read ? "bg-white" : "bg-blue-50/30"
      }`}
    >
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-[#00142E]">
            {notif.entityType
              ? `${notif.entityType.charAt(0)}${notif.entityType.slice(1).toLowerCase()} Approved`
              : "New Notification"}
          </h4>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </div>
        </div>

        <p className="text-sm text-[#00142E]/70">{notif.message}</p>
      </div>

      {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
    </div>
  )
}
export const Notifications = () => {
  const dispatch = useDispatch()
  const notifications = useSelector(state => state.notifications.items)
  const unreadCount = useSelector(state => state.notifications.unreadCount)

  return (
    <div className="p-4 md:p-12 max-w-4xl mx-auto">
      <div className="flex justify-between mb-8 border-b pb-6">
        <div>
          <h3 className="text-2xl font-bold">Notifications</h3>
          <p className="text-sm text-gray-500">Stay updated.</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={() => dispatch(clearNotifications())}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-4" />
          No notifications yet
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              onRead={() => dispatch(markAsRead(notif.id))}
            />
          ))}
        </div>
      )}

      {unreadCount > 0 && (
        <div className="mt-10 text-center">
          <button
            onClick={() => dispatch(markAllAsRead())}
            className="text-sm font-bold text-accent hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  )
}
