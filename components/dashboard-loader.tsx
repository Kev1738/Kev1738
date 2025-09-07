"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLoadingState } from "@/hooks/use-loading-state"
import { EnhancedLoading } from "@/components/enhanced-loading"
import { ErrorAlert } from "@/components/error-alert"

interface DashboardLoaderProps {
  children: React.ReactNode
  userId: string
  userRole: string
  onDataLoaded?: (data: any) => void
}

export function DashboardLoader({ children, userId, userRole, onDataLoaded }: DashboardLoaderProps) {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  const loadingState = useLoadingState({
    timeout: 20000, // 20 second timeout for dashboard data
    onTimeout: () => {
      console.error("Dashboard data loading timed out")
    },
  })

  useEffect(() => {
    loadDashboardData()
  }, [userId, userRole])

  const loadDashboardData = async () => {
    try {
      loadingState.startLoading("Loading dashboard...")

      // Simulate progressive loading stages
      loadingState.updateProgress(20, "Fetching user profile...")

      // Load user-specific data based on role
      const endpoints = {
        passenger: [
          { url: "/api/rides/history", stage: "Loading ride history..." },
          { url: "/api/wallet/balance", stage: "Checking wallet balance..." },
        ],
        driver: [
          { url: "/api/driver/profile", stage: "Loading driver profile..." },
          { url: "/api/driver/earnings", stage: "Calculating earnings..." },
          { url: "/api/driver/rides", stage: "Loading active rides..." },
        ],
        admin: [
          { url: "/api/admin/stats", stage: "Loading system statistics..." },
          { url: "/api/admin/users", stage: "Fetching user data..." },
          { url: "/api/admin/rides", stage: "Loading ride analytics..." },
        ],
      }

      const roleEndpoints = endpoints[userRole as keyof typeof endpoints] || []
      const data: any = {}

      for (let i = 0; i < roleEndpoints.length; i++) {
        const endpoint = roleEndpoints[i]
        loadingState.updateProgress(30 + (i * 40) / roleEndpoints.length, endpoint.stage)

        try {
          const response = await fetch(endpoint.url, {
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
            },
          })

          if (response.ok) {
            const result = await response.json()
            data[endpoint.url] = result
          } else {
            console.warn(`Failed to load ${endpoint.url}:`, response.status)
            // Don't fail the entire load for individual endpoint failures
            data[endpoint.url] = null
          }
        } catch (error) {
          console.warn(`Error loading ${endpoint.url}:`, error)
          data[endpoint.url] = null
        }
      }

      loadingState.updateProgress(90, "Preparing dashboard...")

      setDashboardData(data)
      onDataLoaded?.(data)

      loadingState.updateProgress(100, "Dashboard ready!")

      // Small delay to show completion
      setTimeout(() => {
        loadingState.finishLoading()
        setIsReady(true)
      }, 500)
    } catch (error) {
      console.error("💥 Dashboard loading failed:", error)
      loadingState.setError(error instanceof Error ? error.message : "Failed to load dashboard data. Please try again.")
    }
  }

  const handleRetry = () => {
    setIsReady(false)
    setDashboardData(null)
    loadDashboardData()
  }

  // Show loading state
  if (loadingState.isLoading) {
    return (
      <EnhancedLoading
        isLoading={true}
        progress={loadingState.progress}
        stage={loadingState.stage}
        showNetworkStatus={true}
        estimatedTime={10000}
        onCancel={() => (window.location.href = "/")}
      />
    )
  }

  // Show error state
  if (loadingState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ErrorAlert
            title="Dashboard Loading Failed"
            message={loadingState.error}
            onRetry={handleRetry}
            showSupport={true}
          />
        </div>
      </div>
    )
  }

  // Show timeout state
  if (loadingState.timeoutReached) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ErrorAlert
            title="Loading Timeout"
            message="Dashboard is taking longer than expected to load. This might be due to slow internet or server issues."
            onRetry={handleRetry}
            showSupport={true}
          />
        </div>
      </div>
    )
  }

  // Dashboard is ready, render children
  if (isReady) {
    return <>{children}</>
  }

  // Fallback loading state
  return <EnhancedLoading isLoading={true} progress={95} stage="Finalizing dashboard..." showNetworkStatus={false} />
}
