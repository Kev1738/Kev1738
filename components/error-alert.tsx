"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mail } from "lucide-react"

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  showSupport?: boolean
  className?: string
}

export function ErrorAlert({ message, onRetry, showSupport = true, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-2">
        <span>{message}</span>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="bg-transparent">
              Try Again
            </Button>
          )}
          {showSupport && (
            <Button variant="outline" size="sm" className="bg-transparent">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
