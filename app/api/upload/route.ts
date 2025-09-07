import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { put } from "@vercel/blob"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    console.log("📤 File upload API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const purpose = formData.get("purpose") as string

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    if (!purpose) {
      return NextResponse.json({ success: false, error: "Upload purpose is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 },
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File size too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `${user.id}/${purpose}/${timestamp}.${extension}`

    console.log("📁 Uploading file:", filename)

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("✅ File uploaded to blob:", blob.url)

    // Save file metadata to database
    const { data: uploadedFile, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: blob.url,
        upload_purpose: purpose,
      })
      .select()
      .single()

    if (dbError) {
      console.error("❌ Database error:", dbError)
      return NextResponse.json({ success: false, error: "Failed to save file metadata" }, { status: 500 })
    }

    console.log("✅ File metadata saved to database")

    return NextResponse.json(
      createSuccessResponse(
        {
          id: uploadedFile.id,
          url: blob.url,
          filename: file.name,
          size: file.size,
          type: file.type,
        },
        "File uploaded successfully",
      ),
    )
  } catch (error) {
    console.error("💥 Upload error:", error)
    return NextResponse.json(createErrorResponse(error, "File upload failed"), { status: 500 })
  }
}
