import { NextResponse } from "next/server"
import { createUser, getUserByEmail, updateUser, deleteUser } from "@/lib/database"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  const testEmail = `test-${Date.now()}@example.com`
  const testUserId = `test-user-${Date.now()}`

  try {
    const startTime = Date.now()
    const results = []

    // Test 1: Create User
    console.log("Testing user creation...")
    const hashedPassword = await hashPassword("testpassword123")
    const createResult = await createUser({
      email: testEmail,
      password_hash: hashedPassword,
      full_name: "Test User",
      phone: "+23276123456",
      role: "passenger",
    })

    if (!createResult.success) {
      throw new Error(`User creation failed: ${createResult.error}`)
    }

    results.push({ test: "Create User", status: "success", data: createResult.data })
    const userId = createResult.data.id

    // Test 2: Get User by Email
    console.log("Testing get user by email...")
    const getUserResult = await getUserByEmail(testEmail)

    if (!getUserResult.success) {
      throw new Error(`Get user failed: ${getUserResult.error}`)
    }

    results.push({ test: "Get User by Email", status: "success", data: getUserResult.data })

    // Test 3: Update User
    console.log("Testing user update...")
    const updateResult = await updateUser(userId, {
      full_name: "Updated Test User",
      phone: "+23276654321",
    })

    if (!updateResult.success) {
      throw new Error(`User update failed: ${updateResult.error}`)
    }

    results.push({ test: "Update User", status: "success", data: updateResult.data })

    // Test 4: Delete User (cleanup)
    console.log("Testing user deletion...")
    const deleteResult = await deleteUser(userId)

    if (!deleteResult.success) {
      throw new Error(`User deletion failed: ${deleteResult.error}`)
    }

    results.push({ test: "Delete User", status: "success" })

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: `All user operations completed successfully (${duration}ms)`,
      duration,
      data: {
        tests_run: results.length,
        results,
        test_user_email: testEmail,
      },
    })
  } catch (error) {
    console.error("User operations test error:", error)

    // Cleanup: try to delete test user if it was created
    try {
      const getUserResult = await getUserByEmail(testEmail)
      if (getUserResult.success && getUserResult.data) {
        await deleteUser(getUserResult.data.id)
      }
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError)
    }

    return NextResponse.json(
      {
        success: false,
        error: `User operations test failed: ${error}`,
        details: {
          error_type: error instanceof Error ? error.constructor.name : "Unknown",
          error_message: error instanceof Error ? error.message : String(error),
          test_email: testEmail,
        },
      },
      { status: 500 },
    )
  }
}
