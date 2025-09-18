"use client"

import type React from "react"

import { ErrorBoundary, SimpleErrorFallback } from "./error-boundary"

interface PageErrorBoundaryProps {
  children: React.ReactNode
  pageName?: string
}

export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageName ? `${pageName} Error` : "Page Error"}</h1>
            <SimpleErrorFallback error={error} reset={reset} />
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
