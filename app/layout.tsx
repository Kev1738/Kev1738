import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Muf - Ride Sharing Platform",
  description:
    "Your reliable ride sharing platform for Sierra Leone - Safe, affordable, and convenient transportation across Freetown, Bo, Kenema, and beyond",
  keywords: "Sierra Leone, ride sharing, transportation, Freetown, Bo, Kenema, okada, keke, taxi, mobile money",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
