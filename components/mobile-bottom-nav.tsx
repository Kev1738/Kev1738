"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Home, Car, MapPin, Clock, User, Settings, History, DollarSign, Users, BarChart3 } from "lucide-react"

interface MobileBottomNavProps {
  userRole: "passenger" | "driver" | "admin"
}

export function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications?unread_only=true")
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setUnreadCount(result.data.notifications.length)
          }
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
      }
    }

    fetchUnreadCount()
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const getNavItems = () => {
    switch (userRole) {
      case "passenger":
        return [
          {
            href: "/passenger/dashboard",
            icon: Home,
            label: "Home",
            badge: null,
          },
          {
            href: "/passenger/book-ride",
            icon: Car,
            label: "Book",
            badge: null,
          },
          {
            href: "/passenger/trips",
            icon: Clock,
            label: "Trips",
            badge: null,
          },
          {
            href: "/passenger/history",
            icon: History,
            label: "History",
            badge: null,
          },
          {
            href: "/passenger/profile",
            icon: User,
            label: "Profile",
            badge: unreadCount > 0 ? unreadCount : null,
          },
        ]

      case "driver":
        return [
          {
            href: "/driver/dashboard",
            icon: Home,
            label: "Home",
            badge: null,
          },
          {
            href: "/driver/rides",
            icon: MapPin,
            label: "Rides",
            badge: null,
          },
          {
            href: "/driver/earnings",
            icon: DollarSign,
            label: "Earnings",
            badge: null,
          },
          {
            href: "/driver/history",
            icon: History,
            label: "History",
            badge: null,
          },
          {
            href: "/driver/profile",
            icon: User,
            label: "Profile",
            badge: unreadCount > 0 ? unreadCount : null,
          },
        ]

      case "admin":
        return [
          {
            href: "/admin/dashboard",
            icon: Home,
            label: "Dashboard",
            badge: null,
          },
          {
            href: "/admin/users",
            icon: Users,
            label: "Users",
            badge: null,
          },
          {
            href: "/admin/rides",
            icon: Car,
            label: "Rides",
            badge: null,
          },
          {
            href: "/admin/analytics",
            icon: BarChart3,
            label: "Analytics",
            badge: null,
          },
          {
            href: "/admin/settings",
            icon: Settings,
            label: "Settings",
            badge: unreadCount > 0 ? unreadCount : null,
          },
        ]

      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 text-xs font-medium transition-colors relative",
                "min-h-[60px] rounded-lg", // Ensure minimum touch target
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100",
              )}
            >
              <div className="relative">
                <Icon className={cn("h-6 w-6 mb-1", isActive ? "text-blue-600" : "text-gray-500")} />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn("truncate max-w-full", isActive ? "text-blue-600" : "text-gray-500")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
