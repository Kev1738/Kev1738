"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"
import { Bell, Car, CreditCard, Star, AlertTriangle, Info, CheckCircle, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: any
  is_read: boolean
  created_at: string
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  onUnreadCountChange: (count: number) => void
}

export function NotificationPanel({ isOpen, onClose, onUnreadCountChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadNotifications(1)
    }
  }, [isOpen])

  const loadNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/notifications?page=${pageNum}&limit=20`)
      const result = await response.json()

      if (result.success) {
        const newNotifications = result.data.notifications
        setNotifications((prev) => (append ? [...prev, ...newNotifications] : newNotifications))
        setHasMore(newNotifications.length === 20)
        setPage(pageNum)
        onUnreadCountChange(result.data.unreadCount)
      } else {
        throw new Error(result.error || "Failed to load notifications")
      }
    } catch (err) {
      console.error("Load notifications error:", err)
      setError(err instanceof Error ? err.message : "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)),
        )
        // Update unread count
        const unreadCount = notifications.filter((n) => !n.is_read && n.id !== notificationId).length
        onUnreadCountChange(unreadCount)
      }
    } catch (error) {
      console.error("Mark as read error:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })))
        onUnreadCountChange(0)
      }
    } catch (error) {
      console.error("Mark all as read error:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ride_request":
      case "ride_accepted":
      case "ride_started":
      case "ride_completed":
        return <Car className="h-5 w-5 text-blue-500" />
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-500" />
      case "rating":
        return <Star className="h-5 w-5 text-yellow-500" />
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "ride_request":
      case "ride_accepted":
      case "ride_started":
      case "ride_completed":
        return "border-l-blue-500"
      case "payment":
        return "border-l-green-500"
      case "rating":
        return "border-l-yellow-500"
      case "alert":
        return "border-l-red-500"
      case "success":
        return "border-l-green-500"
      case "info":
      default:
        return "border-l-blue-500"
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, true)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="mt-2 bg-transparent">
              Mark all as read
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {error && (
            <div className="p-4">
              <ErrorAlert message={error} onRetry={() => loadNotifications(1)} />
            </div>
          )}

          {loading && notifications.length === 0 && (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="lg" text="Loading notifications..." />
            </div>
          )}

          {!loading && notifications.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Bell className="h-8 w-8 mb-2" />
              <p>No notifications yet</p>
            </div>
          )}

          {notifications.length > 0 && (
            <ScrollArea className="h-full">
              <div className="space-y-0">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                        !notification.is_read ? "bg-blue-50" : "bg-white"
                      } hover:bg-gray-50 transition-colors cursor-pointer`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{notification.title}</h4>
                            {!notification.is_read && (
                              <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))}

                {hasMore && (
                  <div className="p-4 text-center">
                    <Button variant="outline" onClick={loadMore} disabled={loading}>
                      {loading ? <LoadingSpinner size="sm" /> : "Load more"}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
