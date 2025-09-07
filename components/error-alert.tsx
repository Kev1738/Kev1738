"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Mail } from "lucide-react"

interface ErrorAlertProps {
  title?: string
  message: string
  onRetry?: () => void
  showSupport?: boolean
}

export function ErrorAlert({ title = "Error", message, onRetry, showSupport = true }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {showSupport && (
            <Button size="sm" variant="outline" onClick={() => window.open("mailto:support@rideshare.com")}>
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
