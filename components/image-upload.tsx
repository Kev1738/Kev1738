"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

interface ImageUploadProps {
  onUpload: (imageUrl: string) => void
  children?: React.ReactNode
}

export function ImageUpload({ onUpload, children }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("purpose", "profile_image")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      if (data.success) {
        onUpload(data.url)
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
        disabled={uploading}
      />
      <label htmlFor="image-upload" className="cursor-pointer">
        {children || (
          <Button variant="outline" disabled={uploading}>
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        )}
      </label>
    </div>
  )
}
