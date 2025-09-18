"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, X } from "lucide-react"
import { useState } from "react"

interface ErrorAlertProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: "default" | "destructive"
  className?: string
}

export function ErrorAlert({
  title = "Error",
  message,
  onRetry,
  onDismiss,
  variant = "destructive",
  className,
}: ErrorAlertProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true)
      try {
        await onRetry()
      } finally {
        setIsRetrying(false)
      }
    }
  }

  return (
    <Alert variant={variant} className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss} className="h-auto p-1">
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export function NetworkErrorAlert({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorAlert
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  )
}

export function AuthErrorAlert({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorAlert
      title="Authentication Error"
      message="Your session has expired. Please log in again to continue."
      onRetry={onRetry}
    />
  )
}

export function ValidationErrorAlert({ errors }: { errors: string[] }) {
  return (
    <ErrorAlert
      title="Validation Error"
      message={
        <div>
          <p>Please fix the following errors:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      }
    />
  )
}

export function ApiErrorAlert({
  error,
  onRetry,
}: {
  error: { status?: number; message: string }
  onRetry?: () => void
}) {
  const getErrorTitle = (status?: number) => {
    switch (status) {
      case 400:
        return "Bad Request"
      case 401:
        return "Unauthorized"
      case 403:
        return "Forbidden"
      case 404:
        return "Not Found"
      case 500:
        return "Server Error"
      default:
        return "API Error"
    }
  }

  return <ErrorAlert title={getErrorTitle(error.status)} message={error.message} onRetry={onRetry} />
}
