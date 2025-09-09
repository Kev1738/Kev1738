"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  MapPin,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Navigation,
  CreditCard,
  History,
  Settings,
} from "lucide-react"

interface QuickAction {
  id: string
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  badge?: string | number
  onClick: () => void
}

interface MobileQuickActionsProps {
  userRole: "passenger" | "driver" | "admin"
  stats?: {
    activeRides?: number
    totalEarnings?: number
    rating?: number
    completedRides?: number
    totalUsers?: number
    totalRevenue?: number
  }
  onAction: (actionId: string) => void
}

export function MobileQuickActions({ userRole, stats, onAction }: MobileQuickActionsProps) {
  const getQuickActions = (): QuickAction[] => {
    switch (userRole) {
      case "passenger":
        return [
          {
            id: "book_ride",
            title: "Book a Ride",
            subtitle: "Find nearby drivers",
            icon: Car,
            color: "bg-blue-500",
            onClick: () => onAction("book_ride"),
          },
          {
            id: "track_ride",
            title: "Track Ride",
            subtitle: "View active trip",
            icon: MapPin,
            color: "bg-green-500",
            badge: stats?.activeRides,
            onClick: () => onAction("track_ride"),
          },
          {
            id: "payment",
            title: "Payment",
            subtitle: "Manage cards",
            icon: CreditCard,
            color: "bg-purple-500",
            onClick: () => onAction("payment"),
          },
          {
            id: "history",
            title: "Trip History",
            subtitle: `${stats?.completedRides || 0} trips`,
            icon: History,
            color: "bg-gray-500",
            onClick: () => onAction("history"),
          },
        ]

      case "driver":
        return [
          {
            id: "toggle_status",
            title: "Go Online",
            subtitle: "Start accepting rides",
            icon: Navigation,
            color: "bg-green-500",
            onClick: () => onAction("toggle_status"),
          },
          {
            id: "earnings",
            title: "Earnings",
            subtitle: `$${stats?.totalEarnings?.toFixed(2) || "0.00"}`,
            icon: DollarSign,
            color: "bg-blue-500",
            onClick: () => onAction("earnings"),
          },
          {
            id: "rating",
            title: "Rating",
            subtitle: `${stats?.rating?.toFixed(1) || "5.0"} stars`,
            icon: Star,
            color: "bg-yellow-500",
            onClick: () => onAction("rating"),
          },
          {
            id: "rides",
            title: "Ride Requests",
            subtitle: "View available rides",
            icon: Car,
            color: "bg-purple-500",
            badge: stats?.activeRides,
            onClick: () => onAction("rides"),
          },
        ]

      case "admin":
        return [
          {
            id: "users",
            title: "Users",
            subtitle: `${stats?.totalUsers || 0} total`,
            icon: Users,
            color: "bg-blue-500",
            onClick: () => onAction("users"),
          },
          {
            id: "revenue",
            title: "Revenue",
            subtitle: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
            icon: TrendingUp,
            color: "bg-green-500",
            onClick: () => onAction("revenue"),
          },
          {
            id: "rides_admin",
            title: "Rides",
            subtitle: "Manage all rides",
            icon: Car,
            color: "bg-purple-500",
            onClick: () => onAction("rides_admin"),
          },
          {
            id: "settings",
            title: "Settings",
            subtitle: "System config",
            icon: Settings,
            color: "bg-gray-500",
            onClick: () => onAction("settings"),
          },
        ]

      default:
        return []
    }
  }

  const quickActions = getQuickActions()

  return (
    <div className="grid grid-cols-2 gap-3">
      {quickActions.map((action) => {
        const Icon = action.icon
        return (
          <Card key={action.id} className="overflow-hidden">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={action.onClick}
                className="w-full h-full p-4 flex flex-col items-start justify-start text-left hover:bg-gray-50 relative"
              >
                {/* Badge */}
                {action.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {action.badge > 99 ? "99+" : action.badge}
                  </Badge>
                )}

                {/* Icon */}
                <div className={`${action.color} p-2 rounded-lg mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                  {action.subtitle && <p className="text-xs text-gray-500 line-clamp-1">{action.subtitle}</p>}
                </div>
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
