import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ChunkRecover } from "@/components/chunk-recover"
import { ErrorBoundary } from "@/components/error-boundary"

export const metadata: Metadata = {
  title: "RideShare Pro - Professional Transportation Platform",
  description: "Professional ride-sharing platform with cars, keke, and bikes",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ChunkRecover />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
