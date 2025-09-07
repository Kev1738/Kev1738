"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, AlertTriangle, RefreshCw, Clock, Wifi, WifiOff } from "lucide-react"

interface EnhancedLoadingProps {
  isLoading: boolean
  progress?: number
  stage?: string
  error?: string | null
  timeoutReached?: boolean
  onRetry?: () => void
  onCancel?: () => void
  showNetworkStatus?: boolean
  estimatedTime?: number
}

export function EnhancedLoading({
  isLoading,
  progress = 0,
  stage = "Loading...",
  error,
  timeoutReached = false,
  onRetry,
  onCancel,
  showNetworkStatus = true,
  estimatedTime,
}: EnhancedLoadingProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [networkSpeed, setNetworkSpeed] = useState<"slow" | "normal" | "fast">("normal")

  useEffect(() => {
    if (!isLoading) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial connection status
    setIsOnline(navigator.onLine)

    // Estimate network speed
    const connection = (navigator as any).connection
    if (connection) {
      const effectiveType = connection.effectiveType
      if (effectiveType === "slow-2g" || effectiveType === "2g") {
        setNetworkSpeed("slow")
      } else if (effectiveType === "3g") {
        setNetworkSpeed("normal")
      } else {
        setNetworkSpeed("fast")
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isLoading && !error && !timeoutReached) return null

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const getLoadingMessage = () => {
    if (error) return "An error occurred"
    if (timeoutReached) return "Request timed out"
    if (elapsedTime > 15000) return "This is taking longer than usual..."
    if (elapsedTime > 10000) return "Still working on it..."
    return stage
  }

  const getProgressColor = () => {
    if (error || timeoutReached) return "bg-red-500"
    if (elapsedTime > 15000) return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {error || timeoutReached ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            )}
            {error || timeoutReached ? "Request Failed" : "Processing"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getLoadingMessage()}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Time Information */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
            {estimatedTime && <span>Est: {formatTime(estimatedTime)}</span>}
          </div>

          {/* Network Status */}
          {showNetworkStatus && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
              {isOnline && (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    networkSpeed === "slow"
                      ? "bg-red-100 text-red-700"
                      : networkSpeed === "normal"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {networkSpeed === "slow"
                    ? "Slow connection"
                    : networkSpeed === "normal"
                      ? "Normal speed"
                      : "Fast connection"}
                </span>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Timeout Message */}
          {timeoutReached && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                The request is taking longer than expected. This might be due to:
              </p>
              <ul className="text-xs text-yellow-600 mt-2 list-disc list-inside">
                <li>Slow internet connection</li>
                <li>Server maintenance</li>
                <li>High server load</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {(error || timeoutReached) && onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
            )}
            {!error && !timeoutReached && elapsedTime > 20000 && (
              <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Refresh Page
              </Button>
            )}
          </div>

          {/* Support Information */}
          {(error || timeoutReached || elapsedTime > 30000) && (
            <div className="text-center text-xs text-gray-500 border-t pt-3">
              <p>Still having issues?</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => window.open("mailto:support@rideshare.com")}
                className="h-auto p-0 text-xs"
              >
                Contact Support
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
