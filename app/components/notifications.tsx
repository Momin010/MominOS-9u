"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  Download,
  Wifi,
  Battery,
  Mail,
  Calendar,
  MessageSquare,
  Settings,
  Trash2,
} from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: "info" | "success" | "warning" | "error"
  icon: any
  app: string
  read: boolean
  actions?: { label: string; action: () => void }[]
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "System Update Available",
      message: "MominOS 2.1.1 is ready to install with security improvements",
      time: "2 minutes ago",
      type: "info",
      icon: Download,
      app: "System",
      read: false,
      actions: [
        { label: "Install Now", action: () => console.log("Installing...") },
        { label: "Later", action: () => console.log("Remind later") },
      ],
    },
    {
      id: "2",
      title: "Wi-Fi Connected",
      message: 'Successfully connected to "Home Network"',
      time: "5 minutes ago",
      type: "success",
      icon: Wifi,
      app: "Network",
      read: false,
    },
    {
      id: "3",
      title: "Battery Low",
      message: "Battery level is at 15%. Consider plugging in your device.",
      time: "10 minutes ago",
      type: "warning",
      icon: Battery,
      app: "System",
      read: true,
    },
    {
      id: "4",
      title: "New Email",
      message: "You have 3 new messages in your inbox",
      time: "1 hour ago",
      type: "info",
      icon: Mail,
      app: "Mail",
      read: true,
      actions: [{ label: "Open Mail", action: () => console.log("Opening mail...") }],
    },
    {
      id: "5",
      title: "Meeting Reminder",
      message: "Team standup meeting starts in 15 minutes",
      time: "2 hours ago",
      type: "info",
      icon: Calendar,
      app: "Calendar",
      read: true,
      actions: [
        { label: "Join Meeting", action: () => console.log("Joining...") },
        { label: "Snooze", action: () => console.log("Snoozed") },
      ],
    },
    {
      id: "6",
      title: "Message from John",
      message: "Hey, are you free for a quick call?",
      time: "3 hours ago",
      type: "info",
      icon: MessageSquare,
      app: "Messages",
      read: true,
      actions: [{ label: "Reply", action: () => console.log("Replying...") }],
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400 bg-green-400/20"
      case "warning":
        return "text-yellow-400 bg-yellow-400/20"
      case "error":
        return "text-red-400 bg-red-400/20"
      default:
        return "text-blue-400 bg-blue-400/20"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle
      case "warning":
        return AlertCircle
      case "error":
        return AlertCircle
      default:
        return Info
    }
  }

  return (
    <div className="h-screen bg-gray-950 flex">
      {/* Notification Panel */}
      <div className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Notifications</span>
              {unreadCount > 0 && <Badge className="bg-purple-600 text-white text-xs">{unreadCount}</Badge>}
            </div>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-400 hover:text-white">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-center">No notifications</p>
              <p className="text-sm text-center">You're all caught up!</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => {
                const Icon = notification.icon
                const TypeIcon = getTypeIcon(notification.type)

                return (
                  <Card
                    key={notification.id}
                    className={`mb-2 p-4 cursor-pointer transition-all hover:bg-gray-800 ${
                      notification.read ? "bg-gray-900 border-gray-800" : "bg-gray-800 border-purple-500/30"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* App Icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${notification.read ? "text-gray-300" : "text-white"}`}
                            >
                              {notification.title}
                            </span>
                            {!notification.read && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="w-6 h-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Message */}
                        <p className={`text-sm mb-2 ${notification.read ? "text-gray-400" : "text-gray-300"}`}>
                          {notification.message}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-400">
                              {notification.app}
                            </Badge>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                          <TypeIcon className={`w-3 h-3 ${getTypeColor(notification.type).split(" ")[0]}`} />
                        </div>

                        {/* Actions */}
                        {notification.actions && (
                          <div className="flex gap-2 mt-3">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.action()
                                }}
                                className="text-xs border-gray-700 text-gray-300 hover:bg-gray-700"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview/Settings Panel */}
      <div className="flex-1 bg-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-white mb-2">Notification Settings</h2>
          <p className="mb-6">Configure how and when you receive notifications</p>

          <div className="space-y-4 max-w-md">
            <Card className="bg-gray-900 border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-white font-medium">Do Not Disturb</div>
                  <div className="text-sm text-gray-400">Silence all notifications</div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-700 bg-transparent">
                  Configure
                </Button>
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-white font-medium">App Permissions</div>
                  <div className="text-sm text-gray-400">Control which apps can send notifications</div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-700 bg-transparent">
                  Manage
                </Button>
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-white font-medium">Sound & Vibration</div>
                  <div className="text-sm text-gray-400">Customize notification alerts</div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-700 bg-transparent">
                  Customize
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
