"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

export function PageLoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg text-gray-600">{text}</p>
      </div>
    </div>
  )
}

export function CardLoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-2">
        <LoadingSpinner />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  )
}

export function InlineLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  )
}
