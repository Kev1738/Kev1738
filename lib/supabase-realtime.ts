import { supabase } from "@/lib/database"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface RideUpdate {
  id: string
  status: string
  driver_id?: string
  passenger_id: string
  pickup_address: string
  destination_address: string
  fare_amount: number
  driver_location?: {
    latitude: number
    longitude: number
    heading?: number
  }
}

export interface DriverLocationUpdate {
  driver_id: string
  latitude: number
  longitude: number
  heading?: number
  timestamp: string
}

export interface RideMessage {
  id: string
  ride_id: string
  sender_id: string
  sender_type: "driver" | "passenger"
  message: string
  message_type: "text" | "location" | "system"
  created_at: string
}

class SupabaseRealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()

  // Subscribe to ride updates
  subscribeToRide(rideId: string, callback: (update: RideUpdate) => void) {
    const channelName = `ride:${rideId}`

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides",
          filter: `id=eq.${rideId}`,
        },
        (payload) => {
          console.log("Ride update:", payload)
          if (payload.new) {
            callback(payload.new as RideUpdate)
          }
        },
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Subscribe to driver location updates
  subscribeToDriverLocation(driverId: string, callback: (location: DriverLocationUpdate) => void) {
    const channelName = `driver_location:${driverId}`

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "driver_profiles",
          filter: `user_id=eq.${driverId}`,
        },
        (payload) => {
          console.log("Driver location update:", payload)
          if (payload.new && payload.new.current_location) {
            const location = payload.new.current_location as any
            callback({
              driver_id: driverId,
              latitude: location.latitude,
              longitude: location.longitude,
              heading: location.heading,
              timestamp: new Date().toISOString(),
            })
          }
        },
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Subscribe to ride messages
  subscribeToRideMessages(rideId: string, callback: (message: RideMessage) => void) {
    const channelName = `ride_messages:${rideId}`

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ride_messages",
          filter: `ride_id=eq.${rideId}`,
        },
        (payload) => {
          console.log("New message:", payload)
          if (payload.new) {
            callback(payload.new as RideMessage)
          }
        },
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Send a message
  async sendMessage(
    rideId: string,
    senderId: string,
    senderType: "driver" | "passenger",
    message: string,
    messageType: "text" | "location" | "system" = "text",
  ) {
    try {
      const { data, error } = await supabase
        .from("ride_messages")
        .insert({
          ride_id: rideId,
          sender_id: senderId,
          sender_type: senderType,
          message,
          message_type: messageType,
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error("Error sending message:", error)
      return { success: false, error }
    }
  }

  // Update driver location
  async updateDriverLocation(driverId: string, latitude: number, longitude: number, heading?: number) {
    try {
      const { error } = await supabase
        .from("driver_profiles")
        .update({
          current_location: {
            latitude,
            longitude,
            heading,
            updated_at: new Date().toISOString(),
          },
        })
        .eq("user_id", driverId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error("Error updating driver location:", error)
      return { success: false, error }
    }
  }

  // Update ride status
  async updateRideStatus(rideId: string, status: string, additionalData?: any) {
    try {
      const updateData: any = { status }
      if (additionalData) {
        Object.assign(updateData, additionalData)
      }

      const { error } = await supabase.from("rides").update(updateData).eq("id", rideId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error("Error updating ride status:", error)
      return { success: false, error }
    }
  }

  // Unsubscribe from a channel
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

export const realtimeManager = new SupabaseRealtimeManager()
