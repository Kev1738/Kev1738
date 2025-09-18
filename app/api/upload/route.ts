import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    console.log("📤 File upload API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(createErrorResponse(null, "Unauthorized"), { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const purpose = (formData.get("purpose") as string) || "profile_image"

    if (!file) {
      return NextResponse.json(createErrorResponse(null, "No file provided"), { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(createErrorResponse(null, "Invalid file type. Only images are allowed."), {
        status: 400,
      })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(createErrorResponse(null, "File too large. Maximum size is 5MB."), { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop()
    const fileName = `${user.id}/${purpose}/${timestamp}-${randomString}.${fileExtension}`

    console.log("📁 Uploading to Vercel Blob:", fileName)

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    console.log("✅ File uploaded to Blob:", blob.url)

    // Save file record to database
    const { data: uploadedFile, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: blob.url,
        upload_purpose: purpose,
        is_active: true,
      })
      .select()
      .single()

    if (dbError) {
      console.error("❌ Database save error:", dbError)
      // File uploaded but DB save failed - continue anyway
    }

    // If this is a profile image, update user's profile_image_url
    if (purpose === "profile_image") {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          profile_image_url: blob.url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("❌ Profile image update error:", updateError)
      }
    }

    console.log("✅ File upload complete")

    return NextResponse.json(
      createSuccessResponse(
        {
          url: blob.url,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedFile: uploadedFile,
        },
        "File uploaded successfully",
      ),
    )
  } catch (error) {
    console.error("💥 Upload error:", error)
    return NextResponse.json(createErrorResponse(error, "Upload failed"), { status: 500 })
  }
}
