"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, Phone, MessageSquare, Send, Clock, Car, AlertCircle } from "lucide-react"
import { realtimeManager, type RideUpdate, type RideMessage, type DriverLocationUpdate } from "@/lib/supabase-realtime"
import { useSession } from "@/hooks/use-session"
import { cn } from "@/lib/utils"

interface RealTimeRideTrackerProps {
  rideId: string
  userRole: "driver" | "passenger"
  onRideUpdate?: (ride: RideUpdate) => void
}

export function RealTimeRideTracker({ rideId, userRole, onRideUpdate }: RealTimeRideTrackerProps) {
  const { session } = useSession()
  const [ride, setRide] = useState<RideUpdate | null>(null)
  const [messages, setMessages] = useState<RideMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [driverLocation, setDriverLocation] = useState<DriverLocationUpdate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load initial ride data and messages
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)

        // Load ride data
        const rideResponse = await fetch(`/api/rides/${rideId}`)
        if (rideResponse.ok) {
          const rideData = await rideResponse.json()
          if (rideData.success) {
            setRide(rideData.ride)
          }
        }

        // Load messages
        const messagesResponse = await fetch(`/api/rides/${rideId}/messages`)
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          if (messagesData.success) {
            setMessages(messagesData.messages)
          }
        }
      } catch (err) {
        console.error("Error loading initial data:", err)
        setError("Failed to load ride data")
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [rideId])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!session) return

    // Subscribe to ride updates
    const rideChannel = realtimeManager.subscribeToRide(rideId, (update) => {
      setRide(update)
      onRideUpdate?.(update)
    })

    // Subscribe to messages
    const messagesChannel = realtimeManager.subscribeToRideMessages(rideId, (message) => {
      setMessages((prev) => [...prev, message])
    })

    // Subscribe to driver location if user is passenger and ride has driver
    let locationChannel: any = null
    if (userRole === "passenger" && ride?.driver_id) {
      locationChannel = realtimeManager.subscribeToDriverLocation(ride.driver_id, (location) => {
        setDriverLocation(location)
      })
    }

    return () => {
      realtimeManager.unsubscribe(`ride:${rideId}`)
      realtimeManager.unsubscribe(`ride_messages:${rideId}`)
      if (locationChannel && ride?.driver_id) {
        realtimeManager.unsubscribe(`driver_location:${ride.driver_id}`)
      }
    }
  }, [rideId, session, userRole, ride?.driver_id, onRideUpdate])

  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return

    try {
      const result = await realtimeManager.sendMessage(rideId, session.id, userRole, newMessage.trim())

      if (result.success) {
        setNewMessage("")
      } else {
        console.error("Failed to send message:", result.error)
      }
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  const updateRideStatus = async (newStatus: string) => {
    try {
      const result = await realtimeManager.updateRideStatus(rideId, newStatus)
      if (!result.success) {
        console.error("Failed to update ride status:", result.error)
      }
    } catch (err) {
      console.error("Error updating ride status:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "driver_arrived":
        return "bg-purple-100 text-purple-800"
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

  const getActionButtons = () => {
    if (!ride || userRole !== "driver") return null

    switch (ride.status) {
      case "accepted":
        return (
          <Button onClick={() => updateRideStatus("driver_arrived")} className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            I've Arrived
          </Button>
        )
      case "driver_arrived":
        return (
          <Button onClick={() => updateRideStatus("in_progress")} className="w-full">
            <Car className="h-4 w-4 mr-2" />
            Start Trip
          </Button>
        )
      case "in_progress":
        return (
          <Button onClick={() => updateRideStatus("completed")} className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            Complete Trip
          </Button>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Loading ride details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!ride) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Ride not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ride Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ride #{ride.id.slice(-8)}</span>
            <Badge className={getStatusColor(ride.status)}>{ride.status.replace("_", " ").toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Route Information */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Pickup</p>
                <p className="text-sm text-gray-600">{ride.pickup_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium">Destination</p>
                <p className="text-sm text-gray-600">{ride.destination_address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Fare Information */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Fare Amount</span>
            <span className="text-lg font-bold">${ride.fare_amount}</span>
          </div>

          {/* Driver Location (for passengers) */}
          {userRole === "passenger" && driverLocation && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Driver Location</span>
              </div>
              <p className="text-xs text-gray-600">
                Last updated: {new Date(driverLocation.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {getActionButtons()}

          {/* Contact Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Navigation className="h-4 w-4 mr-2" />
              Navigate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-2", message.sender_id === session?.id ? "justify-end" : "justify-start")}
                >
                  {message.sender_id !== session?.id && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {message.sender_type === "driver" ? "D" : "P"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-xs px-3 py-2 rounded-lg text-sm",
                      message.sender_id === session?.id ? "bg-blue-600 text-white" : "bg-white border",
                    )}
                  >
                    <p>{message.message}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.sender_id === session?.id ? "text-blue-100" : "text-gray-500",
                      )}
                    >
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {message.sender_id === session?.id && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{userRole === "driver" ? "D" : "P"}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
