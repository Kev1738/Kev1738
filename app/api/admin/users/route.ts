import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("👥 Admin get users API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""

    const offset = (page - 1) * limit

    // Build query
    let query = supabase.from("users").select(
      `
        id,
        email,
        full_name,
        phone,
        role,
        is_verified,
        is_active,
        profile_image_url,
        date_of_birth,
        gender,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        created_at,
        updated_at,
        driver_profiles (
          id,
          license_number,
          is_online,
          status,
          rating,
          total_rides,
          total_earnings,
          vehicles (
            id,
            vehicle_type,
            make,
            model,
            year,
            color,
            plate_number,
            is_active
          )
        ),
        passenger_profiles (
          id,
          preferred_payment_method
        ),
        wallets (
          id,
          balance,
          is_active
        )
      `,
      { count: "exact" },
    )

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq("role", role)
    }

    if (status === "active") {
      query = query.eq("is_active", true)
    } else if (status === "inactive") {
      query = query.eq("is_active", false)
    }

    // Apply pagination and ordering
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error("❌ Users fetch error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
    }

    // Transform data to include computed status
    const transformedUsers =
      users?.map((user) => ({
        ...user,
        status: user.is_active ? "active" : "inactive",
        driver_info: user.driver_profiles?.[0] || null,
        passenger_info: user.passenger_profiles?.[0] || null,
        wallet_info: user.wallets?.[0] || null,
      })) || []

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json(
      createSuccessResponse(
        {
          users: transformedUsers,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        "Users fetched successfully",
      ),
    )
  } catch (error) {
    console.error("💥 Admin get users error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch users"), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("➕ Admin create user API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const userData = await request.json()
    const { email, password, full_name, phone, role, ...additionalData } = userData

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, full name, and role are required",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 409 },
      )
    }

    // Hash password (using simple MD5 for demo - use bcrypt in production)
    const crypto = require("crypto")
    const hashedPassword = crypto
      .createHash("md5")
      .update(password + "salt")
      .digest("hex")

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        role,
        is_verified: additionalData.is_verified || false,
        is_active: additionalData.is_active !== false, // Default to true
        profile_image_url: additionalData.profile_image_url || null,
        date_of_birth: additionalData.date_of_birth || null,
        gender: additionalData.gender || null,
        address: additionalData.address || null,
        emergency_contact_name: additionalData.emergency_contact_name || null,
        emergency_contact_phone: additionalData.emergency_contact_phone || null,
      })
      .select()
      .single()

    if (userError) {
      console.error("❌ User creation error:", userError)
      return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }

    // Create role-specific profile
    if (role === "driver") {
      const { error: driverError } = await supabase.from("driver_profiles").insert({
        user_id: newUser.id,
        is_online: false,
        status: "offline",
        rating: 5.0,
        total_rides: 0,
        total_earnings: 0.0,
      })

      if (driverError) {
        console.warn("⚠️ Driver profile creation error:", driverError)
      }
    } else if (role === "passenger") {
      const { error: passengerError } = await supabase.from("passenger_profiles").insert({
        user_id: newUser.id,
        preferred_payment_method: "card",
      })

      if (passengerError) {
        console.warn("⚠️ Passenger profile creation error:", passengerError)
      }
    }

    // Create wallet
    const { error: walletError } = await supabase.from("wallets").insert({
      user_id: newUser.id,
      balance: 0.0,
      is_active: true,
    })

    if (walletError) {
      console.warn("⚠️ Wallet creation error:", walletError)
    }

    return NextResponse.json(createSuccessResponse(newUser, "User created successfully"))
  } catch (error) {
    console.error("💥 Admin create user error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to create user"), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Admin update user API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const userData = await request.json()
    const { id, ...updateData } = userData

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ User update error:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json(createSuccessResponse(updatedUser, "User updated successfully"))
  } catch (error) {
    console.error("💥 Admin update user error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update user"), { status: 500 })
  }
}
