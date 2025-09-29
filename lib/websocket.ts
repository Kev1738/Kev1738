"use client"

import { io, type Socket } from "socket.io-client"

class WebSocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(userId: string, userRole: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001", {
      auth: {
        userId,
        userRole,
      },
      transports: ["websocket", "polling"],
    })

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected")
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected")
      this.handleReconnect()
    })

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      this.handleReconnect()
    })

    return this.socket
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.socket?.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  // Driver location updates
  updateDriverLocation(latitude: number, longitude: number) {
    this.socket?.emit("driver_location_update", {
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    })
  }

  // Subscribe to ride updates
  subscribeToRideUpdates(rideId: string, callback: (data: any) => void) {
    this.socket?.on(`ride_update_${rideId}`, callback)
  }

  // Unsubscribe from ride updates
  unsubscribeFromRideUpdates(rideId: string) {
    this.socket?.off(`ride_update_${rideId}`)
  }

  // Send ride status update
  updateRideStatus(rideId: string, status: string, data?: any) {
    this.socket?.emit("ride_status_update", {
      rideId,
      status,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  // Subscribe to driver location updates
  subscribeToDriverLocation(driverId: string, callback: (location: any) => void) {
    this.socket?.on(`driver_location_${driverId}`, callback)
  }

  // Send message in ride chat
  sendRideMessage(rideId: string, message: string, senderId: string) {
    this.socket?.emit("ride_message", {
      rideId,
      message,
      senderId,
      timestamp: new Date().toISOString(),
    })
  }

  // Subscribe to ride messages
  subscribeToRideMessages(rideId: string, callback: (message: any) => void) {
    this.socket?.on(`ride_message_${rideId}`, callback)
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  getSocket() {
    return this.socket
  }
}

export const websocketManager = new WebSocketManager()
