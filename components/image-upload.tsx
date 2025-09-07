"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, Check } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  currentImage?: string
  onImageUploaded: (imageUrl: string) => void
  purpose: string
  className?: string
  size?: "sm" | "md" | "lg"
  fallbackText?: string
}

export function ImageUpload({
  currentImage,
  onImageUploaded,
  purpose,
  className,
  size = "md",
  fallbackText = "U",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  const handleFileSelect = (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP are allowed.")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert("File size too large. Maximum size is 5MB.")
      return
    }

    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setUploadSuccess(false)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("purpose", purpose)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onImageUploaded(result.data.url)
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 2000)
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert(error instanceof Error ? error.message : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative group cursor-pointer transition-all duration-200",
          dragOver && "scale-105",
          uploading && "pointer-events-none",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <Avatar className={cn(sizeClasses[size], "transition-all duration-200")}>
          <AvatarImage src={currentImage || "/placeholder.svg"} className="object-cover" />
          <AvatarFallback className="text-lg font-semibold bg-gray-100">
            {fallbackText.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            dragOver && "opacity-100 bg-blue-500/50",
            uploading && "opacity-100",
          )}
        >
          {uploading ? (
            <LoadingSpinner size="sm" className="text-white" />
          ) : uploadSuccess ? (
            <Check className="h-6 w-6 text-green-400" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Upload button for larger sizes */}
        {size === "lg" && !uploading && (
          <Button
            size="sm"
            variant="outline"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Drag and drop hint */}
      {dragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-full bg-blue-50/50 flex items-center justify-center">
          <p className="text-sm text-blue-600 font-medium">Drop image here</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload instructions */}
      {size === "lg" && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
        </div>
      )}
    </div>
  )
}
