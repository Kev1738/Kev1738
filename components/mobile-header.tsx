"use client"

import { Bell, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationPanel } from "@/components/notification-panel"
import { useState } from "react"

interface MobileHeaderProps {
  title: string
  subtitle?: string
  showNotifications?: boolean
  showProfile?: boolean
  onMenuClick?: () => void
}

export function MobileHeader({
  title,
  subtitle,
  showNotifications = true,
  showProfile = true,
  onMenuClick,
}: MobileHeaderProps) {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)

  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <Button variant="ghost" size="sm" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showNotifications && (
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowNotificationPanel(true)}>
                  <Bell className="h-5 w-5" />
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    3
                  </Badge>
                </Button>
              </div>
            )}

            {showProfile && (
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel isOpen={showNotificationPanel} onClose={() => setShowNotificationPanel(false)} />
    </>
  )
}
