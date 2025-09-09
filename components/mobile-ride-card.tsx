"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, Phone, MessageCircle, Navigation, Star, User, Car, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface MobileRideCardProps {
  ride: {
    id: string
    pickup_location: string
    destination: string
    pickup_time: string
    status: string
    fare: number
    distance?: number
    duration?: number
    passenger?: {
      id: string
      full_name: string
      profile_image_url?: string
      rating?: number
    }
    driver?: {
      id: string
      full_name: string
      profile_image_url?: string
      rating?: number
      vehicle_description?: string
    }
  }
  userRole: "passenger" | "driver"
  onAction?: (action: string, rideId: string) => void
  compact?: boolean
}

export function MobileRideCard({ ride, userRole, onAction, compact = false }: MobileRideCardProps) {
  const [expanded, setExpanded] = useState(!compact)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "accepted":
        return "Accepted"
      case "in_progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  const getActionButtons = () => {
    if (!onAction) return null

    switch (ride.status) {
      case "pending":
        if (userRole === "driver") {
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction("decline", ride.id)}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                Decline
              </Button>
              <Button size="sm" onClick={() => onAction("accept", ride.id)} className="flex-1">
                Accept
              </Button>
            </div>
          )
        }
        break

      case "accepted":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("call", ride.id)}
              className="flex items-center gap-1"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("message", ride.id)}
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
            {userRole === "driver" && (
              <Button size="sm" onClick={() => onAction("start", ride.id)} className="flex-1">
                Start Trip
              </Button>
            )}
          </div>
        )

      case "in_progress":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("navigate", ride.id)}
              className="flex items-center gap-1"
            >
              <Navigation className="h-4 w-4" />
              Navigate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("call", ride.id)}
              className="flex items-center gap-1"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            {userRole === "driver" && (
              <Button size="sm" onClick={() => onAction("complete", ride.id)} className="flex-1">
                Complete
              </Button>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const otherUser = userRole === "passenger" ? ride.driver : ride.passenger

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={getStatusColor(ride.status)}>{getStatusText(ride.status)}</Badge>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">${ride.fare.toFixed(2)}</span>
            {compact && (
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="p-1 h-6 w-6">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Route */}
        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-0.5 h-4 bg-gray-300"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{ride.pickup_location}</p>
                <p className="text-xs text-gray-500">Pickup</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{ride.destination}</p>
                <p className="text-xs text-gray-500">Destination</p>
              </div>
            </div>
          </div>
        </div>

        {expanded && (
          <>
            {/* Trip Details */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(ride.pickup_time), { addSuffix: true })}</span>
              </div>
              {ride.distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{ride.distance.toFixed(1)} km</span>
                </div>
              )}
              {ride.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{ride.duration} min</span>
                </div>
              )}
            </div>

            {/* Other User Info */}
            {otherUser && (
              <>
                <Separator className="my-3" />
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.profile_image_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {userRole === "passenger" ? <Car className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{otherUser.full_name}</p>
                    <div className="flex items-center gap-2">
                      {otherUser.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{otherUser.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {userRole === "passenger" && ride.driver?.vehicle_description && (
                        <span className="text-xs text-gray-500">{ride.driver.vehicle_description}</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            {getActionButtons() && (
              <>
                <Separator className="my-3" />
                {getActionButtons()}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
